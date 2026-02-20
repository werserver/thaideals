import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { SearchBar } from "@/components/SearchBar";
import { KeywordTags } from "@/components/KeywordTags";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterBar, type SortOption } from "@/components/FilterBar";
import { PaginationBar } from "@/components/PaginationBar";
import { CompareTable } from "@/components/CompareTable";
import { PriceAlertBanner } from "@/components/PriceAlertBanner";
import { RecentlyViewed } from "@/components/RecentlyViewed";
import { FakePurchasePopup } from "@/components/FakePurchasePopup";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

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

  const filteredProducts = useMemo(() => {
    if (!data?.data) return [];
    let items = [...data.data];

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

    if (sort === "price-asc") {
      items.sort((a, b) => (a.product_discounted || a.product_price) - (b.product_discounted || b.product_price));
    } else if (sort === "price-desc") {
      items.sort((a, b) => (b.product_discounted || b.product_price) - (a.product_discounted || a.product_price));
    } else if (sort === "discount") {
      items.sort((a, b) => b.product_discounted_percentage - a.product_discounted_percentage);
    }

    return items;
  }, [data?.data, priceMin, priceMax, sort]);

  // Group products by category for display
  const categoryGroups = useMemo(() => {
    if (!filteredProducts.length || activeKeyword) return [];
    const groups: Record<string, typeof filteredProducts> = {};
    for (const p of filteredProducts) {
      const cat = p.category_name || "อื่นๆ";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    }
    return Object.entries(groups);
  }, [filteredProducts, activeKeyword]);

  return (
    <div className="min-h-screen bg-background">
      <PriceAlertBanner />
      <SEOHead />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Recently Viewed */}
        <RecentlyViewed />
        {/* Hero section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-8 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
          <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl relative">
            🛒 สินค้าดีลพิเศษ
          </h1>
          <p className="mt-2 text-sm text-primary-foreground/80 relative">
            รวมสินค้าลดราคา โปรโมชั่นสุดคุ้ม จากร้านค้าชั้นนำ
          </p>
          <div className="mt-5 flex justify-center relative">
            <SearchBar onSearch={handleSearch} initialValue={keyword} />
          </div>
        </div>

        <KeywordTags
          keywords={settings.keywords}
          onSelect={handleTagSelect}
          active={activeTag}
        />

        {/* Categories */}
        {settings.categories.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              หมวดหมู่
            </h2>
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((cat) => (
                <Link key={cat} to={`/category/${encodeURIComponent(cat)}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                    {cat}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        <FilterBar onPriceRange={handlePriceRange} onSort={setSort} sort={sort} />

        {/* Show by category when not searching */}
        {!activeKeyword && categoryGroups.length > 1 ? (
          <div className="space-y-8">
            {categoryGroups.map(([catName, products]) => (
              <div key={catName} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    {catName}
                    <span className="text-sm font-normal text-muted-foreground">({products.length})</span>
                  </h2>
                  <Link
                    to={`/category/${encodeURIComponent(catName)}`}
                    className="text-sm text-primary hover:underline"
                  >
                    ดูทั้งหมด →
                  </Link>
                </div>
                <ProductGrid products={products.slice(0, 10)} isLoading={false} />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Tabs: Grid vs Compare */}
            <Tabs defaultValue="grid">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  {activeKeyword ? `ผลการค้นหา "${activeKeyword}"` : "สินค้าแนะนำ"}
                </h2>
                <div className="flex items-center gap-3">
                  {data && (
                    <span className="text-sm text-muted-foreground">
                      {filteredProducts.length} รายการ
                    </span>
                  )}
                  <TabsList className="h-9">
                    <TabsTrigger value="grid" className="text-xs">แสดงสินค้า</TabsTrigger>
                    <TabsTrigger value="compare" className="text-xs">เปรียบเทียบ</TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <TabsContent value="grid">
                <ProductGrid products={filteredProducts} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="compare">
                {filteredProducts.length > 0 ? (
                  <CompareTable products={filteredProducts} />
                ) : (
                  <p className="text-center py-10 text-muted-foreground">ไม่มีสินค้าให้เปรียบเทียบ</p>
                )}
              </TabsContent>
            </Tabs>

            {data && (
              <PaginationBar
                currentPage={page}
                totalItems={data.meta.total}
                itemsPerPage={20}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ThaiDeals — สินค้าดีลพิเศษ
      </footer>

      {/* Fake Purchase Popup */}
      <FakePurchasePopup products={filteredProducts} />
    </div>
  );
};

export default Index;
