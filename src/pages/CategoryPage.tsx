import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterBar, type SortOption } from "@/components/FilterBar";
import { PaginationBar } from "@/components/PaginationBar";
import { SearchBar } from "@/components/SearchBar";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import { ArrowLeft, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CategoryPage() {
  const { name } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name || "");
  const settings = getAdminSettings();

  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("default");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();

  const { data, isLoading } = useProducts(keyword || categoryName, undefined, page);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    let items = [...data.data];

    if (priceMin !== undefined) {
      items = items.filter((p) => (p.product_discounted || p.product_price) >= priceMin);
    }
    if (priceMax !== undefined) {
      items = items.filter((p) => (p.product_discounted || p.product_price) <= priceMax);
    }

    if (sort === "price-asc") {
      items.sort((a, b) => (a.product_discounted || a.product_price) - (b.product_discounted || b.product_price));
    } else if (sort === "price-desc") {
      items.sort((a, b) => (b.product_discounted || b.product_price) - (a.product_discounted || a.product_price));
    } else if (sort === "discount") {
      items.sort((a, b) => b.product_discounted_percentage - a.product_discounted_percentage);
    }

    return items;
  }, [data?.data, priceMin, priceMax, sort]);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`${categoryName} — สินค้าดีลพิเศษ`}
        description={`รวมสินค้า ${categoryName} ลดราคา โปรโมชั่นสุดคุ้ม`}
      />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-6 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.12),transparent_60%)]" />
          <div className="relative flex items-center gap-3 mb-3">
            <Tag className="h-6 w-6 text-primary-foreground" />
            <h1 className="text-2xl font-bold text-primary-foreground">{categoryName}</h1>
          </div>
          <div className="relative">
            <SearchBar onSearch={handleSearch} initialValue={keyword} />
          </div>
        </div>

        {/* Other categories */}
        <div className="flex flex-wrap gap-2">
          {settings.categories
            .filter((c) => c !== categoryName)
            .map((cat) => (
              <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-secondary transition-colors">
                  {cat}
                </Badge>
              </Link>
            ))}
        </div>

        <FilterBar
          onPriceRange={(min, max) => { setPriceMin(min); setPriceMax(max); }}
          onSort={setSort}
          sort={sort}
        />

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {keyword ? `ผลการค้นหา "${keyword}" ใน ${categoryName}` : `สินค้าใน ${categoryName}`}
          </h2>
          {data && (
            <span className="text-sm text-muted-foreground">
              {filteredProducts.length} รายการ
            </span>
          )}
        </div>

        <ProductGrid products={filteredProducts} isLoading={isLoading} />

        {data && (
          <PaginationBar
            currentPage={page}
            totalItems={data.meta.total}
            itemsPerPage={20}
            onPageChange={setPage}
          />
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ThaiDeals — สินค้าดีลพิเศษ
      </footer>
    </div>
  );
}
