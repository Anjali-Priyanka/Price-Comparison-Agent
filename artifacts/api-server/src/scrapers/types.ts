export interface PlatformResult {
  platform: string;
  title?: string;
  price?: number | null;
  originalPrice?: number | null;
  discount?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  shippingCost?: number | null;
  deliveryEstimate?: string | null;
  effectivePrice?: number | null;
  link: string;
  imageUrl?: string | null;
  inStock: boolean;
  error?: string | null;
}
