import React from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { useGetSearchHistory } from "@workspace/api-client-react";

interface HistorySectionProps {
  onSelectQuery: (query: string) => void;
}

export function HistorySection({ onSelectQuery }: HistorySectionProps) {
  const { data, isLoading } = useGetSearchHistory({ limit: 5 });

  if (isLoading || !data?.history || data.history.length === 0) {
    return null; // Hide if empty or loading
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
    >
      <div className="flex items-center gap-2 mb-4 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <h3 className="text-sm font-medium">Recent Searches</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {data.history.map((record) => (
          <button
            key={record.id}
            onClick={() => onSelectQuery(record.query)}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 text-sm font-medium text-foreground hover:text-primary active:scale-95"
          >
            {record.query}
            <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}
