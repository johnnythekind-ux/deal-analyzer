"use client";
import { useState } from "react";
export default function Home() {
  const [topic, setTopic] = useState("");
const [audience, setAudience] = useState("");
const [notes, setNotes] = useState("");
const [strategy, setStrategy] = useState("");
const [result, setResult] = useState<{
  score: number;
  strategy: string;
  recommendation: string;
  summary: string;
} | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

function clearForm() {
  setTopic("");
setAudience("");
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
        topic,
        audience,
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

const disabled = !topic.trim() || !audience.trim() || !strategy.trim();

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
    placeholder="Deal topic (e.g. Fix & Flip in Houston)"
    value={topic}
    onChange={(e) => setTopic(e.target.value)}
    style={{
      padding: 12,
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 16,
    }}
  />

  <input
    placeholder="Target buyer / audience"
    value={audience}
    onChange={(e) => setAudience(e.target.value)}
    style={{
      padding: 12,
      borderRadius: 8,
      border: "1px solid #ccc",
      fontSize: 16,
    }}
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
  disabled={!topic || !audience || !strategy || loading}
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