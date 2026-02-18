import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchProducts } from "@/lib/api";
import { getAdminSettings } from "@/lib/store";

export function useProducts(keyword?: string, categoryId?: string, page = 1) {
  const settings = getAdminSettings();
  const queryClient = useQueryClient();
  const advertiserIds = settings.selectedAdvertisers.length > 0
    ? settings.selectedAdvertisers.join(",")
    : undefined;

  const query = useQuery({
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

  // Prefetch next page
  useEffect(() => {
    if (query.data && page * 20 < query.data.meta.total) {
      queryClient.prefetchQuery({
        queryKey: ["products", keyword, categoryId, page + 1, advertiserIds],
        queryFn: () =>
          fetchProducts({
            keyword: keyword || undefined,
            category_id: categoryId || undefined,
            advertiser_id: advertiserIds,
            limit: 20,
            page: page + 1,
          }),
        staleTime: 1000 * 60 * 5,
      });
    }
  }, [query.data, page, keyword, categoryId, advertiserIds, queryClient]);

  return query;
}
