import type { PlatformResult } from "./types.js";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
};

function parsePrice(text: string | undefined | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[₹,\s]/g, "").replace(/[^\d.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseRating(text: string | undefined | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

function parseReviewCount(text: string | undefined | null): number | null {
  if (!text) return null;
  const match = text.match(/([\d,]+)/);
  if (!match) return null;
  const num = parseInt(match[1].replace(/,/g, ""), 10);
  return isNaN(num) ? null : num;
}

export async function scrapeCroma(query: string): Promise<PlatformResult> {
  const searchUrl = `https://www.croma.com/searchB?q=${encodeURIComponent(query)}%3Arelevance&lang=en_IN`;

  try {
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Croma responded with ${res.status}`);
    }
    const html = await res.text();

    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const firstResult =
      doc.querySelector(".product-item") ||
      doc.querySelector("[class*='product-list-item']") ||
      doc.querySelector(".cp-product");

    if (!firstResult) {
      throw new Error("No results found on Croma");
    }

    const titleEl =
      firstResult.querySelector(".product-title") ||
      firstResult.querySelector("h3 a") ||
      firstResult.querySelector(".plp-prod-title");
    const title = titleEl?.textContent?.trim() || undefined;

    const linkEl =
      firstResult.querySelector(".product-title a") ||
      firstResult.querySelector("h3 a") ||
      firstResult.querySelector("a.product-link") ||
      firstResult.querySelector("a");
    const relativeLink = linkEl?.getAttribute("href") || "";
    const link = relativeLink.startsWith("http")
      ? relativeLink
      : `https://www.croma.com${relativeLink}`;

    const priceEl =
      firstResult.querySelector(".amount") ||
      firstResult.querySelector(".pdpPriceNew") ||
      firstResult.querySelector("[class*='amount']");
    const price = parsePrice(priceEl?.textContent);

    const originalPriceEl =
      firstResult.querySelector(".old-price") ||
      firstResult.querySelector(".pdpPriceOld") ||
      firstResult.querySelector("[class*='old-price']");
    const originalPrice = parsePrice(originalPriceEl?.textContent);

    let discount: number | null = null;
    const discountEl =
      firstResult.querySelector(".discount") ||
      firstResult.querySelector("[class*='discount']");
    if (discountEl?.textContent) {
      const match = discountEl.textContent.match(/(\d+)%/);
      if (match) discount = parseInt(match[1], 10);
    }
    if (!discount && price && originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const ratingEl =
      firstResult.querySelector(".rating-count") ||
      firstResult.querySelector("[class*='rating']");
    const rating = parseRating(ratingEl?.textContent);

    const reviewEl =
      firstResult.querySelector(".review-count") ||
      firstResult.querySelector("[class*='review']");
    const reviewCount = parseReviewCount(reviewEl?.textContent);

    const deliveryEl =
      firstResult.querySelector(".delivery") ||
      firstResult.querySelector("[class*='delivery']");
    const deliveryText = deliveryEl?.textContent?.trim() || "3-5 business days";

    const imageEl = firstResult.querySelector("img");
    const imageUrl =
      imageEl?.getAttribute("src") ||
      imageEl?.getAttribute("data-src") ||
      null;

    const outOfStockEl =
      firstResult.querySelector(".out-of-stock") ||
      firstResult.querySelector("[class*='out-of-stock']");
    const inStock = !outOfStockEl;

    const effectivePrice = price !== null ? price : null;

    return {
      platform: "Croma",
      title,
      price,
      originalPrice,
      discount,
      rating,
      reviewCount,
      shippingCost: 0,
      deliveryEstimate: deliveryText,
      effectivePrice,
      link,
      imageUrl,
      inStock,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      platform: "Croma",
      link: `https://www.croma.com/searchB?q=${encodeURIComponent(query)}%3Arelevance`,
      inStock: false,
      error: message,
    };
  }
}
