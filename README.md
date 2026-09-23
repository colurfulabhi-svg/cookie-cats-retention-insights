# Cookie Cats Retention Insights

Create an interactive, professional A/B Testing & Data Analytics Portfolio Dashboard for a Mobile Game Retention Analysis ("Cookie Cats").

### App Purpose & Features:

1. Executive Overview & Business Case:

   - Header: "Cookie Cats: Mobile Game Gate Placement A/B Test Analysis"

   - Problem Statement: Should the level gate be moved from Level 30 (Control) to Level 40 (Treatment)?

   - Final Recommendation Banner: Highlight "Keep Gate at Level 30 (Statistically Significant +0.82% 7-Day Retention Gain, p = 0.0016)".

2. Interactive Data & Statistical Metrics Dashboard:

   - Summary Metric Cards:

     * Total Sample Size: 90,188 clean records (1 outlier >40,000 rounds removed)

     * SRM Check (Chi-Square): Gate 30 (44,699) vs Gate 40 (45,489) | p-value: 0.0085 (Passed)

     * 1-Day Retention: Gate 30 (44.82%) vs Gate 40 (44.23%) | Z-Test p-value: 0.0739 (Not Significant)

     * 7-Day Retention: Gate 30 (19.02%) vs Gate 40 (18.20%) | Z-Test p-value: 0.0016 (Statistically Significant, Alpha = 0.05)

3. Visualizations & Charts (Recharts / Chart.js):

   - Bar Chart: 1-Day vs 7-Day Retention rates comparison between Gate 30 and Gate 40.

   - Interactive Scenario Calculator / Simulator: Allow users to adjust hypothetical player monthly active users (MAU) to estimate retained users and ad revenue preserved by keeping Gate 30.

4. Python Code & Methodology Drawer/Tab:

   - Include a code viewer showing the complete `ab.py` analysis script using Pandas, SciPy (Chi-Square SRM), Statsmodels (Two-Sample Z-Test), and Seaborn.

   - Add a download button for `cookie_cats.csv` dataset and raw analysis file.

### Styling & Theme:

- Clean, modern, dark-mode data platform aesthetic (Tailwind CSS, Lucide icons, glassmorphism card style).

- Professional portfolio look tailored for Data Science recruiters and hiring managers.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ef07597a-7396-4b97-b3d2-d71b357ceae5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
