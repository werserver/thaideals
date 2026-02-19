import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { AdminLogin } from "@/components/AdminLogin";
import { isAdminLoggedIn, logoutAdmin, changePassword, changeUsername, getUsername } from "@/lib/auth";
import { getAdminSettings } from "@/lib/store";
import config from "@/lib/config";
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
  Clock, CheckCircle, XCircle, LogOut, Settings, BarChart3, KeyRound, Key, Store,
  Database, FileSpreadsheet, Info,
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">🛠 Admin Panel</h1>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => { logoutAdmin(); setAuthed(false); }}
          >
            <LogOut className="h-4 w-4" />
            ออกจากระบบ
          </Button>
        </div>

        <Tabs defaultValue="settings">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="settings" className="gap-1.5">
              <Settings className="h-4 w-4" />
              ตั้งค่า
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-1.5">
              <KeyRound className="h-4 w-4" />
              ความปลอดภัย
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>
          <TabsContent value="security" className="mt-6">
            <SecurityTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

/* ========== Settings Tab ========== */
function SettingsTab() {
  const settings = getAdminSettings();

  return (
    <div className="space-y-6">
      {/* Data Source Info */}
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
          <div className="flex items-center gap-2">
            <Badge variant={config.dataSource === "api" ? "default" : "secondary"}>
              {config.dataSource === "api" ? "API (Passio/Ecomobi)" : "CSV File"}
            </Badge>
            {config.dataSource === "csv" && (
              <span className="text-xs text-muted-foreground font-mono">{config.csvFilePath}</span>
            )}
          </div>
          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              การตั้งค่าทั้งหมดถูก hardcode ในไฟล์ <code className="font-mono bg-muted px-1 rounded">src/lib/config.ts</code> เพื่อรองรับการ deploy หลายเว็บไซต์พร้อมกัน
              แก้ไขไฟล์นั้นเพื่อเปลี่ยนแหล่งข้อมูล, หมวดหมู่, คำค้น และอื่นๆ
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Token - managed server-side */}
      {config.dataSource === "api" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Token (Passio/Ecomobi)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">API Token ถูกจัดการฝั่ง Server อย่างปลอดภัยแล้ว ไม่สามารถแก้ไขจากที่นี่ได้</p>
          </CardContent>
        </Card>
      )}

      {/* Advertisers (API mode only) */}
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

      {/* Categories (read-only) */}
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

      {/* Keywords (read-only) */}
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

      {/* Feature toggles (read-only) */}
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

      {error && <div className="rounded-xl border border-sale/30 bg-sale/10 p-4 text-sm text-sale">{error}</div>}

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
              <CardTitle className="text-sm font-medium text-muted-foreground">รายได้อนุมัติ</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-success">{fmt(stats.totalApproved)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">รออนุมัติ</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold text-accent">{fmt(stats.totalPending)}</p></CardContent>
          </Card>
        </div>
      )}

      {/* Status badges */}
      {!loading && conversions.length > 0 && (
        <div className="flex gap-3">
          <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> รออนุมัติ: {stats.statusCounts.pending}</Badge>
          <Badge variant="outline" className="gap-1"><CheckCircle className="h-3 w-3 text-success" /> อนุมัติ: {stats.statusCounts.approved}</Badge>
          <Badge variant="outline" className="gap-1"><XCircle className="h-3 w-3 text-sale" /> ปฏิเสธ: {stats.statusCounts.rejected}</Badge>
        </div>
      )}

      {/* Table */}
      {!loading && (
        <div className="rounded-xl border bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>ร้านค้า</TableHead>
                <TableHead>วันที่</TableHead>
                <TableHead>ยอดขาย</TableHead>
                <TableHead>รายได้</TableHead>
                <TableHead>จำนวน</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">ไม่พบข้อมูล Conversion</TableCell>
                </TableRow>
              ) : (
                conversions.map((c) => (
                  <TableRow key={c._id}>
                    <TableCell className="text-xs font-mono">{c.adv_order_id}</TableCell>
                    <TableCell className="text-sm">{c.advertiser}</TableCell>
                    <TableCell className="text-sm">{c.time}</TableCell>
                    <TableCell className="text-sm font-medium">{fmt(c.sale_amount)}</TableCell>
                    <TableCell className="text-sm">
                      {c.payout_approved > 0 && <span className="text-success font-medium">{fmt(c.payout_approved)}</span>}
                      {c.payout_pending > 0 && <span className="text-accent font-medium">{fmt(c.payout_pending)}</span>}
                      {c.payout_rejected > 0 && <span className="text-sale font-medium">{fmt(c.payout_rejected)}</span>}
                    </TableCell>
                    <TableCell className="text-sm">{c.item_count}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ========== Security Tab ========== */
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernamePassword, setUsernamePassword] = useState("");

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 6) {
      toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }
    if (changePassword(currentPassword, newPassword)) {
      toast.success("เปลี่ยนรหัสผ่านเรียบร้อย!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("รหัสผ่านปัจจุบันไม่ถูกต้อง");
    }
  };

  const handleChangeUsername = () => {
    if (!usernamePassword || !newUsername.trim()) return;
    if (newUsername.trim().length < 3) {
      toast.error("ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร");
      return;
    }
    if (changeUsername(usernamePassword, newUsername.trim())) {
      toast.success("เปลี่ยนชื่อผู้ใช้เรียบร้อย!");
      setNewUsername("");
      setUsernamePassword("");
    } else {
      toast.error("รหัสผ่านไม่ถูกต้อง");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            เปลี่ยนรหัสผ่าน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>รหัสผ่านปัจจุบัน</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="กรอกรหัสผ่านปัจจุบัน" />
          </div>
          <div className="space-y-2">
            <Label>รหัสผ่านใหม่</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)" />
          </div>
          <div className="space-y-2">
            <Label>ยืนยันรหัสผ่านใหม่</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" />
          </div>
          <Button onClick={handleChangePassword} className="gap-2">
            <Save className="h-4 w-4" />
            บันทึกรหัสผ่านใหม่
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เปลี่ยนชื่อผู้ใช้</CardTitle>
          <p className="text-sm text-muted-foreground">ชื่อผู้ใช้ปัจจุบัน: <strong>{getUsername()}</strong></p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ชื่อผู้ใช้ใหม่</Label>
            <Input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder="กรอกชื่อผู้ใช้ใหม่" />
          </div>
          <div className="space-y-2">
            <Label>ยืนยันรหัสผ่าน</Label>
            <Input type="password" value={usernamePassword} onChange={(e) => setUsernamePassword(e.target.value)} placeholder="กรอกรหัสผ่านเพื่อยืนยัน" />
          </div>
          <Button onClick={handleChangeUsername} className="gap-2">
            <Save className="h-4 w-4" />
            บันทึกชื่อผู้ใช้ใหม่
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
