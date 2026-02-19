// Admin settings — re-exports from hardcoded config file
// Edit src/lib/config.ts to change defaults for each site deployment

import config, { type SiteConfig } from "@/lib/config";

export interface AdminSettings {
  categories: string[];
  keywords: string[];
  enableFlashSale: boolean;
  enableAiReviews: boolean;
  apiToken: string;
  selectedAdvertisers: string[];
  dataSource: "api" | "csv";
  csvFilePath: string;
}

export function getAdminSettings(): AdminSettings {
  return {
    categories: config.categories,
    keywords: config.keywords,
    enableFlashSale: config.enableFlashSale,
    enableAiReviews: config.enableAiReviews,
    apiToken: "",
    selectedAdvertisers: config.selectedAdvertisers,
    dataSource: config.dataSource,
    csvFilePath: config.csvFilePath,
  };
}

// No-op — settings are now hardcoded in config.ts
export function saveAdminSettings(_settings: AdminSettings) {
  console.info("Settings are hardcoded in src/lib/config.ts — edit that file to change defaults.");
}
