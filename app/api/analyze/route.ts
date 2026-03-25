import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, audience, notes, strategy } = body;

    if (!topic || !audience || !strategy) {
      return NextResponse.json(
        { error: "Topic, audience, and strategy are required." },
        { status: 400 }
      );
    }

    let score = 70;
    let recommendation = "Proceed, but validate assumptions carefully.";

    if (strategy === "Flip") {
  score = 82;
  recommendation =
    `This looks more attractive as a flip opportunity for ${audience}. ` +
    `Focus on resale margin, renovation risk, and neighborhood demand.`;

} else if (strategy === "Rental") {
  score = 76;
  recommendation =
    `This looks more aligned with a rental strategy for ${audience}. ` +
    `Focus on cash flow durability, tenant demand, and maintenance exposure.`;

} else if (strategy === "Wholesale") {
  score = 74;
  recommendation =
    `This looks more suitable as a wholesale opportunity for ${audience}. ` +
    `Focus on assignability, investor demand, and spread clarity.`;
}

    const lowerTopic = topic.toLowerCase();

    if (lowerTopic.includes("vacant")) {
      score += 4;
    }

    if (lowerTopic.includes("distressed")) {
      score += 3;
    }

    if (lowerTopic.includes("luxury")) {
      score -= 5;
    }

    if (notes && notes.trim().length > 120) {
      score += 2;
    }

    score = Math.max(0, Math.min(100, score));

    return NextResponse.json({
      score,
      strategy,
      recommendation,
      summary: `Analysis complete for a ${strategy} scenario targeting ${audience}.`,
    });
  } catch (error) {
    console.error("Analyze route failed:", error);

    return NextResponse.json(
      { error: "Server failed to analyze the deal." },
      { status: 500 }
    );
  }
}