import { Header } from "@/components/Header";
import { getAdminSettings } from "@/lib/store";
import config from "@/lib/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Flame, Sparkles, Key, Store, Database, FileSpreadsheet, Info } from "lucide-react";

export default function Admin() {
  const settings = getAdminSettings();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">ตั้งค่าระบบ</h1>

        {/* Data Source */}
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {config.dataSource === "csv" ? (
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              ) : (
                <Database className="h-5 w-5 text-primary" />
              )}
              แหล่งข้อมูลสินค้า
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant={config.dataSource === "api" ? "default" : "secondary"}>
              {config.dataSource === "api" ? "API (Passio/Ecomobi)" : "CSV File"}
            </Badge>
            <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                การตั้งค่าทั้งหมดถูก hardcode ในไฟล์ <code className="font-mono bg-muted px-1 rounded">src/lib/config.ts</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* API Token */}
        {config.dataSource === "api" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Token (Passio/Ecomobi)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">API Token ถูกจัดการฝั่ง Server อย่างปลอดภัยแล้ว</p>
            </CardContent>
          </Card>
        )}

        {/* Advertisers */}
        {config.dataSource === "api" && settings.selectedAdvertisers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Store className="h-5 w-5" />
                Advertiser (ร้านค้า)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {settings.selectedAdvertisers.map((adv) => (
                  <Badge key={adv} variant="secondary">{adv}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <Card>
          <CardHeader><CardTitle className="text-lg">หมวดหมู่สินค้า</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settings.categories.map((cat) => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Keywords */}
        <Card>
          <CardHeader><CardTitle className="text-lg">คำค้นหลัก</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settings.keywords.map((kw) => (
                <Badge key={kw} variant="secondary">{kw}</Badge>
              ))}
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
              <Badge variant={settings.enableFlashSale ? "default" : "secondary"}>
                {settings.enableFlashSale ? "เปิด" : "ปิด"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2"><Sparkles className="h-5 w-5 text-primary" /></div>
                <div>
                  <Label className="font-medium">AI Reviews (Gemini Flash)</Label>
                  <p className="text-xs text-muted-foreground">ใช้ AI สร้างรีวิวสินค้าอัตโนมัติ</p>
                </div>
              </div>
              <Badge variant={settings.enableAiReviews ? "default" : "secondary"}>
                {settings.enableAiReviews ? "เปิด" : "ปิด"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
