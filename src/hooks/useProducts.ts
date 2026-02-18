import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { getAdminSettings } from "@/lib/store";

export function useProducts(keyword?: string, categoryId?: string, page = 1) {
  const settings = getAdminSettings();
  const advertiserIds = settings.selectedAdvertisers.length > 0
    ? settings.selectedAdvertisers.join(",")
    : undefined;

  return useQuery({
    queryKey: ["products", keyword, categoryId, page, advertiserIds],
    queryFn: () =>
      fetchProducts({
        keyword: keyword || undefined,
        category_id: categoryId || undefined,
        advertiser_id: advertiserIds,
        limit: 20,
        page,
      }),
    staleTime: 1000 * 60 * 5,
  });
}
