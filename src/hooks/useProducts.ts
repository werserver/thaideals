import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";

export function useProducts(keyword?: string, categoryId?: string, page = 1) {
  return useQuery({
    queryKey: ["products", keyword, categoryId, page],
    queryFn: () =>
      fetchProducts({
        keyword: keyword || undefined,
        category_id: categoryId || undefined,
        limit: 20,
        page,
      }),
    staleTime: 1000 * 60 * 5,
  });
}
