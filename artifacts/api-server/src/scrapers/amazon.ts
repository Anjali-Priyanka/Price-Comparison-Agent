import type { PlatformResult } from "./types.js";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Cache-Control": "no-cache",
  Pragma: "no-cache",
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
  const cleaned = text.replace(/[,\s]/g, "").replace(/[^\d]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}

export async function scrapeAmazon(query: string): Promise<PlatformResult> {
  const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Amazon responded with ${res.status}`);
    }
    const html = await res.text();

    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const firstResult = doc.querySelector('[data-component-type="s-search-result"]');
    if (!firstResult) {
      throw new Error("No results found on Amazon");
    }

    const titleEl = firstResult.querySelector("h2 a span");
    const title = titleEl?.textContent?.trim();

    const linkEl = firstResult.querySelector("h2 a");
    const relativeLink = linkEl?.getAttribute("href") || "";
    const link = relativeLink.startsWith("http")
      ? relativeLink
      : `https://www.amazon.in${relativeLink}`;

    const priceWhole = firstResult.querySelector(".a-price-whole")?.textContent?.trim();
    const priceFraction = firstResult.querySelector(".a-price-fraction")?.textContent?.trim();
    const priceText = priceWhole
      ? `${priceWhole}${priceFraction || ""}`
      : firstResult.querySelector(".a-price .a-offscreen")?.textContent?.trim();
    const price = parsePrice(priceText);

    const originalPriceEl = firstResult.querySelector(".a-price.a-text-price .a-offscreen");
    const originalPrice = parsePrice(originalPriceEl?.textContent);

    let discount: number | null = null;
    if (price && originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const discountBadgeEl = firstResult.querySelector(".a-badge-text");
    if (!discount && discountBadgeEl) {
      const discountText = discountBadgeEl.textContent || "";
      const match = discountText.match(/(\d+)%/);
      if (match) discount = parseInt(match[1], 10);
    }

    const ratingEl = firstResult.querySelector(".a-icon-alt");
    const rating = parseRating(ratingEl?.textContent);

    const reviewEl = firstResult.querySelector(
      '[aria-label*="rating"] ~ span, .a-size-base.s-underline-text'
    );
    const reviewCount = parseReviewCount(reviewEl?.textContent);

    const deliveryEl = firstResult.querySelector(
      '[data-cy="delivery-recipe-group"] .a-color-secondary, .a-color-success'
    );
    const deliveryText = deliveryEl?.textContent?.trim() || null;

    const imageEl = firstResult.querySelector(".s-image");
    const imageUrl = imageEl?.getAttribute("src") || null;

    const inStockEl = firstResult.querySelector(".a-color-price");
    const inStock = !inStockEl?.textContent?.toLowerCase().includes("currently unavailable");

    const effectivePrice = price !== null ? price + (0) : null;

    return {
      platform: "Amazon",
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
      platform: "Amazon",
      link: `https://www.amazon.in/s?k=${encodeURIComponent(query)}`,
      inStock: false,
      error: message,
    };
  }
}
