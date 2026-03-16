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

export async function scrapeFlipkart(query: string): Promise<PlatformResult> {
  const searchUrl = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(searchUrl, { headers: HEADERS });
    if (!res.ok) {
      throw new Error(`Flipkart responded with ${res.status}`);
    }
    const html = await res.text();

    const { JSDOM } = await import("jsdom");
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const firstResult =
      doc.querySelector("._1AtVbE") ||
      doc.querySelector("[data-id]") ||
      doc.querySelector(".s1Q9rs") ||
      doc.querySelector("._2kHMtA");

    if (!firstResult) {
      throw new Error("No results found on Flipkart");
    }

    const titleEl =
      firstResult.querySelector("._4rR01T") ||
      firstResult.querySelector(".s1Q9rs") ||
      firstResult.querySelector(".IRpwTa") ||
      firstResult.querySelector("a[title]");
    const title = titleEl?.textContent?.trim() || titleEl?.getAttribute("title") || undefined;

    const linkEl =
      firstResult.querySelector("._1fQZEK") ||
      firstResult.querySelector(".s1Q9rs") ||
      firstResult.querySelector("a._2rpwqI") ||
      firstResult.querySelector("a");
    const relativeLink = linkEl?.getAttribute("href") || "";
    const link = relativeLink.startsWith("http")
      ? relativeLink
      : `https://www.flipkart.com${relativeLink}`;

    const priceEl =
      firstResult.querySelector("._30jeq3") ||
      firstResult.querySelector("._1_WHN1") ||
      firstResult.querySelector(".Nx9bqj");
    const price = parsePrice(priceEl?.textContent);

    const originalPriceEl =
      firstResult.querySelector("._3I9_wc") ||
      firstResult.querySelector(".yRaY8j");
    const originalPrice = parsePrice(originalPriceEl?.textContent);

    const discountEl =
      firstResult.querySelector("._3Ay6Sb") ||
      firstResult.querySelector(".UkUFwK") ||
      firstResult.querySelector("._1vFZzd");
    let discount = null;
    if (discountEl?.textContent) {
      const match = discountEl.textContent.match(/(\d+)%/);
      if (match) discount = parseInt(match[1], 10);
    }
    if (!discount && price && originalPrice && originalPrice > price) {
      discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    }

    const ratingEl =
      firstResult.querySelector("._3LWZlK") ||
      firstResult.querySelector(".gUuXy-");
    const rating = parseRating(ratingEl?.textContent);

    const reviewEl =
      firstResult.querySelector("._2_R_DZ span") ||
      firstResult.querySelector("._13vcmD");
    const reviewCount = parseReviewCount(reviewEl?.textContent);

    const deliveryEl =
      firstResult.querySelector("._3tcLo6") ||
      firstResult.querySelector("._2Tpdn3") ||
      firstResult.querySelector(".aMaAEs");
    const deliveryText = deliveryEl?.textContent?.trim() || null;

    const imageEl = firstResult.querySelector("img._396cs4, img._2r_T1I, img");
    const imageUrl = imageEl?.getAttribute("src") || null;

    const outOfStockEl = firstResult.querySelector("._16dNKM");
    const inStock = !outOfStockEl;

    const effectivePrice = price !== null ? price : null;

    return {
      platform: "Flipkart",
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
      platform: "Flipkart",
      link: `https://www.flipkart.com/search?q=${encodeURIComponent(query)}`,
      inStock: false,
      error: message,
    };
  }
}
