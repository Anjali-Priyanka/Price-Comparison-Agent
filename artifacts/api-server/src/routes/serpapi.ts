import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface ShoppingResult {
  title: string;
  price: string | null;
  priceRaw: number | null;
  store: string;
  rating: number | null;
  reviews: number | null;
  delivery: string | null;
  link: string;
  thumbnail: string | null;
}

interface SerpApiShoppingItem {
  title?: string;
  price?: string;
  extracted_price?: number;
  source?: string;
  rating?: number;
  reviews?: number;
  delivery?: string;
  link?: string;
  product_link?: string;
  thumbnail?: string;
}

router.post("/serpapi/compare", async (req, res) => {
  const { query } = req.body as { query?: string };

  if (!query || typeof query !== "string" || query.trim() === "") {
    res.status(400).json({ error: "bad_request", message: "query is required" });
    return;
  }

  const apiKey = process.env["SERPAPI_KEY"];
  if (!apiKey) {
    res.status(500).json({
      error: "config_error",
      message: "SERPAPI_KEY environment variable is not set",
    });
    return;
  }

  try {
    const params = new URLSearchParams({
      engine: "google_shopping",
      q: query.trim(),
      api_key: apiKey,
      hl: "en",
      gl: "in",
      num: "20",
    });

    const serpRes = await fetch(`https://serpapi.com/search.json?${params.toString()}`);

    if (!serpRes.ok) {
      const body = await serpRes.text();
      throw new Error(`SerpAPI responded with ${serpRes.status}: ${body.slice(0, 200)}`);
    }

    const data = (await serpRes.json()) as {
      shopping_results?: SerpApiShoppingItem[];
      error?: string;
    };

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    const raw: SerpApiShoppingItem[] = data.shopping_results ?? [];

    const results: ShoppingResult[] = raw.slice(0, 20).map((item) => {
      const priceRaw = item.extracted_price ?? null;
      const priceStr = item.price ?? (priceRaw !== null ? `₹${priceRaw.toLocaleString("en-IN")}` : null);
      return {
        title: item.title ?? "Unknown Product",
        price: priceStr,
        priceRaw,
        store: item.source ?? "Unknown Store",
        rating: item.rating ?? null,
        reviews: item.reviews ?? null,
        delivery: item.delivery ?? null,
        link: item.product_link ?? item.link ?? "#",
        thumbnail: item.thumbnail ?? null,
      };
    });

    if (results.length === 0) {
      res.json({ query: query.trim(), results: [], bestDeal: null });
      return;
    }

    const withPrice = results.filter((r) => r.priceRaw !== null);
    const bestDeal = withPrice.length > 0
      ? withPrice.reduce((best, cur) => (cur.priceRaw! < best.priceRaw! ? cur : best))
      : null;

    res.json({ query: query.trim(), results, bestDeal });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[serpapi/compare] Error:", message);
    res.status(500).json({ error: "fetch_error", message });
  }
});

export default router;
