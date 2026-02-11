import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { KeywordTags } from "@/components/KeywordTags";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterBar, type SortOption } from "@/components/FilterBar";
import { PaginationBar } from "@/components/PaginationBar";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import type { Product } from "@/lib/api";

const Index = () => {
  const settings = getAdminSettings();
  const [keyword, setKeyword] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("default");
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();

  const activeKeyword = keyword || activeTag;
  const { data, isLoading } = useProducts(activeKeyword, undefined, page);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setActiveTag("");
    setPage(1);
  };

  const handleTagSelect = (kw: string) => {
    setActiveTag(kw);
    setKeyword("");
    setPage(1);
  };

  const handlePriceRange = (min: number | undefined, max: number | undefined) => {
    setPriceMin(min);
    setPriceMax(max);
  };

  // Client-side filter & sort
  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    let items = [...data.data];

    // Price filter
    if (priceMin !== undefined) {
      items = items.filter((p) => {
        const price = p.product_discounted || p.product_price;
        return price >= priceMin;
      });
    }
    if (priceMax !== undefined) {
      items = items.filter((p) => {
        const price = p.product_discounted || p.product_price;
        return price <= priceMax;
      });
    }

    // Sort
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
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Hero section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            🛒 สินค้าดีลพิเศษ
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80">
            รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ
          </p>
          <div className="mt-5 flex justify-center">
            <SearchBar onSearch={handleSearch} initialValue={keyword} />
          </div>
        </div>

        {/* Keyword tags */}
        <KeywordTags
          keywords={settings.keywords}
          onSelect={handleTagSelect}
          active={activeTag}
        />

        {/* Filter bar */}
        <FilterBar onPriceRange={handlePriceRange} onSort={setSort} sort={sort} />

        {/* Products */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {activeKeyword ? `ผลการค้นหา "${activeKeyword}"` : "สินค้าแนะนำ"}
            </h2>
            {data && (
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} รายการ
              </span>
            )}
          </div>
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </div>

        {/* Pagination */}
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
};

export default Index;
