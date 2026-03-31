"use client";
import { useState } from "react";
export default function Home() {
const [address, setAddress] = useState("");
const [purchasePrice, setPurchasePrice] = useState("");
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
  mao: number;
spread: number;
marginPercent: number;
rentToPricePercent: number;
discountPercent: number;
} | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

function clearForm() {
setAddress("");
setPurchasePrice("");
setArv("");
setRent("");
setRepairCost("");
setNotes("");
setStrategy("");
setResult(null);
setError("");
setLoading(false);
}

async function analyzeDeal() {
  setLoading(true);
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
  purchasePrice,
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

if (result) {
  if (result.score >= 80) dealLabel = "Strong Deal";
  else if (result.score >= 60) dealLabel = "Borderline";
  else dealLabel = "Avoid";
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

<p style={{ marginBottom: 8 }}>
  <strong>Strategy:</strong> {result.strategy}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Risk:</strong> {result.risk}
</p>

<p style={{ marginBottom: 8 }}>
  <strong>Deal Quality:</strong> {dealLabel}
</p>

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
  {result.recommendation}
</div>   
    </>
  )}
</div>
      </section>
    </main>
  );
}