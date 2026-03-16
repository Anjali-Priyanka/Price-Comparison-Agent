import { scrapeAmazon } from "./amazon.js";
import { scrapeFlipkart } from "./flipkart.js";
import { scrapeCroma } from "./croma.js";
import type { PlatformResult } from "./types.js";

export interface CompareResult {
  query: string;
  results: PlatformResult[];
  bestDeal: PlatformResult | null;
  timestamp: string;
}

function findBestDeal(results: PlatformResult[]): PlatformResult | null {
  const validResults = results.filter(
    (r) => !r.error && r.inStock && r.effectivePrice !== null && r.effectivePrice !== undefined
  );
  if (validResults.length === 0) return null;

  return validResults.reduce((best, current) => {
    const bestPrice = best.effectivePrice ?? Infinity;
    const currentPrice = current.effectivePrice ?? Infinity;
    return currentPrice < bestPrice ? current : best;
  });
}

export async function runPriceComparison(query: string): Promise<CompareResult> {
  console.log(`[Agent] Starting price comparison for: "${query}"`);

  const [amazonResult, flipkartResult, cromaResult] = await Promise.allSettled([
    scrapeAmazon(query),
    scrapeFlipkart(query),
    scrapeCroma(query),
  ]);

  const results: PlatformResult[] = [
    amazonResult.status === "fulfilled"
      ? amazonResult.value
      : { platform: "Amazon", link: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`, inStock: false, error: String(amazonResult.reason) },
    flipkartResult.status === "fulfilled"
      ? flipkartResult.value
      : { platform: "Flipkart", link: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`, inStock: false, error: String(flipkartResult.reason) },
    cromaResult.status === "fulfilled"
      ? cromaResult.value
      : { platform: "Croma", link: `https://www.croma.com/searchB?q=${encodeURIComponent(query)}`, inStock: false, error: String(cromaResult.reason) },
  ];

  const bestDeal = findBestDeal(results);

  console.log(`[Agent] Completed. Best deal: ${bestDeal?.platform ?? "none"} at ₹${bestDeal?.effectivePrice ?? "N/A"}`);

  return {
    query,
    results,
    bestDeal,
    timestamp: new Date().toISOString(),
  };
}
