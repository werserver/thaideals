import { getProductRating, type Product } from "@/lib/api";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { rating, reviewCount } = getProductRating(product.product_id);
  const hasDiscount = product.product_discounted_percentage > 0;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" }).format(price);

  return (
    <a
      href={product.tracking_link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.product_picture}
          alt={product.product_name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {hasDiscount && (
          <Badge className="absolute left-2 top-2 bg-sale text-primary-foreground border-0 text-xs font-semibold">
            -{product.product_discounted_percentage}%
          </Badge>
        )}
      </div>

      <div className="p-3 space-y-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
          {product.product_name}
        </h3>

        <StarRating rating={rating} count={reviewCount} />

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(hasDiscount ? product.product_discounted : product.product_price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.product_price)}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground truncate">
          {product.category_name}
        </p>
      </div>
    </a>
  );
}
