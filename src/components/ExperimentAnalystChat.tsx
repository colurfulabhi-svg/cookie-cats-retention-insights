import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import { BarChart3, RotateCcw } from "lucide-react";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cookie-cats-analyst-chat";
const SUGGESTIONS = [
  "Explain the result in plain English",
  "Why is 1-day retention not significant?",
  "What does p = 0.0016 actually mean?",
  "What are the limitations of this test?",
];

function loadMessages(): UIMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function ChatWindow({ initial, onReset }: { initial: UIMessage[]; onReset: () => void }) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, status, stop, error } = useChat({
    id: "cookie-cats-analyst",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (status === "ready" || status === "error") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      textareaRef.current?.focus();
    }
  }, [messages, status]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput("");
  };

  return (
    <div className="flex h-[560px] flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-md border border-primary/30 bg-primary/10 text-primary">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Experiment Analyst</p>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">AI-powered · grounded in this test's results</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset} disabled={busy}>
            <RotateCcw /> New conversation
          </Button>
        )}
      </div>

      <Conversation className="flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ask about the experiment"
              description="Recruiters and hiring managers can ask how the analysis works and what the numbers mean."
              icon={<BarChart3 className="size-8 text-primary" />}
            >
              <div className="mt-2 flex flex-col items-center gap-3">
                <p className="text-sm font-medium">Ask about the experiment</p>
                <p className="max-w-sm text-center text-xs text-muted-foreground">Recruiters and hiring managers can ask how the analysis works and what the numbers mean.</p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <Button key={s} variant="outline" size="sm" onClick={() => send(s)}>{s}</Button>
                  ))}
                </div>
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => (
              <Message from={m.role} key={m.id}>
                <MessageContent className={m.role === "user" ? "bg-primary text-primary-foreground" : "bg-transparent"}>
                  {m.parts.map((p, i) =>
                    p.type === "text" ? (
                      m.role === "user" ? <span key={i}>{p.text}</span> : <MessageResponse key={i}>{p.text}</MessageResponse>
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer className="text-sm">Analyzing the results...</Shimmer>}
          {error && <p className="text-sm text-destructive">{error.message || "Something went wrong. Please try again."}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-4">
        <PromptInput onSubmit={(msg) => send(msg.text ?? "")}>
          <PromptInputTextarea
            ref={textareaRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="e.g. Why did you run an SRM check first?"
          />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export function ExperimentAnalystChat() {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [key, setKey] = useState(0);
  useEffect(() => setInitial(loadMessages()), []);

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setInitial([]);
    setKey((k) => k + 1);
  };

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border bg-panel backdrop-blur" aria-label="Ask the Experiment Analyst">
      {initial === null ? <div className="h-[560px]" /> : <ChatWindow key={key} initial={initial} onReset={reset} />}
    </section>
  );
}
