import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCompareProducts } from "@workspace/api-client-react";
import { SearchHero } from "@/components/SearchHero";
import { ResultCard } from "@/components/ResultCard";
import { HistorySection } from "@/components/HistorySection";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Target } from "lucide-react";

export default function Home() {
  const { mutate, isPending, data, isError, error } = useCompareProducts();

  const handleSearch = (query: string) => {
    mutate({ data: { query } });
  };

  // Auto-scroll to results when data loads
  useEffect(() => {
    if (data) {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header */}
      <header className="absolute top-0 w-full z-50 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => window.location.reload()}>
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="Price Agent Logo" 
              className="w-10 h-10 rounded-xl shadow-md"
            />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              PriceAgent
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <SearchHero onSearch={handleSearch} isLoading={isPending} />
        
        {!data && !isPending && !isError && (
          <HistorySection onSelectQuery={handleSearch} />
        )}

        {/* Results Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-border relative z-10">
                    <Spinner className="w-10 h-10" />
                  </div>
                </div>
                <h3 className="mt-6 font-display font-semibold text-xl text-foreground">
                  Scouring the web...
                </h3>
                <p className="mt-2 text-muted-foreground text-sm max-w-sm">
                  Our AI is comparing prices across Amazon, Flipkart, and Croma to find your perfect deal.
                </p>
              </motion.div>
            )}

            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 max-w-2xl mx-auto text-center"
              >
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="font-display font-bold text-xl text-destructive mb-2">
                  Failed to fetch comparisons
                </h3>
                <p className="text-destructive/80">
                  {error?.message || "An unexpected error occurred. Please try again with a different query."}
                </p>
              </motion.div>
            )}

            {data && !isPending && (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                  <Target className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      Comparison Results
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Showing best prices for <span className="font-semibold text-foreground">"{data.query}"</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  {data.results.map((result, index) => {
                    // Check if this is the best deal by comparing platform name
                    // In a real app, you might compare IDs, but here platform is unique per result
                    const isBestDeal = data.bestDeal && data.bestDeal.platform === result.platform;
                    
                    return (
                      <ResultCard 
                        key={`${result.platform}-${index}`} 
                        result={result} 
                        isBestDeal={isBestDeal}
                        index={index}
                      />
                    );
                  })}
                </div>
                
                {data.results.length === 0 && (
                  <div className="text-center py-20 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-border mt-8">
                    <p className="text-lg font-medium text-muted-foreground">No valid results found for this product.</p>
                    <p className="text-sm text-muted-foreground mt-2">Try being more specific or checking your spelling.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
