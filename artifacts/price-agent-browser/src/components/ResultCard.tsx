import React from "react";
import { motion } from "framer-motion";
import { PlatformResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlatformIcon } from "@/components/PlatformIcon";
import { formatCurrency } from "@/lib/utils";
import { ExternalLink, Star, Truck, AlertCircle, Image as ImageIcon } from "lucide-react";

interface ResultCardProps {
  result: PlatformResult;
  isBestDeal?: boolean;
  index: number;
}

export function ResultCard({ result, isBestDeal, index }: ResultCardProps) {
  const hasError = !!result.error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Card 
        className={`h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative ${
          isBestDeal ? 'ring-2 ring-success shadow-success/20' : 'hover:border-primary/30'
        }`}
      >
        {isBestDeal && (
          <div className="absolute top-0 inset-x-0 h-1.5 bg-success z-10" />
        )}
        
        <CardHeader className="pb-4 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <PlatformIcon platform={result.platform} />
              <div>
                <h3 className="font-display font-semibold text-lg">{result.platform}</h3>
                {!hasError && result.inStock && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Truck className="w-3 h-3" />
                    <span>{result.deliveryEstimate || 'Standard Delivery'}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isBestDeal && (
              <Badge variant="success" className="animate-pulse shadow-sm">
                Best Deal
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col pb-6">
          {hasError ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-red-50/50 rounded-xl border border-red-100">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <p className="text-sm font-medium text-red-800">Scraping Failed</p>
              <p className="text-xs text-red-600 mt-1">{result.error}</p>
            </div>
          ) : (
            <>
              {/* Product Info */}
              <div className="flex gap-4 mb-5 items-start">
                <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {result.imageUrl ? (
                    <img 
                      src={result.imageUrl} 
                      alt={result.title || 'Product'} 
                      className="w-full h-full object-contain p-2 mix-blend-multiply"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                    {result.title || "Product Title Unavailable"}
                  </h4>
                  
                  {result.rating && (
                    <div className="flex items-center gap-1 mt-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-semibold">{result.rating}</span>
                      {result.reviewCount && (
                        <span className="text-xs text-muted-foreground">
                          ({result.reviewCount.toLocaleString()})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {!result.inStock && (
                    <Badge variant="destructive" className="mt-2 text-[10px]">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>

              {/* Price Details */}
              <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-sm text-muted-foreground">Effective Price</span>
                  <div className="text-right">
                    <span className="font-display font-bold text-2xl text-foreground">
                      {formatCurrency(result.effectivePrice ?? result.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  {result.originalPrice && result.originalPrice > (result.price ?? 0) ? (
                    <span className="text-muted-foreground line-through decoration-gray-300">
                      {formatCurrency(result.originalPrice)}
                    </span>
                  ) : (
                    <span /> /* Spacer */
                  )}
                  
                  <div className="flex items-center gap-2">
                    {result.shippingCost !== null && result.shippingCost !== undefined && (
                      <span className="text-muted-foreground">
                        + {result.shippingCost === 0 ? 'Free Shipping' : formatCurrency(result.shippingCost)}
                      </span>
                    )}
                    {result.discount && result.discount > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-bold px-1.5 py-0">
                        {result.discount}% OFF
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="pt-0">
          <Button 
            className="w-full font-semibold group" 
            variant={isBestDeal ? "success" : "default"}
            disabled={hasError || !result.inStock}
            onClick={() => {
              if (result.link) window.open(result.link, '_blank');
            }}
          >
            {hasError ? 'Unavailable' : !result.inStock ? 'Out of Stock' : 'View Deal'}
            {!hasError && result.inStock && (
              <ExternalLink className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
