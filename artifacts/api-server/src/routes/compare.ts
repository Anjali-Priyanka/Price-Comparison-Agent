import { Router, type IRouter } from "express";
import { db, searchesTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";
import { CompareProductsBody } from "@workspace/api-zod";
import { runPriceComparison } from "../scrapers/agent.js";

const router: IRouter = Router();

router.post("/compare", async (req, res) => {
  try {
    const body = CompareProductsBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "validation_error", message: "Invalid request body — 'query' field is required" });
      return;
    }

    const { query } = body.data;

    if (!query || query.trim().length === 0) {
      res.status(400).json({ error: "bad_request", message: "Query cannot be empty" });
      return;
    }

    const comparison = await runPriceComparison(query.trim());

    let searchId: number | null = null;
    try {
      const inserted = await db
        .insert(searchesTable)
        .values({
          query: comparison.query,
          results: comparison.results as Record<string, unknown>[],
          bestDeal: comparison.bestDeal as Record<string, unknown> | null,
        })
        .returning({ id: searchesTable.id });
      searchId = inserted[0]?.id ?? null;
    } catch (dbErr) {
      console.warn("[compare] Failed to save to DB:", dbErr);
    }

    res.json({
      query: comparison.query,
      results: comparison.results,
      bestDeal: comparison.bestDeal,
      searchId,
      timestamp: comparison.timestamp,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[compare] Error:", message);
    res.status(500).json({ error: "internal_error", message });
  }
});

router.get("/history", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query["limit"] ?? "10"), 10) || 10, 50);

    const rows = await db
      .select()
      .from(searchesTable)
      .orderBy(desc(searchesTable.createdAt))
      .limit(limit);

    const history = rows.map((row) => ({
      id: row.id,
      query: row.query,
      results: row.results,
      bestDeal: row.bestDeal,
      timestamp: row.createdAt.toISOString(),
    }));

    res.json({ history });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[history] Error:", message);
    res.status(500).json({ error: "internal_error", message });
  }
});

export default router;
