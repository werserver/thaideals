import { useState, useEffect } from "react";
import { getAdminSettings, saveAdminSettings } from "@/lib/store";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [settings, setSettings] = useState(getAdminSettings);
  const [newCategory, setNewCategory] = useState("");
  const [newKeyword, setNewKeyword] = useState("");

  const addCategory = () => {
    const val = newCategory.trim();
    if (!val || settings.categories.includes(val)) return;
    setSettings((s) => ({ ...s, categories: [...s.categories, val] }));
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    setSettings((s) => ({ ...s, categories: s.categories.filter((c) => c !== cat) }));
  };

  const addKeyword = () => {
    const val = newKeyword.trim();
    if (!val || settings.keywords.includes(val)) return;
    setSettings((s) => ({ ...s, keywords: [...s.keywords, val] }));
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setSettings((s) => ({ ...s, keywords: s.keywords.filter((k) => k !== kw) }));
  };

  const handleSave = () => {
    saveAdminSettings(settings);
    toast.success("บันทึกการตั้งค่าเรียบร้อย!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">หมวดหมู่สินค้า</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((cat) => (
                <Badge key={cat} variant="secondary" className="gap-1 pr-1">
                  {cat}
                  <button onClick={() => removeCategory(cat)} className="rounded-full p-0.5 hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="เพิ่มหมวดหมู่..."
                onKeyDown={(e) => e.key === "Enter" && addCategory()}
              />
              <Button size="sm" onClick={addCategory}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">คำค้นหลัก</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {settings.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                  {kw}
                  <button onClick={() => removeKeyword(kw)} className="rounded-full p-0.5 hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="เพิ่มคำค้น..."
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button size="sm" onClick={addKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} className="w-full gap-2">
          <Save className="h-4 w-4" />
          บันทึกการตั้งค่า
        </Button>
      </main>
    </div>
  );
}
