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

export async function fetchProducts(params: {
  keyword?: string;
  category_id?: string;
  limit?: number;
  page?: number;
}): Promise<ProductsResponse> {
  const searchParams = new URLSearchParams({
    token: API_TOKEN,
    currency: "THB",
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
  const rating = 3.5 + (hash % 15) / 10; // 3.5 - 5.0
  const reviewCount = 10 + (hash % 490); // 10 - 500
  return { rating: Math.round(rating * 10) / 10, reviewCount };
}
