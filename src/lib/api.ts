const API_TOKEN = "QlpXZyCqMylKUjZiYchwB";
const PRODUCTS_URL = "https://ga.passio.eco/api/v3/products";

export interface Product {
  product_id: string;
  product_name: string;
  product_picture: string;
  product_other_pictures: string;
  product_price: number;
  product_discounted: number;
  product_discounted_percentage: number;
  product_currency: string;
  product_link: string;
  tracking_link: string;
  category_id: string;
  category_name: string;
  advertiser_id: string;
  shop_id: string;
}

export interface ProductsResponse {
  meta: { total: number; limit: number; page: number };
  data: Product[];
}

export interface FetchProductsParams {
  keyword?: string;
  category_id?: string;
  limit?: number;
  page?: number;
}

export async function fetchProducts(params: FetchProductsParams): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams({
    token: API_TOKEN,
    limit: String(params.limit ?? 20),
    page: String(params.page ?? 1),
  });

  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.category_id) searchParams.set("category_id", params.category_id);

  const res = await fetch(`${PRODUCTS_URL}?${searchParams.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

// Generate fake but consistent rating/review for a product
export function getProductRating(productId: string) {
  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) % 1000000;
  }
  const rating = 3.5 + (hash % 15) / 10;
  const reviewCount = 10 + (hash % 490);
  return { rating: Math.round(rating * 10) / 10, reviewCount };
}

// Generate fake reviews for product detail page
export function getProductReviews(productId: string) {
  const { rating } = getProductRating(productId);
  const reviewerNames = [
    "สมชาย ก.", "สมหญิง ข.", "วิชัย ค.", "ปิยะ ง.", "นภา จ.",
    "อรุณ ฉ.", "กมล ช.", "ดวงใจ ซ.", "มานี ส.", "ประเสริฐ พ.",
  ];
  const comments = [
    "สินค้าดีมาก คุ้มค่า ส่งเร็ว",
    "คุณภาพดี ตรงตามรูป แนะนำเลย",
    "พอใช้ได้ ราคาถูกดี",
    "ชอบมากค่ะ สั่งซ้ำแน่นอน",
    "ส่งไว แพ็คดี สินค้าสวย",
    "ราคาเทียบกับคุณภาพถือว่าโอเค",
    "ใช้ดีมาก คุ้มเงินที่จ่ายไป",
    "สินค้าเหมือนในรูป พอใจมาก",
    "ได้รับสินค้าเร็ว บรรจุภัณฑ์ดี",
    "แนะนำให้ซื้อเลย ไม่ผิดหวัง",
  ];

  let hash = 0;
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 37 + productId.charCodeAt(i)) % 1000000;
  }

  const count = 3 + (hash % 5);
  return Array.from({ length: count }).map((_, idx) => {
    const seed = (hash + idx * 7919) % 1000000;
    const reviewRating = Math.max(3, Math.min(5, Math.round(rating + (seed % 3 - 1))));
    return {
      id: `${productId}-review-${idx}`,
      name: reviewerNames[seed % reviewerNames.length],
      rating: reviewRating,
      comment: comments[seed % comments.length],
      date: `${2025 - (seed % 2)}-${String(1 + (seed % 12)).padStart(2, "0")}-${String(1 + (seed % 28)).padStart(2, "0")}`,
    };
  });
}

export function formatPrice(price: number, currency: string) {
  const currencyMap: Record<string, string> = {
    VND: "vi-VN",
    THB: "th-TH",
    IDR: "id-ID",
    PHP: "fil-PH",
    MYR: "ms-MY",
    SGD: "en-SG",
  };
  return new Intl.NumberFormat(currencyMap[currency] || "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
