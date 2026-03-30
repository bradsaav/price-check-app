import type { Offer } from "../types";

export function getRecommendation(currentPrice: number, offers: Offer[]) {
  const cheapest = offers.reduce((min, offer) =>
    offer.price < min.price ? offer : min,
  );

  const diff = currentPrice - cheapest.price;

  if (diff <= 0) {
    return "Buy here — this is the best price right now.";
  }

  if (diff < 1) {
    return `Close price — only $${diff.toFixed(2)} more than ${cheapest.retailer}.`;
  }

  return `Cheaper at ${cheapest.retailer} — save $${diff.toFixed(2)}.`;
}
