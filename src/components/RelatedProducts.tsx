import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type Product } from "@/lib/api";
import { ProductCard } from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RelatedProductsProps {
  product: Product;
}

export function RelatedProducts({ product }: RelatedProductsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["related", product.category_name],
    queryFn: () => fetchProducts({ keyword: product.category_name, limit: 10, page: 1 }),
    staleTime: 1000 * 60 * 5,
  });

  const related = data?.data.filter((p) => p.product_id !== product.product_id).slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h2 className="text-lg font-bold">สินค้าที่เกี่ยวข้อง</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border bg-card p-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-5 w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!related.length) return null;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-lg font-bold">สินค้าที่เกี่ยวข้อง</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {related.map((p) => (
          <ProductCard key={p.product_id} product={p} />
        ))}
      </div>
    </div>
  );
}
