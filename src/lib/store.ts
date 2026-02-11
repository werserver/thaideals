// Admin settings stored in localStorage

export interface AdminSettings {
  categories: string[];
  keywords: string[];
}

const STORAGE_KEY = "aff-shop-admin";

const defaultSettings: AdminSettings = {
  categories: ["Electronics", "Fashion", "Home & Living", "Health & Beauty", "Sports & Outdoors"],
  keywords: ["โปรโมชั่น", "ลดราคา", "สินค้ายอดนิยม", "ของใช้ในบ้าน", "แฟชั่น"],
};

export function getAdminSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultSettings;
}

export function saveAdminSettings(settings: AdminSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
