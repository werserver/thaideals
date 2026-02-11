import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { KeywordTags } from "@/components/KeywordTags";
import { ProductGrid } from "@/components/ProductGrid";
import { useProducts } from "@/hooks/useProducts";
import { getAdminSettings } from "@/lib/store";

const Index = () => {
  const settings = getAdminSettings();
  const [keyword, setKeyword] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const activeKeyword = keyword || activeTag;

  const { data, isLoading } = useProducts(activeKeyword);

  const handleSearch = (kw: string) => {
    setKeyword(kw);
    setActiveTag("");
  };

  const handleTagSelect = (kw: string) => {
    setActiveTag(kw);
    setKeyword("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Hero section */}
        <div className="rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
            🛒 สินค้าดีลพิเศษจากไทย
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

        {/* Products */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            {activeKeyword ? `ผลการค้นหา "${activeKeyword}"` : "สินค้าแนะนำ"}
          </h2>
          <ProductGrid products={data?.data} isLoading={isLoading} />
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © 2026 ThaiDeals — สินค้าดีลพิเศษจากไทย
      </footer>
    </div>
  );
};

export default Index;
