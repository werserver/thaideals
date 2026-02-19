// ============================================================
// Site Configuration — Hardcoded for multi-site deployment
// Edit this file to configure each website instance
// ============================================================

export type DataSource = "api" | "csv";

export interface SiteConfig {
  /** Site name shown in header/footer */
  siteName: string;
  /** Data source: "api" (Passio/Ecomobi) or "csv" (uploaded CSV file) */
  dataSource: DataSource;
  /** Path to CSV file in public folder (used when dataSource = "csv") */
  csvFilePath: string;
  /** Product categories for navigation */
  categories: string[];
  /** Search keyword tags */
  keywords: string[];
  /** Advertiser IDs to filter (empty = show all, API mode only) */
  selectedAdvertisers: string[];
  /** Enable flash sale countdown on product pages */
  enableFlashSale: boolean;
  /** Enable AI-generated reviews */
  enableAiReviews: boolean;
  /** Default currency for CSV products */
  defaultCurrency: string;
}

const config: SiteConfig = {
  siteName: "ThaiDeals",
  dataSource: "api",
  csvFilePath: "/data/products.csv",
  categories: [
    "Electronics",
    "Fashion",
    "Home & Living",
    "Health & Beauty",
    "Sports & Outdoors",
  ],
  keywords: [
    "โปรโมชั่น",
    "ลดราคา",
    "สินค้ายอดนิยม",
    "ของใช้ในบ้าน",
    "แฟชั่น",
  ],
  selectedAdvertisers: [],
  enableFlashSale: true,
  enableAiReviews: true,
  defaultCurrency: "THB",
};

export default config;
