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

const disabled =
  !address.trim() ||
  !purchasePrice.trim() ||
  !arv.trim() ||
  !strategy.trim();

  let dealLabel = "";
let winnerExplanation = "";
let insight = "";

let dealToneBg = "#f3f4f6";
let dealToneBorder = "#d1d5db";
let dealToneText = "#111827";

if (result) {
  if (result.score >= 80) dealLabel = "Strong Deal";
  else if (result.score >= 60) dealLabel = "Borderline";
  else dealLabel = "Avoid";

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

  if (result.bestStrategy) {
    const winner = result.bestStrategy.strategy;
    const score = result.bestStrategy.score;
    const runnerUp = result.runnerUp;

    let dealStrength = "";

    if (result.score >= 75) {
      dealStrength = "This is a strong deal.";
    } else if (result.score >= 60) {
      dealStrength = "This is a moderate deal with some risk.";
    } else {
      dealStrength = "This deal is weak overall.";
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
      strategyRecommendation = "Strong flip opportunity. Numbers support execution.";
    } else if (score >= 65) {
      strategyRecommendation =
        "Flip is the best strategy, but the deal is borderline. Try negotiating a better purchase price.";
    } else {
      strategyRecommendation =
        "Even though flip ranks highest, this deal is weak overall. Proceed with caution.";
    }
  } else if (winner === "Rental") {
    if (score >= 75) {
      strategyRecommendation =
        "Strong rental opportunity with solid income potential.";
    } else if (score >= 60) {
      strategyRecommendation =
        "Rental works, but returns are tight. Review expenses carefully.";
    } else {
      strategyRecommendation =
        "Rental is not attractive at this price.";
    }
  } else if (winner === "Wholesale") {
    if (score >= 75) {
      strategyRecommendation =
        "Strong wholesale deal with a solid assignment margin.";
    } else if (score >= 60) {
      strategyRecommendation =
        "Wholesale is possible, but buyer demand may be limited.";
    } else {
      strategyRecommendation =
        "Wholesale spread is too weak to rely on.";
    }
  }
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
  <input
  type="text"
  placeholder="Property Address (e.g. 123 Main St, Houston TX)"
  value={address}
  onChange={(e) => setAddress(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<input
  type="number"
  placeholder="Purchase Price ($)"
  value={purchasePrice}
  onChange={(e) => setPurchasePrice(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<input
  type="number"
  placeholder="Try Different Purchase Price (optional)"
  value={targetPrice}
  onChange={(e) => setTargetPrice(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<p style={{ fontSize: 12, color: "#666", marginTop: -8, marginBottom: 12 }}>
  Tip: Try lowering the price to see how the deal improves.
</p>

<input
  type="number"
  placeholder="After Repair Value (ARV)"
  value={arv}
  onChange={(e) => setArv(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<input
  type="number"
  placeholder="Estimated Monthly Rent ($)"
  value={rent}
  onChange={(e) => setRent(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
/>

<input
  type="number"
  placeholder="Estimated Repair Cost ($)"
  value={repairCost}
  onChange={(e) => setRepairCost(e.target.value)}
  className="w-full border rounded-lg p-2 mb-3"
 />

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

  <textarea
    placeholder="Notes / situation"
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

<div style={{ display: "flex", gap: 12, marginTop: 20 }}>
  <button
  onClick={analyzeDeal}
  disabled={disabled || loading}
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

        <div
  style={{
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    background: "#f8f8f8",
    border: "1px dashed #ccc",
  }}
>
  {error && (
  <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
    {error}
  </div>
)}
  {!result ? (
    <>
      <strong>Empty State:</strong>
      <p style={{ marginBottom: 0 }}>
        Enter deal details to generate an initial analysis.
      </p>
    </>
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
    <strong>Best Strategy: {result.bestStrategy.strategy}</strong>
    <p style={{ margin: "6px 0 0 0" }}>
      Score: {result.bestStrategy.score}
    </p>
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