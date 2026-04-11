import { NextResponse } from "next/server";

type StrategyType = "Flip" | "Rental" | "Wholesale";

type EvaluateData = {
  address: string;
  purchasePrice: number;
  afterRepairValue: number;
  repairs: number;
  monthlyRent?: number;
  notes?: string;
};

type StrategyResult = {
  strategy: StrategyType;
  score: number;
  risk: "Low" | "Moderate" | "High";
  recommendation: string;
  summary: string;
  signals: string[];
  insight: string;
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRisk(score: number): "Low" | "Moderate" | "High" {
  if (score >= 80) return "Low";
  if (score >= 60) return "Moderate";
  return "High";
}

function evaluateStrategy(
  strategyType: StrategyType,
  data: EvaluateData
): StrategyResult | null {
  const {
    address,
    purchasePrice,
    afterRepairValue,
    repairs,
    monthlyRent = 0,
    notes = "",
  } = data;

  let score = 0;
  let signals: string[] = [];
  let recommendation = "";
  let summary = "";
  let insight = "";

  const spread = afterRepairValue - purchasePrice - repairs;
  const marginPercent =
    afterRepairValue > 0 ? (spread / afterRepairValue) * 100 : 0;
  const mao = afterRepairValue * 0.7 - repairs;
  const discountPercent =
    afterRepairValue > 0
      ? ((afterRepairValue - purchasePrice) / afterRepairValue) * 100
      : 0;
  const annualRent = monthlyRent * 12;
  const rentToPricePercent =
    purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0;

  if (strategyType === "Flip") {
    score = 45;

    if (purchasePrice <= mao) {
      score += 15;
      signals.push("Below MAO");
    } else if (purchasePrice <= mao + 10000) {
      score += 8;
      signals.push("Near MAO");
    } else {
      score -= 15;
      signals.push("Above MAO");
    }

    if (marginPercent >= 25) {
      score += 12;
      signals.push("Strong margin");
    } else if (marginPercent >= 15) {
      score += 8;
      signals.push("Acceptable margin");
    } else if (marginPercent > 0) {
      score -= 5;
      signals.push("Thin margin");
    } else {
      score -= 15;
      signals.push("No real margin");
    }

    if (spread >= 40000) {
      score += 10;
      signals.push("Healthy spread");
    } else if (spread >= 20000) {
      score += 6;
      signals.push("Usable spread");
    } else if (spread > 0) {
      score -= 4;
      signals.push("Weak spread");
    } else {
      score -= 12;
      signals.push("Negative spread");
    }

    recommendation =
      purchasePrice <= mao && marginPercent >= 25
        ? `Strong flip opportunity. Estimated spread is $${spread.toLocaleString()} with margin of ${marginPercent.toFixed(
            1
          )}%.`
        : purchasePrice <= mao
        ? `Flip setup is workable. Spread is $${spread.toLocaleString()}, but the margin is tighter at ${marginPercent.toFixed(
            1
          )}%.`
        : `Flip opportunity looks weak at current pricing. Re-check purchase price, repairs, and ARV before proceeding.`;

    summary = `Flip analysis for ${address}: purchase $${purchasePrice.toLocaleString()}, repairs $${repairs.toLocaleString()}, ARV $${afterRepairValue.toLocaleString()}, spread $${spread.toLocaleString()}, margin ${marginPercent.toFixed(
      1
    )}%.`;

    if (purchasePrice > mao) {
      insight = `If you can negotiate closer to $${Math.round(
        mao
      ).toLocaleString()}, this flip becomes much stronger.`;
    }
  }

  if (strategyType === "Rental") {
    if (!monthlyRent || monthlyRent <= 0) {
      return null;
    }

    score = 50;

    if (rentToPricePercent >= 10) {
      score += 20;
      signals.push("Strong rent-to-price ratio");
      signals.push("Solid annual rent");
      recommendation = `Rental potential looks strong. Estimated annual rent is $${annualRent.toLocaleString()}. Review cash flow, maintenance, taxes, and vacancy.`;
    } else if (rentToPricePercent >= 7) {
      score += 10;
      signals.push("Moderate rent-to-price ratio");
      signals.push("Rent may work but needs expense review");
      recommendation = `Rental potential looks moderate. Estimated annual rent is $${annualRent.toLocaleString()}. Review expenses carefully.`;
    } else {
      score -= 10;
      signals.push("Weak rent-to-price ratio");
      signals.push("Rental performance may be too thin");
      recommendation =
        "Rental performance looks weak based on rent-to-price ratio. Re-evaluate rent assumptions or purchase price.";
      insight =
        "This rental likely needs either a lower purchase price or stronger monthly rent to become more attractive.";
    }

    if (repairs > 30000) {
      score -= 6;
      signals.push("Repairs may delay cash flow");
    }

    summary = `Rental analysis for ${address}: purchase $${purchasePrice.toLocaleString()}, estimated rent $${monthlyRent.toLocaleString()}/mo, repairs $${repairs.toLocaleString()}, rent-to-price ${rentToPricePercent.toFixed(
      1
    )}%.`;
  }

  if (strategyType === "Wholesale") {
    score = 50;

    if (discountPercent >= 30) {
      score += 15;
      signals.push("Strong discount to ARV");
      signals.push("Better wholesale margin");
    } else if (discountPercent >= 20) {
      score += 8;
      signals.push("Usable discount to ARV");
      signals.push("Wholesale may work with right buyers");
    } else {
      score -= 8;
      signals.push("Thin discount to ARV");
      signals.push("Assignment spread may be weak");
    }

    if (spread < 10000) {
      score -= 8;
      signals.push("Low assignment spread");
    } else if (spread >= 15000) {
      score += 5;
      signals.push("Clear wholesale deal structure");
    }

    if (repairs > 50000) {
      score += 3;
      signals.push("Heavy rehab may reduce buyer demand");
    }

    if (notes.toLowerCase().includes("assignment")) {
      score += 2;
      signals.push("Assignment opportunity detected");
    }

    if (notes.toLowerCase().includes("cash buyer")) {
      score += 2;
      signals.push("Cash buyer angle noted");
    }

    recommendation =
      discountPercent >= 20
        ? `Wholesale setup looks workable. The discount to ARV is roughly ${discountPercent.toFixed(
            1
          )}%. Confirm investor demand, assignment spread, and repair expectations.`
        : "Wholesale opportunity may be thin at current pricing. Re-check discount, buyer demand, and expected assignment margin.";

    summary = `Wholesale analysis for ${address}: purchase $${purchasePrice.toLocaleString()}, ARV $${afterRepairValue.toLocaleString()}, repairs $${repairs.toLocaleString()}, discount ${discountPercent.toFixed(
      1
    )}%, spread $${spread.toLocaleString()}.`;

    if (discountPercent < 20) {
      const targetPrice = Math.round(afterRepairValue * 0.8);
      insight = `If you can negotiate closer to $${targetPrice.toLocaleString()}, this wholesale deal becomes more workable.`;
    }
  }

  score = clampScore(score);

  return {
    strategy: strategyType,
    score,
    risk: getRisk(score),
    recommendation,
    summary,
    signals,
    insight,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { address, purchasePrice, arv, rent, repairCost, notes, strategy } =
      body;

    const needsArv = strategy === "Flip" || strategy === "Wholesale";
const needsRent = strategy === "Rental";

if (!address || !purchasePrice || !repairCost || !strategy) {
  return NextResponse.json(
    { error: "Address, purchase price, repair cost, and strategy are required." },
    { status: 400 }
  );
}

if (needsArv && !arv) {
  return NextResponse.json(
    { error: `ARV is required for a ${strategy} deal.` },
    { status: 400 }
  );
}

if (needsRent && !rent) {
  return NextResponse.json(
    { error: "Monthly rent is required for a Rental deal." },
    { status: 400 }
  );
}

    const purchase = Number(purchasePrice);
const afterRepairValue = Number(arv || 0);
const monthlyRent = Number(rent || 0);
const repairs = Number(repairCost || 0);

if (Number.isNaN(purchase) || Number.isNaN(repairs)) {
  return NextResponse.json(
    { error: "Purchase price and repair cost must be valid numbers." },
    { status: 400 }
  );
}

if (needsArv && (Number.isNaN(afterRepairValue) || afterRepairValue <= 0)) {
  return NextResponse.json(
    { error: `ARV must be a valid number for a ${strategy} deal.` },
    { status: 400 }
  );
}

if (needsRent && (Number.isNaN(monthlyRent) || monthlyRent <= 0)) {
  return NextResponse.json(
    { error: "Monthly rent must be a valid number for a Rental deal." },
    { status: 400 }
  );
}

    const mao = afterRepairValue * 0.7 - repairs;
    const spread = afterRepairValue - purchase - repairs;
    const marginPercent =
      afterRepairValue > 0 ? (spread / afterRepairValue) * 100 : 0;
    const rentToPricePercent =
      purchase > 0 ? ((monthlyRent * 12) / purchase) * 100 : 0;
    const discountPercent =
      afterRepairValue > 0
        ? ((afterRepairValue - purchase) / afterRepairValue) * 100
        : 0;

    const baseData: EvaluateData = {
      address,
      purchasePrice: purchase,
      afterRepairValue,
      repairs,
      monthlyRent,
      notes,
    };

    const flipEval = evaluateStrategy("Flip", baseData);
    const rentalEval = evaluateStrategy("Rental", baseData);
    const wholesaleEval = evaluateStrategy("Wholesale", baseData);

    const allStrategies = [flipEval, rentalEval, wholesaleEval].filter(
      (item): item is StrategyResult => item !== null
    );

    const sortedStrategies = [...allStrategies].sort((a, b) => b.score - a.score);

const bestStrategy = sortedStrategies[0] ?? null;
const runnerUp = sortedStrategies[1] ?? null;

    if (!bestStrategy) {
      return NextResponse.json(
        { error: "Could not evaluate any strategy for this deal." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      score: bestStrategy.score,
      risk: bestStrategy.risk,
      strategy: bestStrategy.strategy,
      recommendation: bestStrategy.recommendation,
      summary: bestStrategy.summary,
      signals: bestStrategy.signals,
      insight: bestStrategy.insight,
     mao: Math.round(mao),
      spread: Math.round(spread),
      marginPercent: Number(marginPercent.toFixed(1)),
      rentToPricePercent: Number(rentToPricePercent.toFixed(1)),
      discountPercent: Number(discountPercent.toFixed(1)),
      bestStrategy,
      allStrategies: sortedStrategies,
      selectedStrategy: strategy,
      runnerUp,
    });
  } catch (error) {
    console.error("🚨 ANALYZE ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "Server failed to analyze the deal." },
      { status: 500 }
    );
  }
}