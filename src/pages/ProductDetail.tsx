import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { StarRating } from "@/components/StarRating";
import { FlashSaleCountdown } from "@/components/FlashSaleCountdown";
import { AiReviews } from "@/components/AiReviews";
import { AiDescription } from "@/components/AiDescription";
import { FakeCompareTable } from "@/components/FakeCompareTable";
import { RelatedProducts } from "@/components/RelatedProducts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ArrowLeft, ExternalLink, ShoppingCart, Shield, Truck } from "lucide-react";
import {
  fetchProducts,
  getCachedProduct,
  getProductRating,
  getProductReviews,
  formatPrice,
  type Product,
} from "@/lib/api";
import { getAdminSettings } from "@/lib/store";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(
    (location.state as any)?.product || null
  );
  const [loading, setLoading] = useState(!product);
  const settings = getAdminSettings();

  useEffect(() => {
    if (!id || product) return;

    // Try cache first
    const cached = getCachedProduct(id);
    if (cached) {
      setProduct(cached);
      setLoading(false);
      return;
    }

    // Fetch from API
    setLoading(true);
    fetchProducts({ limit: 100, page: 1 })
      .then((res) => {
        const found = res.data.find((p) => p.product_id === id);
        setProduct(found || null);
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id, product]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto max-w-5xl px-4 py-8">
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
        <SEOHead title="ไม่พบสินค้า" description="ไม่พบสินค้าที่คุณกำลังค้นหา" />
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
  const currentPrice = hasDiscount ? product.product_discounted : product.product_price;

  const images = [product.product_picture];
  if (product.product_other_pictures) {
    product.product_other_pictures.split(",").forEach((img) => {
      const trimmed = img.trim();
      if (trimmed && !images.includes(trimmed)) images.push(trimmed);
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={product.product_name}
        description={`${product.product_name} — ${formatPrice(currentPrice, product.product_currency)} | ${product.category_name}`}
        image={product.product_picture}
        type="product"
        url={window.location.href}
        product={{
          name: product.product_name,
          price: currentPrice,
          currency: product.product_currency,
          image: product.product_picture,
          rating,
          reviewCount,
        }}
      />
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        <div className="grid gap-8 md:grid-cols-2 animate-fade-in">
          {/* Images */}
          <div className="space-y-3">
            <a href={product.tracking_link} target="_blank" rel="noopener noreferrer">
              <div className="overflow-hidden rounded-xl border bg-muted aspect-square group">
                <img
                  src={images[0]}
                  alt={product.product_name}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
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
                    className="overflow-hidden rounded-lg border bg-muted aspect-square group"
                  >
                    <img
                      src={img}
                      alt={`${product.product_name} ${idx + 2}`}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
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
              <Link to={`/category/${encodeURIComponent(product.category_name)}`}>
                <Badge variant="secondary" className="mb-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {product.category_name}
                </Badge>
              </Link>
              <h1 className="text-xl font-bold leading-tight text-foreground sm:text-2xl">
                {product.product_name}
              </h1>
            </div>

            <StarRating rating={rating} count={reviewCount} />

            <div className="space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(currentPrice, product.product_currency)}
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

            {/* Flash Sale Countdown */}
            {settings.enableFlashSale && hasDiscount && (
              <FlashSaleCountdown productId={product.product_id} />
            )}

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Shield, text: "สินค้าแท้ 100%" },
                { icon: Truck, text: "จัดส่งฟรี" },
                { icon: ShoppingCart, text: "สั่งซื้อง่าย" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {text}
                </div>
              ))}
            </div>

            <a
              href={product.tracking_link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button size="lg" className="w-full gap-2 text-base hover-scale">
                <ExternalLink className="h-5 w-5" />
                ซื้อสินค้านี้
              </Button>
            </a>
          </div>
        </div>

        {/* Product Description */}
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">คำอธิบายสินค้า</h2>
          <AiDescription
            productName={product.product_name}
            categoryName={product.category_name}
            price={currentPrice}
            currency={product.product_currency}
          />
        </div>

        {/* Product Details Section */}
        <div className="rounded-xl border bg-card p-6 space-y-4 animate-fade-in">
          <h2 className="text-lg font-bold">รายละเอียดสินค้า</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "ชื่อสินค้า", value: product.product_name },
              { label: "หมวดหมู่", value: product.category_name },
              { label: "ร้านค้า", value: product.advertiser_id },
              { label: "Shop ID", value: product.shop_id },
              { label: "สกุลเงิน", value: product.product_currency },
              { label: "ราคาปกติ", value: formatPrice(product.product_price, product.product_currency) },
              ...(hasDiscount
                ? [
                    { label: "ราคาลด", value: formatPrice(product.product_discounted, product.product_currency) },
                    { label: "ส่วนลด", value: `${product.product_discounted_percentage}%` },
                  ]
                : []),
              { label: "Product ID", value: product.product_id },
            ].map((item) => (
              <div key={item.label} className="space-y-0.5">
                <p className="text-muted-foreground text-xs">{item.label}</p>
                <p className="font-medium text-card-foreground break-all">{item.value}</p>
              </div>
            ))}
          </div>
          <a
            href={product.product_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-primary hover:underline"
          >
            ดูสินค้าบนร้านค้าต้นทาง →
          </a>
        </div>

        {/* Fake Compare Table */}
        <FakeCompareTable product={product} />

        {/* Reviews Section */}
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold">
              รีวิวจากผู้ซื้อ ({reviews.length})
            </h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border bg-card p-4 space-y-2 animate-fade-in"
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

          {/* AI Reviews */}
          {settings.enableAiReviews && (
            <AiReviews
              productName={product.product_name}
              categoryName={product.category_name}
              price={currentPrice}
              currency={product.product_currency}
            />
          )}
        </div>
        {/* Related Products */}
        <RelatedProducts product={product} />
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ThaiDeals — สินค้าดีลพิเศษ
      </footer>
    </div>
  );
}
