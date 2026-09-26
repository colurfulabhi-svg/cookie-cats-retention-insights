import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AreaChart,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clipboard,
  Code2,
  Database,
  Download,
  FlaskConical,
  Info,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ExperimentAnalystChat } from "@/components/ExperimentAnalystChat";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cookie Cats A/B Test | Retention Analytics Portfolio" },
      {
        name: "description",
        content: "An interactive analysis of Cookie Cats gate placement and its effect on player retention.",
      },
      { property: "og:title", content: "Cookie Cats: Gate Placement A/B Test" },
      {
        property: "og:description",
        content: "Explore experiment health, retention lift, statistical significance, and business impact.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CookieCatsDashboard,
});

const retentionData = [
  { window: "Day 1", gate30: 44.82, gate40: 44.23 },
  { window: "Day 7", gate30: 19.02, gate40: 18.2 },
];

const pythonCode = `"""Cookie Cats gate-placement A/B test analysis."""
from pathlib import Path
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import chisquare
from statsmodels.stats.proportion import proportions_ztest

DATA = Path(__file__).with_name("cookie_cats.csv")
ALPHA = 0.05

# Load and clean the experiment export.
df = pd.read_csv(DATA)
clean = df.loc[df["sum_gamerounds"] <= 40_000].copy()

# Sample ratio mismatch (SRM) diagnostic.
allocation = clean["version"].value_counts().reindex(
    ["gate_30", "gate_40"]
)
expected = [len(clean) / 2, len(clean) / 2]
chi2, srm_p = chisquare(allocation.values, f_exp=expected)

# Two-sided, two-sample proportion z-tests.
def retention_test(column: str) -> dict[str, float]:
    grouped = clean.groupby("version")[column].agg(["sum", "count"])
    grouped = grouped.reindex(["gate_30", "gate_40"])
    z_stat, p_value = proportions_ztest(
        grouped["sum"], grouped["count"]
    )
    rates = grouped["sum"] / grouped["count"]
    return {
        "gate_30": rates.loc["gate_30"],
        "gate_40": rates.loc["gate_40"],
        "lift_pp": 100 * (rates.loc["gate_30"] - rates.loc["gate_40"]),
        "z_stat": z_stat,
        "p_value": p_value,
    }

results = {
    "retention_1": retention_test("retention_1"),
    "retention_7": retention_test("retention_7"),
}

print(f"Clean sample: {len(clean):,}")
print(f"Allocation: {allocation.to_dict()} | SRM p={srm_p:.4f}")
for metric, result in results.items():
    decision = "significant" if result["p_value"] < ALPHA else "not significant"
    print(metric, result, decision)

# Recruiter-friendly comparison plot.
plot_df = clean.melt(
    id_vars="version",
    value_vars=["retention_1", "retention_7"],
    var_name="window",
    value_name="retained",
)
sns.set_theme(style="whitegrid")
ax = sns.barplot(
    data=plot_df, x="window", y="retained", hue="version"
)
ax.set(
    title="Cookie Cats retention by gate",
    xlabel="",
    ylabel="Retention rate",
)
ax.yaxis.set_major_formatter(lambda value, _: f"{value:.0%}")
plt.tight_layout()
plt.savefig("cookie_cats_retention.png", dpi=180)`;

const metrics = [
  {
    label: "Clean sample",
    value: "90,188",
    detail: "1 high-play outlier removed",
    icon: Database,
    tag: "QA complete",
    tone: "success",
  },
  {
    label: "SRM check",
    value: "p = 0.0085",
    detail: "44,699 control · 45,489 treatment",
    icon: ShieldCheck,
    tag: "Passed",
    tone: "success",
  },
  {
    label: "1-day retention",
    value: "+0.59 pp",
    detail: "44.82% vs 44.23% · p = 0.0739",
    icon: TrendingUp,
    tag: "Not significant",
    tone: "neutral",
  },
  {
    label: "7-day retention",
    value: "+0.82 pp",
    detail: "19.02% vs 18.20% · p = 0.0016",
    icon: Target,
    tag: "Significant",
    tone: "success",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function CodeDrawer() {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-border bg-panel text-foreground hover:bg-accent">
          <Code2 /> Methodology & code
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full border-border bg-background p-0 sm:max-w-3xl">
        <SheetHeader className="border-b border-border px-6 py-5 pr-14">
          <div className="flex items-center gap-2 text-primary">
            <Code2 className="size-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Reproducible analysis</span>
          </div>
          <SheetTitle className="text-2xl">Methodology & Python</SheetTitle>
          <SheetDescription>
            Pandas cleaning, SciPy allocation check, Statsmodels z-tests, and Seaborn output.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-wrap gap-2 border-b border-border px-6 py-4">
          <Button onClick={copyCode} variant="secondary" size="sm">
            {copied ? <Check /> : <Clipboard />} {copied ? "Copied" : "Copy code"}
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/downloads/ab.py" download><Download /> ab.py</a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href="/downloads/cookie_cats.csv" download><Database /> cookie_cats.csv</a>
          </Button>
        </div>
        <div className="h-[calc(100vh-166px)] overflow-auto bg-panel px-4 py-5 sm:px-6">
          <pre className="min-w-[680px] whitespace-pre-wrap font-mono text-xs leading-6 text-foreground">
            <code>{pythonCode}</code>
          </pre>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function CookieCatsDashboard() {
  const [mau, setMau] = useState(1_000_000);
  const retained = mau * 0.0082;
  const annualRevenue = retained * 1.25 * 12;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Experiment Lab</p>
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Portfolio case study · 2026</p>
            </div>
          </div>
          <CodeDrawer />
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="grid gap-7 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase text-primary">
              <span className="inline-block size-2 rounded-full bg-success" /> Experiment complete
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Cookie Cats: Mobile Game Gate Placement A/B Test Analysis
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
              Should the progression gate move from Level 30 (control) to Level 40 (treatment)?
            </p>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span>ALPHA 0.05</span><span className="text-border">/</span><span>TWO-SIDED Z-TEST</span>
          </div>
        </section>

        <section className="my-6 overflow-hidden rounded-lg border border-success/35 bg-success/10">
          <div className="grid sm:grid-cols-[auto_1fr_auto] sm:items-center">
            <div className="flex h-full items-center justify-center bg-success/15 p-5 text-success">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="px-5 py-5">
              <p className="font-mono text-xs font-semibold uppercase text-success">Final recommendation</p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">Keep Gate at Level 30</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Statistically significant <span className="font-semibold text-foreground">+0.82% 7-day retention gain</span> · p = 0.0016
              </p>
            </div>
            <div className="border-t border-success/25 px-5 py-4 sm:border-l sm:border-t-0">
              <p className="font-mono text-[10px] uppercase text-muted-foreground">Decision confidence</p>
              <p className="mt-1 text-lg font-bold text-success">99.84%</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="metrics-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="metrics-title" className="font-mono text-xs font-semibold uppercase text-muted-foreground">Experiment readout</h2>
            <span className="font-mono text-[10px] text-muted-foreground">CLEANED DATASET</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article key={metric.label} className="rounded-lg border border-border bg-panel p-5 backdrop-blur-md">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-9 items-center justify-center rounded-md bg-secondary text-muted-foreground"><Icon className="size-4" /></div>
                    <span className={metric.tone === "success" ? "rounded-sm bg-success/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase text-success" : "rounded-sm bg-secondary px-2 py-1 font-mono text-[10px] font-semibold uppercase text-muted-foreground"}>{metric.tag}</span>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-2xl font-bold">{metric.value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{metric.detail}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <article className="rounded-lg border border-border bg-panel p-5 backdrop-blur-md sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-primary"><BarChart3 className="size-4" /><span className="font-mono text-xs uppercase">Primary metrics</span></div>
                <h2 className="mt-2 text-xl font-bold">Retention by experiment group</h2>
                <p className="mt-1 text-sm text-muted-foreground">Observed player return rates after assignment.</p>
              </div>
              <div className="rounded-md border border-border bg-secondary/50 px-3 py-2 text-right">
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Winning variant</p>
                <p className="text-sm font-semibold text-success">Gate 30 · Control</p>
              </div>
            </div>
            <div className="mt-6 h-[310px] w-full" aria-label="Bar chart comparing retention rates">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={retentionData} barGap={8} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="window" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis domain={[0, 50]} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${value}%`} />
                  <Tooltip cursor={{ fill: "var(--accent)", opacity: 0.28 }} contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "6px", color: "var(--popover-foreground)" }} formatter={(value) => [`${Number(value).toFixed(2)}%`]} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  <Bar name="Gate 30 · Control" dataKey="gate30" fill="var(--primary)" radius={[3, 3, 0, 0]} maxBarSize={64} />
                  <Bar name="Gate 40 · Treatment" dataKey="gate40" fill="var(--muted-foreground)" radius={[3, 3, 0, 0]} maxBarSize={64} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-3.5 shrink-0 text-primary" />Day 1 directionally favors Gate 30, but does not cross the 0.05 significance threshold.</p>
              <p className="flex gap-2 text-xs leading-5 text-muted-foreground"><Sparkles className="mt-0.5 size-3.5 shrink-0 text-success" />Day 7 provides strong evidence that moving the gate reduces long-term retention.</p>
            </div>
          </article>

          <article className="rounded-lg border border-border bg-panel p-5 backdrop-blur-md sm:p-6">
            <div className="flex items-center gap-2 text-primary"><AreaChart className="size-4" /><span className="font-mono text-xs uppercase">Scenario model</span></div>
            <h2 className="mt-2 text-xl font-bold">Business impact simulator</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Scale the observed 0.82 percentage-point lift to your player base.</p>

            <div className="mt-7 rounded-md border border-border bg-secondary/40 p-4">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="mau-slider" className="text-sm font-medium">Monthly active users</label>
                <output className="font-mono text-lg font-semibold text-primary">{formatNumber(mau)}</output>
              </div>
              <Slider id="mau-slider" className="mt-5" min={100_000} max={10_000_000} step={100_000} value={[mau]} onValueChange={(value) => setMau(value[0] ?? 1_000_000)} aria-label="Monthly active users" />
              <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground"><span>100K</span><span>10M</span></div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <div className="rounded-md border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-primary"><Users className="size-4" /><span className="font-mono text-[10px] uppercase">Players retained</span></div>
                <p className="mt-2 text-2xl font-bold">+{formatNumber(retained)}</p>
                <p className="mt-1 text-xs text-muted-foreground">additional Day-7 players / month</p>
              </div>
              <div className="rounded-md border border-success/20 bg-success/5 p-4">
                <div className="flex items-center gap-2 text-success"><ArrowUpRight className="size-4" /><span className="font-mono text-[10px] uppercase">Revenue preserved</span></div>
                <p className="mt-2 text-2xl font-bold">{formatCurrency(annualRevenue)}</p>
                <p className="mt-1 text-xs text-muted-foreground">estimated annual ad revenue</p>
              </div>
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">Model assumption: each additional retained player generates $1.25 monthly ad revenue for 12 months. Directional estimate, not a causal revenue forecast.</p>
          </article>
        </section>

        <ExperimentAnalystChat />


        <footer className="mt-8 flex flex-col gap-4 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Cookie Cats retention analysis · Product experimentation portfolio</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="ghost" size="sm"><a href="/downloads/cookie_cats.csv" download><Download /> Dataset</a></Button>
            <Button asChild variant="ghost" size="sm"><a href="/downloads/ab.py" download><Download /> Analysis</a></Button>
          </div>
        </footer>
      </div>
    </main>
  );
}