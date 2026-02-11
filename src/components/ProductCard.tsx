import { getProductRating, formatPrice, type Product } from "@/lib/api";
import { StarRating } from "./StarRating";
import { WishlistButton } from "./WishlistButton";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { productPath } from "@/lib/slug";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { rating, reviewCount } = getProductRating(product.product_id);
  const hasDiscount = product.product_discounted_percentage > 0;

  return (
    <div className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in">
      <a
        href={product.tracking_link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
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
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <WishlistButton product={product} />
          </div>
        </div>
      </a>

      <div className="p-3 space-y-2">
        <a
          href={product.tracking_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground hover:text-primary transition-colors">
            {product.product_name}
          </h3>
        </a>

        <StarRating rating={rating} count={reviewCount} />

        <a
          href={product.tracking_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {formatPrice(hasDiscount ? product.product_discounted : product.product_price, product.product_currency)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.product_price, product.product_currency)}
              </span>
            )}
          </div>
        </a>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground truncate">
            {product.category_name}
          </p>
          <Link
            to={productPath(product.product_id, product.product_name)}
            state={{ product }}
            className="text-xs text-primary font-medium hover:underline shrink-0 ml-2"
            onClick={(e) => e.stopPropagation()}
          >
            ดูรายละเอียด
          </Link>
        </div>
      </div>
    </div>
  );
}
