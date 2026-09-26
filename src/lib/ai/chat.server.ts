import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.server";

const MODEL = "openai/gpt-6-astra";
const BASE_URL = "https://ai.gateway.lovable.dev/v1";

const SYSTEM = `You are the "Experiment Analyst" for a data-science portfolio case study: the Cookie Cats mobile game A/B test. You answer questions from recruiters and hiring managers, explaining the statistics clearly, accurately and concisely (usually under 180 words, markdown allowed). Adapt depth: plain language for non-technical readers, rigorous detail when asked.

FACTS (never invent other numbers):
- Question: move the progression gate from Level 30 (control, gate_30) to Level 40 (treatment, gate_40)?
- Data: 90,189 raw player records; 1 outlier with >40,000 game rounds removed -> 90,188 clean records. Columns: userid, version, sum_gamerounds, retention_1, retention_7.
- Sample Ratio Mismatch check: chi-square goodness-of-fit vs 50/50 split. Gate 30 = 44,699, Gate 40 = 45,489, p = 0.0085. The dashboard labels this "Passed" as the integrity gate; if asked, be honest that at alpha = 0.05 p = 0.0085 would formally indicate an imbalance (~0.9 pp), which is small in practical terms and worth noting as a caveat.
- 1-day retention: Gate 30 44.82% vs Gate 40 44.23% (+0.59 pp for Gate 30). Two-sample proportions z-test p = 0.0739 -> not significant at alpha 0.05.
- 7-day retention: Gate 30 19.02% vs Gate 40 18.20% (+0.82 pp for Gate 30). Two-sample proportions z-test p = 0.0016 -> significant at alpha 0.05.
- Recommendation: keep the gate at Level 30.
- Tools: Python, Pandas, SciPy (chisquare), Statsmodels (proportions_ztest), Seaborn; dashboard in React + Recharts.
- MAU simulator: extra retained players = MAU x 0.0082; annual revenue = retained x $1.25 x 12 (directional assumption, not causal forecast).
- Plausible interpretation: an earlier gate creates a break/anticipation that sustains longer-term engagement (hedonic adaptation), but this is a hypothesis, not proven by the test.
Stay on topic (this experiment, A/B testing, statistics, the candidate's methodology). Politely decline unrelated requests.`;

const bodySchema = z.object({ messages: z.array(z.any()).min(1).max(60) });

export async function handleChat(request: Request) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return Response.json({ error: "AI is not configured." }, { status: 500 });

  let messages: UIMessage[];
  try {
    messages = bodySchema.parse(await request.json()).messages as UIMessage[];
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: BASE_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    system: SYSTEM,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: true,
      onError: (error) => {
        console.error("chat error", error);
        const status = (error as { statusCode?: number })?.statusCode;
        if (status === 429) return "The analyst is busy right now. Please try again in a moment.";
        if (status === 402 || status === 403) return "AI usage limit reached for this site. Please try again later.";
        return "Something went wrong answering that question. Please try again.";
      },
    }),
    runIdFetch,
  );
}
