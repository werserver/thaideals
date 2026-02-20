import { useState, useEffect, useMemo, useRef } from "react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdminLoggedIn, logoutAdmin, getUsername } from "@/lib/auth";
import { getAdminSettings, saveAdminSettings, saveCsvData, type AdminSettings } from "@/lib/store";
import { clearCsvCache } from "@/lib/csv-products";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  X, Plus, Save, Flame, Sparkles, DollarSign, ShoppingCart,
  Clock, CheckCircle, XCircle, LogOut, Settings, BarChart3,
  Key, Upload, FileSpreadsheet, Database, Tag,
} from "lucide-react";
import { toast } from "sonner";
import { fetchConversions, type Conversion } from "@/lib/api";

export default function AdminPanel() {
  const [authed, setAuthed] = useState(isAdminLoggedIn);

  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Admin Panel" description="จัดการระบบและดูสถิติ" />
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">🛠 Admin Panel</h1>
          <Button
            variant="destructive"
            size="sm"
            className="gap-1.5"
            onClick={() => { logoutAdmin(); setAuthed(false); }}
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>

        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" />
              ตั้งค่า
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ========== Settings Tab ========== */
function SettingsTab() {
  const [settings, setSettings] = useState<AdminSettings>(getAdminSettings);
  const [newCategory, setNewCategory] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCategory, setUploadingCategory] = useState("");

  const update = (partial: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleSave = () => {
    saveAdminSettings(settings);
    clearCsvCache();
    toast.success("บันทึกการตั้งค่าเรียบร้อย!");
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "site-config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success("ส่งออกการตั้งค่าเรียบร้อย!");
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        setSettings(imported);
        toast.success("นำเข้าการตั้งค่าเรียบร้อย! อย่าลืมกดบันทึก");
      } catch (err) {
        toast.error("ไฟล์ไม่ถูกต้อง");
      }
    };
    reader.readAsText(file);
  };

  const addCategory = () => {
    const cat = newCategory.trim();
    if (!cat || settings.categories.includes(cat)) return;
    update({ categories: [...settings.categories, cat] });
    setNewCategory("");
  };

  const removeCategory = (cat: string) => {
    const newMap = { ...settings.categoryCsvMap };
    const newFileNames = { ...settings.categoryCsvFileNames };
    delete newMap[cat];
    delete newFileNames[cat];
    update({
      categories: settings.categories.filter((c) => c !== cat),
      categoryCsvMap: newMap,
      categoryCsvFileNames: newFileNames,
    });
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw || settings.keywords.includes(kw)) return;
    update({ keywords: [...settings.keywords, kw] });
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    update({ keywords: settings.keywords.filter((k) => k !== kw) });
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      saveCsvData(text);
      clearCsvCache();
      update({ csvFileName: file.name, dataSource: "csv" });
      toast.success(`อัปโหลดไฟล์ ${file.name} เรียบร้อย!`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCategoryCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingCategory) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("กรุณาเลือกไฟล์ .csv เท่านั้น");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      clearCsvCache();
      update({
        categoryCsvMap: { ...settings.categoryCsvMap, [uploadingCategory]: text },
        categoryCsvFileNames: { ...settings.categoryCsvFileNames, [uploadingCategory]: file.name },
      });
      toast.success(`อัปโหลด CSV สำหรับ "${uploadingCategory}" เรียบร้อย!`);
      setUploadingCategory("");
    };
    reader.readAsText(file);
    if (categoryFileInputRef.current) categoryFileInputRef.current.value = "";
  };

  const triggerCategoryUpload = (catName: string) => {
    setUploadingCategory(catName);
    setTimeout(() => categoryFileInputRef.current?.click(), 50);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-3 rounded-xl border border-dashed">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9"
            onClick={exportConfig}
          >
            <Upload className="h-4 w-4 rotate-180" />
            Export Config
          </Button>
          <label className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-9 pointer-events-none"
            >
              <Upload className="h-4 w-4" />
              Import Config
            </Button>
            <input type="file" accept=".json" className="hidden" onChange={importConfig} />
          </label>
        </div>
        <Button
          variant="default"
          size="sm"
          className="gap-1.5 h-9 ml-auto shadow-md"
          onClick={handleSave}
        >
          <Save className="h-4 w-4" />
          บันทึกการตั้งค่าทั้งหมด
        </Button>
      </div>

      {/* Data Source */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            แหล่งข้อมูลสินค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              variant={settings.dataSource === "api" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => update({ dataSource: "api" })}
            >
              <Database className="h-4 w-4" />
              API (Passio/Ecomobi)
            </Button>
            <Button
              variant={settings.dataSource === "csv" ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => update({ dataSource: "csv" })}
            >
              <FileSpreadsheet className="h-4 w-4" />
              CSV File
            </Button>
          </div>

          {/* CSV Upload */}
          {settings.dataSource === "csv" && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <p className="text-sm font-medium">CSV ทั่วไป (ใช้เมื่อไม่มี CSV ตามหมวดหมู่)</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  อัปโหลดไฟล์ CSV
                </Button>
                {settings.csvFileName && (
                  <span className="text-sm text-muted-foreground">
                    📄 {settings.csvFileName}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCsvUpload}
              />
              <div className="space-y-2 mt-3">
                <Label className="text-sm font-medium">URL Cloaking Base URL</Label>
                <Input
                  placeholder="https://goeco.mobi/?token=QlpXZyCqMylKUjZiYchwB"
                  value={settings.cloakingBaseUrl}
                  onChange={(e) => update({ cloakingBaseUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  ระบบจะสร้างลิงก์เป็น: base_url&url=encoded_product_url&source=api_product
                </p>
              </div>

              {/* URL Cloaking for CSV Mode */}
              <div className="pt-3 border-t space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  URL Cloaking Token (ตัวเลือก)
                </Label>
                <Input
                  placeholder="กรอก token (ตัวอย่าง: Q1pXZyCqMylKUjZiYchwB)"
                  value={settings.cloakingToken || ""}
                  onChange={(e) => update({ cloakingToken: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  URL ที่แสดงผล: <span className="font-mono text-primary">https://goeco.mobi/?token={settings.cloakingToken || "YOUR_TOKEN"}&url=...&source=api_product</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Token */}
      {settings.dataSource === "api" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Token (Passio/Ecomobi)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="กรอก API Token ที่นี่"
              value={settings.apiToken}
              onChange={(e) => update({ apiToken: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Token จะถูกเก็บใน localStorage ของเบราว์เซอร์นี้
            </p>
          </CardContent>
        </Card>
      )}

      {/* Categories with CSV upload per category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            หมวดหมู่สินค้า
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {settings.categories.map((cat) => (
              <div key={cat} className="flex items-center gap-2 rounded-lg border p-3">
                <Badge variant="secondary" className="text-sm">{cat}</Badge>
                <div className="flex-1 text-xs text-muted-foreground">
                  {settings.categoryCsvFileNames?.[cat]
                    ? `📄 ${settings.categoryCsvFileNames[cat]}`
                    : settings.dataSource === "csv" ? "ยังไม่มี CSV" : ""}
                </div>
                {settings.dataSource === "csv" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs"
                    onClick={() => triggerCategoryUpload(cat)}
                  >
                    <Upload className="h-3 w-3" />
                    แนบ CSV
                  </Button>
                )}
                <button
                  onClick={() => removeCategory(cat)}
                  className="rounded-full p-1 hover:bg-destructive/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="เพิ่มหมวดหมู่..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
              className="max-w-xs"
            />
            <Button size="sm" variant="outline" onClick={addCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <input
            ref={categoryFileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCategoryCsvUpload}
          />
        </CardContent>
      </Card>

      {/* Keywords */}
      <Card>
        <CardHeader><CardTitle className="text-lg">คำค้นหลัก</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {settings.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="gap-1 pr-1">
                {kw}
                <button
                  onClick={() => removeKeyword(kw)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="เพิ่มคำค้น..."
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              className="max-w-xs"
            />
            <Button size="sm" variant="outline" onClick={addKeyword}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Feature toggles */}
      <Card>
        <CardHeader><CardTitle className="text-lg">ออฟชั่นเสริม</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-destructive/10 p-2"><Flame className="h-5 w-5 text-destructive" /></div>
              <div>
                <Label className="font-medium">Flash Sale Countdown</Label>
                <p className="text-xs text-muted-foreground">แสดงเวลานับถอยหลังเร่งการซื้อ</p>
              </div>
            </div>
            <Switch
              checked={settings.enableFlashSale}
              onCheckedChange={(v) => update({ enableFlashSale: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-primary/10 p-2"><Sparkles className="h-5 w-5 text-primary" /></div>
              <div>
                <Label className="font-medium">AI Reviews (Gemini Flash)</Label>
                <p className="text-xs text-muted-foreground">ใช้ AI สร้างรีวิวสินค้าอัตโนมัติ</p>
              </div>
            </div>
            <Switch
              checked={settings.enableAiReviews}
              onCheckedChange={(v) => update({ enableAiReviews: v })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-accent/30 p-2"><Tag className="h-5 w-5 text-accent-foreground" /></div>
              <div>
                <Label className="font-medium">คำนำหน้าสินค้า (Prefix Words)</Label>
                <p className="text-xs text-muted-foreground">สุ่มคำเช่น "ถูกที่สุด", "ลดราคา" นำหน้าชื่อสินค้าและ URL</p>
              </div>
            </div>
            <Switch
              checked={settings.enablePrefixWords}
              onCheckedChange={(v) => update({ enablePrefixWords: v })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="sticky bottom-4 flex justify-end">
        <Button size="lg" className="gap-2 shadow-lg" onClick={handleSave}>
          <Save className="h-5 w-5" />
          บันทึกการตั้งค่า
        </Button>
      </div>
    </div>
  );
}

/* ========== Dashboard Tab ========== */
function DashboardTab() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const today = new Date().toISOString().split("T")[0];
  const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(ninetyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const loadData = () => {
    setLoading(true);
    setError("");
    fetchConversions({
      start_date: startDate,
      end_date: endDate,
      status: statusFilter !== "all" ? statusFilter : undefined,
      limit: 100,
      page: 1,
    })
      .then((res) => setConversions(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => {
    const totalOrders = conversions.length;
    const totalSales = conversions.reduce((s, c) => s + c.sale_amount, 0);
    const totalApproved = conversions.reduce((s, c) => s + c.payout_approved, 0);
    const totalPending = conversions.reduce((s, c) => s + c.payout_pending, 0);
    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    conversions.forEach((c) => {
      if (c.status in statusCounts) statusCounts[c.status as keyof typeof statusCounts]++;
    });
    return { totalOrders, totalSales, totalApproved, totalPending, statusCounts };
  }, [conversions]);

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "รออนุมัติ", className: "bg-accent text-accent-foreground" },
      approved: { label: "อนุมัติ", className: "bg-success text-primary-foreground" },
      rejected: { label: "ปฏิเสธ", className: "bg-sale text-primary-foreground" },
    };
    const info = map[status] || { label: status, className: "" };
    return <Badge className={`border-0 ${info.className}`}>{info.label}</Badge>;
  };

  const fmt = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">วันเริ่ม</label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-40 h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">วันสิ้นสุด</label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-40 h-9 text-sm" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">สถานะ</label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36 h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="pending">รออนุมัติ</SelectItem>
              <SelectItem value="approved">อนุมัติ</SelectItem>
              <SelectItem value="rejected">ปฏิเสธ</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={loadData}>ค้นหา</Button>
      </div>

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {/* Stats */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ออเดอร์</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{stats.totalOrders}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">ยอดขาย</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{fmt(stats.totalSales)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">อนุมัติแล้ว</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-success">{fmt(stats.totalApproved)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รอดำเนินการ</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-accent">{fmt(stats.totalPending)}</p></CardContent>
          </Card>
        </div>
      )}

      {/* Conversion Table */}
      {!loading && conversions.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">รายการ Conversions</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>Advertiser</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>ยอดขาย</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversions.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="text-xs">{new Date(c.time).toLocaleDateString("th-TH")}</TableCell>
                      <TableCell className="text-xs">{c.advertiser}</TableCell>
                      <TableCell className="text-xs font-mono">{c.adv_order_id}</TableCell>
                      <TableCell className="text-xs">{fmt(c.sale_amount)}</TableCell>
                      <TableCell>{statusBadge(c.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
