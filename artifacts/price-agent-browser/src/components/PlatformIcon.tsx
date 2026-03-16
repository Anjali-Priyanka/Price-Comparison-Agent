import React from "react";
import { ShoppingBag, ShoppingCart, Store } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlatformIconProps {
  platform: string;
  className?: string;
}

export function PlatformIcon({ platform, className }: PlatformIconProps) {
  const normalized = platform.toLowerCase();
  
  if (normalized.includes("amazon")) {
    return (
      <div className={cn("flex items-center justify-center bg-orange-100 text-orange-600 rounded-full p-2", className)}>
        <ShoppingCart className="w-5 h-5" />
      </div>
    );
  }
  
  if (normalized.includes("flipkart")) {
    return (
      <div className={cn("flex items-center justify-center bg-blue-100 text-blue-600 rounded-full p-2", className)}>
        <ShoppingBag className="w-5 h-5" />
      </div>
    );
  }
  
  if (normalized.includes("croma")) {
    return (
      <div className={cn("flex items-center justify-center bg-teal-100 text-teal-600 rounded-full p-2", className)}>
        <Store className="w-5 h-5" />
      </div>
    );
  }

  // Default fallback
  return (
    <div className={cn("flex items-center justify-center bg-gray-100 text-gray-600 rounded-full p-2", className)}>
      <Store className="w-5 h-5" />
    </div>
  );
}
