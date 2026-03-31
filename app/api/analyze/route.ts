import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      address,
      purchasePrice,
      arv,
      rent,
      repairCost,
      notes,
      strategy,
    } = body;

    if (!address || !purchasePrice || !arv || !strategy) {
      return NextResponse.json(
        { error: "Address, purchase price, ARV, and strategy are required." },
        { status: 400 }
      );
    }

    const purchase = Number(purchasePrice);
    const afterRepairValue = Number(arv);
    const monthlyRent = Number(rent || 0);
    const repairs = Number(repairCost || 0);

    if (Number.isNaN(purchase) || Number.isNaN(afterRepairValue)) {
      return NextResponse.json(
        { error: "Purchase price and ARV must be valid numbers." },
        { status: 400 }
      );
    }

    // Core deal metrics
    const closingCosts = afterRepairValue * 0.05;
const holdingCosts = afterRepairValue * 0.05;

const mao =
  afterRepairValue * 0.7 -
  repairs -
  closingCosts -
  holdingCosts;
    const totalBasis = purchase + repairs;
    const spread = afterRepairValue - totalBasis;
    const marginPercent =
      afterRepairValue > 0 ? (spread / afterRepairValue) * 100 : 0;
    const rentToPricePercent =
      purchase > 0 ? ((monthlyRent * 12) / purchase) * 100 : 0;
      const discountPercent =
        afterRepairValue > 0
          ? ((afterRepairValue - purchase) / afterRepairValue) * 100
          : 0;

    let score = 60;
    let recommendation = "Proceed carefully and validate the numbers.";
    let summary = `${strategy} analysis for ${address}: purchase $${purchase.toLocaleString()}, ARV $${afterRepairValue.toLocaleString()}, repairs $${repairs.toLocaleString()}.`;
    let signals: string[] = [];

    if (strategy === "Flip") {
      if (purchase <= mao && marginPercent >= 25) {
        score += 25;
        signals.push("Below MAO");
signals.push("Strong margin");
signals.push("Healthy spread");
        recommendation = `Flip opportunity looks promising. Estimated spread is $${spread.toLocaleString()}. Focus on rehab control, resale comps, and holding costs.`;
      } else if (purchase <= mao) {
        score += 10;
        signals.push("Near MAO");
signals.push("Spread exists but margin is tighter");
        recommendation = `Deal is near MAO. Spread is $${spread.toLocaleString()}, but margins are tighter. Proceed carefully.`;
      } else {
        score -= 15;
        signals.push("Exceeds MAO");
signals.push("Thin margin");
signals.push("Weak flip setup");
        recommendation = `Deal exceeds MAO. Flip opportunity looks weak. Re-check ARV, repair costs, and purchase price before proceeding.`;
      }

      summary = `Flip analysis for ${address}: purchase $${purchase.toLocaleString()}, repairs $${repairs.toLocaleString()}, ARV $${afterRepairValue.toLocaleString()}.`;
    } else if (strategy === "Rental") {
      const annualRent = monthlyRent * 12;

      if (rentToPricePercent >= 10) {
        score += 20;
        signals.push("Strong rent-to-price ratio");
signals.push("Solid annual rent");
        recommendation = `Rental potential looks strong. Estimated annual rent is $${annualRent.toLocaleString()}. Review cash flow, maintenance, taxes, and vacancy risk.`;
      } else if (rentToPricePercent >= 7) {
        score += 10;
        signals.push("Moderate rent-to-price ratio");
signals.push("Rent may work but needs expense review");
        recommendation = `Rental potential looks moderate. Estimated annual rent is $${annualRent.toLocaleString()}. Review expenses carefully.`;
      } else {
        score -= 10;
        signals.push("Weak rent-to-price ratio");
signals.push("Rental performance may be too thin");
        recommendation = `Rental performance looks weak based on rent-to-price ratio. Re-evaluate rent assumptions or purchase price.`;
      }

      summary = `Rental analysis for ${address}: purchase $${purchase.toLocaleString()}, estimated rent $${monthlyRent.toLocaleString()}/mo, repairs $${repairs.toLocaleString()}.`;
    } else if (strategy === "Wholesale") {
      score = 65;

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
  signals.push("Low assignment spread");
}
      if (repairs > 50000) {
  score += 3;
  signals.push("Heavy rehab may reduce buyer demand");
}

if (notes && notes.toLowerCase().includes("assignment")) {
  score += 2;
  signals.push("Assignment opportunity detected");
}

if (notes && notes.toLowerCase().includes("cash buyer")) {
  score += 2;
  signals.push("Cash buyer angle noted");
}

if (discountPercent >= 20 && spread >= 15000) {
  signals.push("Clear wholesale deal structure");
}

      recommendation =
        discountPercent >= 20
          ? `Wholesale setup looks workable. The discount to ARV is roughly ${discountPercent.toFixed(
              1
            )}%. Confirm investor demand, assignment spread, and repair expectations.`
          : `Wholesale opportunity may be thin at current pricing. Re-check discount, buyer demand, and expected assignment margin.`;

      summary = `Wholesale analysis for ${address}: purchase $${purchase.toLocaleString()}, ARV $${afterRepairValue.toLocaleString()}, repairs $${repairs.toLocaleString()}.`;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));
    let risk = "Moderate";

if (score >= 80) risk = "Low";
else if (score >= 60) risk = "Moderate";
else risk = "High";

    return NextResponse.json({
      score,
      risk,
      strategy,
      recommendation,
      summary,
      signals,
      mao,
      spread,
      marginPercent,
      rentToPricePercent,
      discountPercent,
    });
  } catch (error) {
    console.error("Analyze route failed:", error);

    return NextResponse.json(
      { error: "Server failed to analyze the deal." },
      { status: 500 }
    );
  }
}