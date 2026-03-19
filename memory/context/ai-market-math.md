# Research: AI Market Arbitrage (Random Forest & Math)

- **Source:** "100+ signals, 38 indicators. How we hit 80% win rate with AI and math"
- **Key Philosophy:** Stop trading on feelings or news. Use a **Random Forest** ensemble model (100+ sub-models) to calculate the "True Probability" of an outcome, then only buy when the market price is a massive discount to that true probability.

## The Mathematical Stack
- **Model:** Random Forest (Ensemble of decision trees).
- **Core Logic:** `market_price <= (model_probability * 0.5)`. This creates a "Margin of Safety"—even if the model is off by 20%, you are still in profit.
- **Confidence Threshold:** Only enter when the model is >70% confident.

## Key Metrics for Evaluation
- **Win Rate is a Lie:** 80% win rate doesn't matter if losses are huge.
- **The True Metric:** **Sharpe Ratio (SR)**.
  - `SR = (Mean Returns - Risk Free Rate) / Standard Deviation`.
  - Goal: SR > 2 (Excellent).
- **Log Returns:** Use `ln(P1 / P0)` instead of simple percentage change. Log returns are additive and correctly handle large swings (a -50% drop and +100% gain have the same magnitude in log space).

## Entry & Exit Strategy
- **Entry:** `market_price <= model_probability * 0.5` (Buy at 2x below real value).
- **Exit Target:** `market_price >= model_probability * 0.9` (Sell when market corrects to 90% of true value).
- **Time Exit:** `days_to_expiry <= 7` (Exit before theta/time decay kills the position).

## Performance Diagnostics
- **MAE (Maximum Adverse Excursion):** How deep the position went into the red.
- **MFE (Maximum Favorable Excursion):** How high it went before you sold.
  - If MFE is high but you sold low, your exit strategy is leaving money on the table.

## Strategic Takeaway for Gunner
- **Lead Scoring as "Arbitrage":** We can apply this exact Random Forest logic to **GHL Lead Scoring**. Instead of a simple "hot/cold" tag, we calculate a "True Conversion Probability" (0.0 to 1.0) based on 100+ factors (call sentiment, previous touches, property equity, motivation score).
- **Resource Allocation:** Only have the team call leads where the "Model Probability" is high but the "Current Engagement" (Market Price) is low.
