"""Cookie Cats gate-placement A/B test analysis."""
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
allocation = clean["version"].value_counts().reindex(["gate_30", "gate_40"])
expected = [len(clean) / 2, len(clean) / 2]
chi2, srm_p = chisquare(allocation.values, f_exp=expected)

# Two-sided, two-sample proportion z-tests.
def retention_test(column: str) -> dict[str, float]:
    grouped = clean.groupby("version")[column].agg(["sum", "count"])
    grouped = grouped.reindex(["gate_30", "gate_40"])
    z_stat, p_value = proportions_ztest(grouped["sum"], grouped["count"])
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
ax = sns.barplot(data=plot_df, x="window", y="retained", hue="version")
ax.set(title="Cookie Cats retention by gate", xlabel="", ylabel="Retention rate")
ax.yaxis.set_major_formatter(lambda value, _: f"{value:.0%}")
plt.tight_layout()
plt.savefig("cookie_cats_retention.png", dpi=180)
