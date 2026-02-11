import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { StarRating } from "@/components/StarRating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowLeft, ExternalLink } from "lucide-react";
import {
  fetchProducts,
  getProductRating,
  getProductReviews,
  formatPrice,
  type Product,
} from "@/lib/api";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    // Search product by keyword (product_id) — API doesn't support direct ID lookup
    fetchProducts({ keyword: id, limit: 100, page: 1 })
      .then((res) => {
        const found = res.data.find((p) => p.product_id === id);
        setProduct(found || null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid gap-8 md:grid-cols-2">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="text-xl font-medium text-muted-foreground">ไม่พบสินค้า</p>
          <Link to="/" className="mt-4 inline-block text-primary hover:underline">
            กลับหน้าแรก
          </Link>
        </main>
      </div>
    );
  }

  const { rating, reviewCount } = getProductRating(product.product_id);
  const reviews = getProductReviews(product.product_id);
  const hasDiscount = product.product_discounted_percentage > 0;

  const images = [product.product_picture];
  if (product.product_other_pictures) {
    product.product_other_pictures.split(",").forEach((img) => {
      const trimmed = img.trim();
      if (trimmed && !images.includes(trimmed)) images.push(trimmed);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-8">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        {/* Product main */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Images */}
          <div className="space-y-3">
            <a href={product.tracking_link} target="_blank" rel="noopener noreferrer">
              <div className="overflow-hidden rounded-xl border bg-muted aspect-square">
                <img
                  src={images[0]}
                  alt={product.product_name}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            </a>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img, idx) => (
                  <a
                    key={idx}
                    href={product.tracking_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="overflow-hidden rounded-lg border bg-muted aspect-square"
                  >
                    <img
                      src={img}
                      alt={`${product.product_name} ${idx + 2}`}
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category_name}
              </Badge>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {product.product_name}
              </h1>
            </div>

            <StarRating rating={rating} count={reviewCount} />

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(
                    hasDiscount ? product.product_discounted : product.product_price,
                    product.product_currency
                  )}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">
                      {formatPrice(product.product_price, product.product_currency)}
                    </span>
                    <Badge className="bg-sale text-primary-foreground border-0">
                      -{product.product_discounted_percentage}%
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p>ร้านค้า: {product.advertiser_id}</p>
              <p>Shop ID: {product.shop_id}</p>
            </div>

            <a
              href={product.tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full gap-2 text-base">
                <ExternalLink className="h-5 w-5" />
                ซื้อสินค้านี้
              </Button>
            </a>
          </div>
        </div>

        {/* Reviews */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            รีวิวจากผู้ซื้อ ({reviews.length})
          </h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-xl border bg-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{review.name}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i <= review.rating
                          ? "fill-star text-star"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-card-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ThaiDeals — สินค้าดีลพิเศษ
      </footer>
    </div>
  );
}
