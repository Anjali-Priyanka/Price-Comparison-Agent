import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Truck, Trophy, ExternalLink, AlertCircle, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

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

interface CompareResponse {
  query: string;
  results: ShoppingResult[];
  bestDeal: ShoppingResult | null;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`${BASE}/api/serpapi/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Request failed");
      setData(json as CompareResponse);
      setTimeout(() => window.scrollTo({ top: 480, behavior: "smooth" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-3">
          <img
            src={`${BASE}/images/logo.png`}
            alt="Price Agent Logo"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-bold text-lg text-foreground">AI Price Comparison Agent</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src={`${BASE}/images/hero-bg.png`}
            alt="background"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Powered by Google Shopping via SerpAPI
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight mb-4">
              Find the <span className="text-primary">Best Price</span> Instantly
            </h1>
            <p className="text-muted-foreground text-lg mb-10">
              Compare prices across stores in real time. Enter any product name to get started.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onSubmit={handleSubmit}
            className="flex gap-2 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="e.g. iPhone 15 128GB, Samsung Galaxy S24..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl border-border/70"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={loading || !query.trim()}
              className="h-12 px-6 rounded-xl font-semibold shadow-md"
            >
              {loading ? <Spinner className="w-5 h-5" /> : "Compare"}
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-20 text-center"
            >
              <div className="bg-card border border-border rounded-2xl p-5 shadow-md">
                <Spinner className="w-10 h-10" />
              </div>
              <p className="font-semibold text-lg text-foreground">Searching across stores...</p>
              <p className="text-muted-foreground text-sm">
                Fetching live prices from Google Shopping via SerpAPI
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto py-12"
            >
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 text-center">
                <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
                <p className="font-bold text-destructive text-lg mb-1">Search failed</p>
                <p className="text-destructive/80 text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {data && !loading && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Best deal banner */}
              {data.bestDeal && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 flex items-center gap-4">
                  <div className="bg-emerald-500 p-2 rounded-xl">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm uppercase tracking-wide">Best Deal Found</p>
                    <p className="font-semibold text-foreground truncate">{data.bestDeal.title}</p>
                    <p className="text-sm text-muted-foreground">{data.bestDeal.store}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{data.bestDeal.price}</p>
                    <a
                      href={data.bestDeal.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline underline-offset-2 hover:text-primary/80"
                    >
                      View deal →
                    </a>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Results for <span className="text-primary">"{data.query}"</span>
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {data.results.length} results found
                  </p>
                </div>
              </div>

              {data.results.length === 0 ? (
                <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
                  <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
                  <p className="text-muted-foreground font-medium">No results found. Try a different search term.</p>
                </div>
              ) : (
                /* Comparison Table */
                <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Product</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Store</th>
                        <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Price</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Rating</th>
                        <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Delivery</th>
                        <th className="text-center px-4 py-3 font-semibold text-muted-foreground">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.results.map((result, i) => {
                        const isBest =
                          data.bestDeal &&
                          result.priceRaw !== null &&
                          result.priceRaw === data.bestDeal.priceRaw &&
                          result.store === data.bestDeal.store;

                        return (
                          <motion.tr
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`border-b border-border last:border-0 transition-colors ${
                              isBest
                                ? "bg-emerald-50/60 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "bg-card hover:bg-muted/30"
                            }`}
                          >
                            {/* Product */}
                            <td className="px-4 py-3 max-w-xs">
                              <div className="flex items-start gap-3">
                                {result.thumbnail && (
                                  <img
                                    src={result.thumbnail}
                                    alt={result.title}
                                    className="w-10 h-10 object-contain rounded-md border border-border flex-shrink-0"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground line-clamp-2 leading-snug">
                                    {result.title}
                                  </p>
                                  {isBest && (
                                    <Badge className="mt-1 bg-emerald-500 text-white text-xs px-2 py-0">
                                      Best Deal
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* Store */}
                            <td className="px-4 py-3">
                              <span className="font-medium text-foreground">{result.store}</span>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-3 text-right">
                              {result.price ? (
                                <span
                                  className={`font-bold text-base ${
                                    isBest
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-foreground"
                                  }`}
                                >
                                  {result.price}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">N/A</span>
                              )}
                            </td>

                            {/* Rating */}
                            <td className="px-4 py-3 text-center">
                              {result.rating ? (
                                <div className="inline-flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="font-medium text-foreground">{result.rating.toFixed(1)}</span>
                                  {result.reviews && (
                                    <span className="text-muted-foreground text-xs">
                                      ({result.reviews.toLocaleString()})
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>

                            {/* Delivery */}
                            <td className="px-4 py-3">
                              {result.delivery ? (
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span className="text-xs">{result.delivery}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>

                            {/* Link */}
                            <td className="px-4 py-3 text-center">
                              <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                              >
                                Buy
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
