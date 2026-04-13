"use client";
import { useState } from "react";
export default function Home() {
const [address, setAddress] = useState("");
const [purchasePrice, setPurchasePrice] = useState("");
const [originalPrice, setOriginalPrice] = useState("");
const [targetPrice, setTargetPrice] = useState("");
const [arv, setArv] = useState("");
const [rent, setRent] = useState("");
const [repairCost, setRepairCost] = useState("");
const [notes, setNotes] = useState("");
const [strategy, setStrategy] = useState("");
const [result, setResult] = useState<{
  score: number;
  risk: string;
  strategy: string;
  recommendation: string;
  summary: string;
  signals: string[];
  insight: string;
  mao: number;
spread: number;
marginPercent: number;
rentToPricePercent: number;
discountPercent: number;
bestStrategy: {
  strategy: string;
  score: number;
} | null;
runnerUp: {
  strategy: string;
  score: number;
} | null;
allStrategies: {
  strategy: string;
  score: number;
}[];
} | null>(null);

const [baselineResult, setBaselineResult] = useState<{
  score: number;
  risk: string;
  strategy: string;
  recommendation: string;
  summary: string;
  signals: string[];
  insight: string;
  mao: number;
  spread: number;
  marginPercent: number;
  rentToPricePercent: number;
  discountPercent: number;
  runnerUp: {
  strategy: string;
  score: number;
} | null;
} | null>(null);

const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const needsArv = strategy === "Flip" || strategy === "Wholesale";
const needsRent = strategy === "Rental";

const missingRequiredFieldMessage =
  !address.trim()
    ? "Enter property address."
    : !purchasePrice
    ? "Enter purchase price."
    : !repairCost
    ? "Enter repair cost."
    : !strategy
    ? "Select a deal strategy."
    : needsArv && !arv
    ? `Enter ARV to analyze a ${strategy} deal.`
    : needsRent && !rent
    ? "Enter monthly rent to analyze a Rental deal."
    : "";

const disabled = !!missingRequiredFieldMessage || loading;

function clearForm() {
setAddress("");
setPurchasePrice("");
setTargetPrice("");
setArv("");
setRent("");
setRepairCost("");
setNotes("");
setStrategy("");
setResult(null);
setBaselineResult(null);
setError("");
setLoading(false);
}

async function analyzeDeal() {
  setLoading(true);
  if (!originalPrice) {
  setOriginalPrice(purchasePrice);
}
  setError("");
  setResult(null);

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  address,
  purchasePrice: targetPrice || purchasePrice,
  arv,
  rent,
  repairCost,
  notes,
  strategy,
}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    if (!targetPrice && !baselineResult) {
  setBaselineResult(data);
}

setResult(data);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unexpected error occurred.";
    setError(message);
  } finally {
    setLoading(false);
  }
}

  let dealLabel = "";
let winnerExplanation = "";
let insight = "";
let confidenceLabel = "";
let confidenceExplanation = "";
let confidenceDrivers: string[] = [];
let decision = "";
let decisionReason = "";

let targetPriceText = "";
let priceGapText = "";
let negotiationGuidance = "";

let dealToneBg = "#f3f4f6";
let dealToneBorder = "#d1d5db";
let dealToneText = "#111827";

if (result) {
  if (result.score >= 80) dealLabel = "Strong Deal";
  else if (result.score >= 60) dealLabel = "Borderline";
  else dealLabel = "Avoid";

    const scoreGap =
  result.runnerUp && result.bestStrategy
    ? result.bestStrategy.score - result.runnerUp.score
    : 0;

if (result.score >= 80 && scoreGap >= 10) {
  confidenceLabel = "High";
  confidenceExplanation =
    "The winning strategy has both a strong overall score and a clear lead over the runner-up.";
} else if (result.score >= 60 && scoreGap >= 3) {
  confidenceLabel = "Medium";
  confidenceExplanation =
    "The winning strategy has a modest lead, but the deal still shows some tighter or mixed signals.";
} else {
  confidenceLabel = "Low";
  confidenceExplanation =
    "The winning strategy is only narrowly ahead or the overall deal strength is weak.";
}

// DECISION ENGINE
if (result.score >= 80 && confidenceLabel === "High") {
  decision = "BUY";
} else if (result.score >= 65) {
  decision = "NEGOTIATE";
} else {
  decision = "PASS";
}

// FORCE LOW CONFIDENCE IF PASS
if (decision === "PASS") {
  confidenceLabel = "Low";
}

if (scoreGap < 6) {
  confidenceDrivers.push("Strategies are nearly tied.");
} else if (scoreGap < 10) {
  confidenceDrivers.push("Score gap between strategies is small.");
}

if (result.strategy === "Flip") {

  if (result.marginPercent < 25) {
    confidenceDrivers.push("Margin is thin.");
  } else if (result.marginPercent <= 35) {
    confidenceDrivers.push("Margin is moderate.");
  } else {
    confidenceDrivers.push("Margin is strong.");
  }

  if (result.mao && Number(purchasePrice) >= result.mao * 0.95) {
    confidenceDrivers.push("Purchase price is close to MAO.");
  } else {
    confidenceDrivers.push("Purchase price is comfortably below MAO.");
  }

} else if (result.strategy === "Rental") {

  if (result.rentToPricePercent < 10) {
    confidenceDrivers.push("Rent-to-price ratio is not especially strong.");
  } else {
    confidenceDrivers.push("Rent-to-price ratio is solid.");
  }

  if (result.rentToPricePercent < 8) {
    confidenceDrivers.push("Rental performance may be too thin.");
  } else {
    confidenceDrivers.push("Rental income supports the deal.");
  }

}

if (confidenceDrivers.length === 0) {
  confidenceDrivers.push("The winning strategy shows strong separation from the alternatives.");
}

  if (result.score >= 80) {
    dealToneBg = "#ecfdf5";
    dealToneBorder = "#86efac";
    dealToneText = "#166534";
  } else if (result.score >= 60) {
    dealToneBg = "#fffbeb";
    dealToneBorder = "#fcd34d";
    dealToneText = "#92400e";
  } else {
    dealToneBg = "#fef2f2";
    dealToneBorder = "#fca5a5";
    dealToneText = "#991b1b";
  }

  let dealStrength = "";

  if (result.bestStrategy) {
    const winner = result.bestStrategy.strategy;
    const score = result.bestStrategy.score;
    const runnerUp = result.runnerUp;

    if (result.score >= 75) {
      dealStrength = "This is a strong deal.";
    } else if (result.score >= 60) {
      dealStrength = "This is a moderate deal with some risk.";
    } else {
      dealStrength = "This deal is weak overall.";
    }

if (result.score >= 80 && confidenceLabel === "High") {
  decision = "BUY";
} else if (result.score >= 65) {
  decision = "NEGOTIATE";
} else {
  decision = "PASS";
}

const purchase = Number(purchasePrice);

if (decision === "BUY") {
  decisionReason = "Strong metrics and clear strategic advantage.";

  targetPriceText = `$${Math.round(result.mao).toLocaleString()}`;
  priceGapText =
    result.mao >= purchase
      ? `$${Math.round(result.mao - purchase).toLocaleString()} below target`
      : `$${Math.round(purchase - result.mao).toLocaleString()} above target`;

  negotiationGuidance =
    result.mao >= purchase
      ? "This deal is priced below your target threshold. You may have room to move quickly and preserve margin."
      : "This deal is above your target threshold. Try to negotiate down before moving forward.";
} else if (decision === "NEGOTIATE") {
  decisionReason = "Deal has potential, but needs better entry price or improved terms.";

  targetPriceText = `$${Math.round(result.mao).toLocaleString()}`;
  priceGapText =
    result.mao >= purchase
      ? `$${Math.round(result.mao - purchase).toLocaleString()} below target`
      : `$${Math.round(purchase - result.mao).toLocaleString()} above target`;

  negotiationGuidance =
    result.mao >= purchase
      ? "This deal appears to be priced below your target threshold, but execution risk still needs review."
      : "This deal is above your target threshold. Negotiate the purchase price down or improve terms before moving forward.";
} else {
  decisionReason = "Risk outweighs reward based on current numbers.";

  targetPriceText = `$${Math.round(result.mao).toLocaleString()}`;
  priceGapText =
    result.mao >= purchase
      ? `$${Math.round(result.mao - purchase).toLocaleString()} below target`
      : `$${Math.round(purchase - result.mao).toLocaleString()} above target`;

  negotiationGuidance =
    result.mao >= purchase
      ? "Even though price may be below the target threshold, the overall deal quality is still too weak."
      : "This deal appears to be priced above your target threshold. The numbers do not currently justify moving forward.";
}

// TARGET PRICE ENGINE

const mao = result?.mao ? Number(result.mao) : null;
const rentNumber = rent ? Number(rent) : null;

if (strategy === "Flip" && mao && purchase) {
  const gap = mao - purchase;

  targetPriceText = `$${mao.toLocaleString()}`;

  if (gap > 0) {
    priceGapText = `$${gap.toLocaleString()} below target`;
    negotiationGuidance =
      "This deal is priced below your target threshold. You may have room to move quickly and preserve margin.";
  } else if (gap < 0) {
    priceGapText = `$${Math.abs(gap).toLocaleString()} above target`;
    negotiationGuidance =
      "This deal is above your target threshold. Negotiate the purchase price down or improve terms before moving forward.";
  } else {
    priceGapText = `Exactly at target`;
    negotiationGuidance =
      "This deal is right at your target threshold. Proceed carefully and confirm your assumptions before committing.";
  }
} else if (strategy === "Rental" && rentNumber && purchase) {
  const annualRent = rentNumber * 12;
  const rentalTarget = annualRent / 0.1;
  const gap = rentalTarget - purchase;

  targetPriceText = `$${Math.round(rentalTarget).toLocaleString()}`;

  if (gap > 0) {
    priceGapText = `$${Math.round(gap).toLocaleString()} below target`;
    negotiationGuidance =
      "This rental appears to be priced below the rent-based target. The cash-flow setup may be favorable if expenses and condition hold up.";
  } else if (gap < 0) {
    priceGapText = `$${Math.round(Math.abs(gap)).toLocaleString()} above target`;
    negotiationGuidance =
      "This rental appears to be priced above the rent-based target. Consider negotiating harder or reassessing projected cash flow.";
  } else {
    priceGapText = `Exactly at target`;
    negotiationGuidance =
      "This rental is landing right on the rent-based target. Review taxes, insurance, repairs, and vacancy assumptions before proceeding.";
  }
}

    if (runnerUp) {
      if (score >= 80) {
        winnerExplanation = `${winner} clearly outperformed ${runnerUp.strategy}. ${dealStrength}`;
      } else if (score >= 65) {
        winnerExplanation = `${winner} edges out ${runnerUp.strategy}, but the deal is still somewhat tight.`;
      } else {
        winnerExplanation = `${winner} ranks highest, but all strategies show weakness in this deal.`;
      }
    }
  }
}

let improvementMessage = "";

if (targetPrice && Number(targetPrice) < Number(originalPrice)) {
  const diff = Number(originalPrice) - Number(targetPrice);

  if (diff > 0) {
    improvementMessage = `You reduced price by $${diff.toLocaleString()} — deal is improving.`;
  }
}

const showComparison =
  !!baselineResult &&
  !!result &&
  !!originalPrice &&
  !!targetPrice &&
  Number(targetPrice) !== Number(originalPrice);

const scoreChange =
  showComparison ? result.score - baselineResult.score : 0;

const spreadChange =
  showComparison ? result.spread - baselineResult.spread : 0;

const marginChange =
  showComparison ? result.marginPercent - baselineResult.marginPercent : 0;

let strategyRecommendation = "";
let strategyReason = "";

if (result?.bestStrategy) {
  const winner = result.bestStrategy.strategy;
  const score = result.bestStrategy.score;

  if (winner === "Flip") {
  if (score >= 80) {
    strategyRecommendation =
      result.mao >= Number(purchasePrice)
        ? "Strong flip opportunity because the deal is below MAO and margin is healthy."
        : "Strong flip opportunity with healthy spread and margin.";
  } else if (score >= 65) {
    strategyRecommendation =
      "Flip is the best strategy, but the deal is borderline because pricing is still tight.";
  } else {
    strategyRecommendation =
      "Even though flip ranks highest, the deal is weak overall because margin and spread are not strong enough.";
  }
}

else if (winner === "Rental") {
  if (result.rentToPricePercent >= 12) {
    strategyRecommendation =
      "Strong rental opportunity because rent-to-price is attractive and income potential is solid.";
  } else if (result.rentToPricePercent >= 9) {
    strategyRecommendation =
      "Rental works, but returns are still somewhat tight, so expenses and execution need review.";
  } else {
    strategyRecommendation =
      "Rental is not attractive at this price because income is too soft relative to cost.";
  }
}

else if (winner === "Wholesale") {
  if (score >= 75) {
    strategyRecommendation =
      result.spread >= 40000
        ? "Strong wholesale setup because the spread looks assignable and near-term execution is possible."
        : "Wholesale looks strongest, with workable assignment potential.";
  } else if (score >= 60) {
    strategyRecommendation =
      "Wholesale is possible, but buyer demand and spread still need validation.";
  } else {
    strategyRecommendation =
      "Wholesale spread is too weak to rely on, even if it ranks highest among the available options.";
  }
}
}

// 🔴 MICRO-UPGRADE: ALIGN RECOMMENDATION WITH DECISION
if (decision === "PASS") {
  strategyRecommendation =
    "Even though this is the strongest available strategy, the deal does not meet minimum investment standards.";
}

return (
    <main
      style={{
        maxWidth: 960,
        margin: "40px auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <section style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 40, marginBottom: 12 }}>Deal Intake Analyzer</h1>
        <p style={{ fontSize: 18, color: "#555", margin: 0 }}>
          Enter the key details of a potential deal to generate an initial analysis.
        </p>
      </section>

      <section
        style={{
          border: "1px solid #e5e5e5",
          borderRadius: 16,
          padding: 24,
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <h2 style={{ fontSize: 24, marginTop: 0, marginBottom: 12 }}>
          Deal Intake
        </h2>

<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
  <label style={{ fontSize: 14, marginBottom: 4 }}>
  Property Address
</label>
<input
  type="text"
  placeholder="123 Main St, Houston TX"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<label style={{ fontSize: 14, marginBottom: 4 }}>
  Purchase Price ($)
</label>
<input
  type="number"
  placeholder="Enter purchase price"
  value={purchasePrice}
  onChange={(e) => setPurchasePrice(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<label style={{ fontSize: 14, marginBottom: 4 }}>
  Try Different Purchase Price (optional)
</label>
<input
  type="number"
  placeholder="Enter alternate purchase price"
  value={targetPrice}
  onChange={(e) => setTargetPrice(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<p style={{ fontSize: 12, color: "#666", marginTop: -8, marginBottom: 12 }}>
  Tip: Try lowering the price to see how the deal improves.
</p>

<label style={{ fontSize: 14, marginBottom: 4 }}>
  After Repair Value (ARV)
</label>
<input
  type="number"
  placeholder="Enter ARV"
  value={arv}
  onChange={(e) => setArv(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<label style={{ fontSize: 14, marginBottom: 4 }}>
  Estimated Monthly Rent ($)
</label>
<input
  type="number"
  placeholder="Enter monthly rent"
  value={rent}
  onChange={(e) => setRent(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<label style={{ fontSize: 14, marginBottom: 4 }}>
  Estimated Repair Cost ($)
</label>
<input
  type="number"
  placeholder="Enter repair cost"
  value={repairCost}
  onChange={(e) => setRepairCost(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

  <label style={{ fontSize: 14, marginBottom: 4 }}>
  Deal Strategy
</label>
<select
  value={strategy}
  onChange={(e) => setStrategy(e.target.value)}
  style={{
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  }}
>
  <option value="">Select deal strategy</option>
  <option value="Flip">Flip</option>
  <option value="Rental">Rental</option>
  <option value="Wholesale">Wholesale</option>
</select>

{strategy && (
  <p style={{ fontSize: 12, color: "#666", marginTop: 6, marginBottom: 12 }}>
    {strategy === "Flip"
      ? "Flip uses purchase price, repair cost, and ARV."
      : strategy === "Rental"
      ? "Rental uses purchase price, repair cost, and monthly rent."
      : "Wholesale uses purchase price, repair cost, and ARV."}
  </p>
)}

  <label style={{ fontSize: 14, marginBottom: 4 }}>
  Notes / Situation
</label>
<textarea
  placeholder="Add context about the deal..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  rows={4}
  style={{
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
  }}
/>
</div>

{missingRequiredFieldMessage && (
  <p style={{ fontSize: 13, color: "#92400e", marginTop: 8, marginBottom: 12 }}>
    {missingRequiredFieldMessage}
  </p>
)}

<div style={{ display: "flex", gap: 12, marginTop: 20 }}>
  <button
  onClick={analyzeDeal}
  disabled={disabled}
  style={{
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    background: disabled ? "#9ca3af" : "#111827",
    color: "#ffffff",
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
  }}
>
    {loading ? "Analyzing..." : "Analyze Deal"}
  </button>

  <button
    onClick={clearForm}
    style={{
      padding: "10px 16px",
      borderRadius: 8,
      border: "1px solid #ccc",
      background: "#ffffff",
      color: "#111827",
      fontSize: 15,
      cursor: "pointer",
    }}
  >
    Clear
  </button>
</div>

  <div className="mt-6 rounded-xl border border-dashed border-gray-200 bg-white p-5">
  {error && (
  <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
    {error}
  </div>
)}
  {!result ? (

      <div className="space-y-1">
  <p className="text-sm font-semibold text-gray-900">
    Start your analysis
  </p>
  <p className="text-sm text-gray-600">
    Fill out the deal details above and click “Analyze Deal” to see insights, strategy recommendations, and pricing guidance.
  </p>
</div>
  
  ) : (
    <>
   <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  }}
>
  <strong>Analysis Result</strong>
  <span>Score: {result.score}</span>
</div>

{result.bestStrategy && (
  <div
    style={{
  marginBottom: 16,
  padding: 14,
  borderRadius: 8,
  background: dealToneBg,
  border: `1px solid ${dealToneBorder}`,
  color: dealToneText,
}}
  >
    <div style={{ marginBottom: 12, fontSize: 18, fontWeight: 600 }}>
  <div>
    Best Strategy: {result.bestStrategy.strategy}
  </div>

  <div style={{ marginTop: 4 }}>
    Score: {result.bestStrategy.score}
  </div>
</div>
  </div>
)}

{winnerExplanation && (
  <div
    style={{
      marginTop: 16,
      padding: 12,
      borderRadius: 10,
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      fontSize: 15,
      lineHeight: 1.5,
    }}
  >
    <strong>Why this strategy won:</strong> {winnerExplanation}
  </div>
)}

<p style={{ marginBottom: 8 }}>
  <strong>Strategy:</strong> {result.strategy}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Confidence:</strong> {confidenceLabel}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Investor Decision:</strong>{" "}
  <span
  style={{
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    fontWeight: 600,
    fontSize: 14,
    background:
      decision === "BUY"
        ? "#dcfce7"
        : decision === "NEGOTIATE"
        ? "#fef3c7"
        : "#fee2e2",
    color:
      decision === "BUY"
        ? "#166534"
        : decision === "NEGOTIATE"
        ? "#92400e"
        : "#991b1b",
    border:
      decision === "BUY"
        ? "1px solid #86efac"
        : decision === "NEGOTIATE"
        ? "1px solid #fcd34d"
        : "1px solid #fca5a5",
  }}
>
  {decision}
</span>
</p>

<div
  style={{
    marginBottom: 14,
    padding: "10px 12px",
    borderRadius: 10,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  }}
>
  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: "#374151" }}>
    Decision Reason
  </div>
  <div style={{ fontSize: 15, lineHeight: 1.5, color: "#111827" }}>
    {decisionReason}
  </div>
</div>

<p style={{ marginBottom: 8 }}>
  <strong>Target Price:</strong> {targetPriceText}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Price Gap:</strong> {priceGapText}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Negotiation Guidance:</strong> {negotiationGuidance}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Confidence Reason:</strong> {confidenceExplanation}
</p>

<div style={{ marginBottom: 8 }}>
  <strong>Confidence Drivers:</strong>
  <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 20 }}>
    {confidenceDrivers.map((driver, index) => (
      <li key={index}>{driver}</li>
    ))}
  </ul>
</div>

<p style={{ marginBottom: 8 }}>
  <strong>Risk:</strong> {result.risk}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Deal Quality:</strong>{" "}
  <span
    style={{
      color: dealToneText,
      fontWeight: 600,
    }}
  >
    {dealLabel}
  </span>
</p>

{showComparison && baselineResult && (
  <div
    style={{
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      background: "#f6f8fb",
      border: "1px solid #d9e2f0",
    }}
  >
    <strong style={{ display: "block", marginBottom: 8 }}>
      Before vs After
    </strong>

    <p style={{ marginBottom: 6 }}>
      <strong>Purchase Price:</strong> ${Number(originalPrice).toLocaleString()} → ${Number(targetPrice).toLocaleString()}
    </p>

    <p style={{ marginBottom: 6 }}>
      <strong>Score:</strong> {baselineResult.score} → {result.score}
    </p>

    <p style={{ marginBottom: 6 }}>
      <strong>Spread:</strong> ${baselineResult.spread.toLocaleString()} → ${result.spread.toLocaleString()}
    </p>

    <p style={{ marginBottom: 6 }}>
      <strong>Margin:</strong> {baselineResult.marginPercent.toFixed(1)}% → {result.marginPercent.toFixed(1)}%
    </p>

    <p style={{ marginBottom: 0 }}>
      <strong>Risk:</strong> {baselineResult.risk} → {result.risk}
    </p>
  </div>
)}

<div
  style={{
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    background: "#f8f8f8",
  }}
>
  {result.strategy === "Flip" && (
    <>
      <p style={{ marginBottom: 6 }}>
        <strong>MAO:</strong> ${result.mao.toLocaleString()}
      </p>

      <p style={{ marginBottom: 6 }}>
        <strong>Spread:</strong> ${result.spread.toLocaleString()}
      </p>

      <p style={{ marginBottom: 0 }}>
        <strong>Margin:</strong> {result.marginPercent.toFixed(1)}%
      </p>
    </>
  )}

  {result.strategy === "Rental" && (
    <>
      <p style={{ marginBottom: 6 }}>
        <strong>Annual Rent:</strong> $
        {(result.rentToPricePercent > 0
          ? Math.round((result.rentToPricePercent / 100) * Number(purchasePrice))
          : 0
        ).toLocaleString()}
      </p>

      <p style={{ marginBottom: 0 }}>
        <strong>Rent-to-Price:</strong> {result.rentToPricePercent.toFixed(1)}%
      </p>
    </>
  )}

  {result.strategy === "Wholesale" && (
    <>
      <p style={{ marginBottom: 6 }}>
        <strong>Discount to ARV:</strong> {result.discountPercent.toFixed(1)}%
      </p>

      <p style={{ marginBottom: 0 }}>
        <strong>Spread:</strong> ${result.spread.toLocaleString()}
      </p>
    </>
  )}
</div>

<div
  style={{
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    background: "#f8f8f8",
  }}
>
  <strong style={{ display: "block", marginBottom: 8 }}>Why This Deal Scores This Way</strong>

  <ul style={{ margin: 0, paddingLeft: 20 }}>
    {(result.signals ?? []).map((signal) => (
      <li key={signal} style={{ marginBottom: 4 }}>
        {signal}
      </li>
    ))}
  </ul>
</div>

{improvementMessage && (
  <div style={{
    marginTop: 12,
    padding: 10,
    borderRadius: 6,
    background: "#e6f4ea",
    border: "1px solid #b7e1cd"
  }}>
    <strong>Scenario Insight</strong>
    <p style={{ marginTop: 4 }}>{improvementMessage}</p>
  </div>
)}

{result.insight && (
  <div
    style={{
      marginBottom: 12,
      padding: 12,
      borderRadius: 8,
      background: "#eef6ff",
    }}
  >
    <strong style={{ display: "block", marginBottom: 6 }}>
      Insight
    </strong>
    <span>{result.insight}</span>
  </div>
)}

<p style={{ marginBottom: 8 }}>
  {result.summary}
</p>

<div
  style={{
    padding: 12,
    borderRadius: 8,
    background: "#f4f4f4",
  }}
>
  <strong style={{ display: "block", marginBottom: 6 }}>
    Recommendation:
  </strong>
  {strategyRecommendation}
</div>   
    </>
  )}
</div>
      </section>
    </main>
  );
}