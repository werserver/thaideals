import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { fetchConversions, type Conversion } from "@/lib/api";

export default function Dashboard() {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Default dates: last 90 days
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

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = conversions.length;
    const totalSales = conversions.reduce((s, c) => s + c.sale_amount, 0);
    const totalApproved = conversions.reduce((s, c) => s + c.payout_approved, 0);
    const totalPending = conversions.reduce((s, c) => s + c.payout_pending, 0);
    const totalRejected = conversions.reduce((s, c) => s + c.payout_rejected, 0);
    const statusCounts = { pending: 0, approved: 0, rejected: 0 };
    conversions.forEach((c) => {
      if (c.status in statusCounts) statusCounts[c.status as keyof typeof statusCounts]++;
    });
    return { totalOrders, totalSales, totalApproved, totalPending, totalRejected, statusCounts };
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

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Dashboard — สถิติ Conversion"
        description="ดูสถิติยอดขาย Conversion และรายได้จาก Affiliate"
      />
      <Header />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">📊 Dashboard สถิติ</h1>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">วันเริ่ม</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40 h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">วันสิ้นสุด</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40 h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">สถานะ</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
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

        {error && (
          <div className="rounded-xl border border-sale/30 bg-sale/10 p-4 text-sm text-sale">
            {error}
          </div>
        )}

        {/* Stats cards */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ออเดอร์ทั้งหมด</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">ยอดขายรวม</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalSales)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">รายได้อนุมัติ</CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalApproved)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">รายได้รออนุมัติ</CardTitle>
                <Clock className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-accent">{formatCurrency(stats.totalPending)}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status summary */}
        {!loading && conversions.length > 0 && (
          <div className="flex gap-3">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" /> รออนุมัติ: {stats.statusCounts.pending}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <CheckCircle className="h-3 w-3 text-success" /> อนุมัติ: {stats.statusCounts.approved}
            </Badge>
            <Badge variant="outline" className="gap-1">
              <XCircle className="h-3 w-3 text-sale" /> ปฏิเสธ: {stats.statusCounts.rejected}
            </Badge>
          </div>
        )}

        {/* Conversions table */}
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
                  <TableHead>จำนวนสินค้า</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      ไม่พบข้อมูล Conversion ในช่วงวันที่เลือก
                    </TableCell>
                  </TableRow>
                ) : (
                  conversions.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="text-xs font-mono">{c.adv_order_id}</TableCell>
                      <TableCell className="text-sm">{c.advertiser}</TableCell>
                      <TableCell className="text-sm">{c.time}</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(c.sale_amount)}</TableCell>
                      <TableCell className="text-sm">
                        {c.payout_approved > 0 && (
                          <span className="text-success font-medium">{formatCurrency(c.payout_approved)}</span>
                        )}
                        {c.payout_pending > 0 && (
                          <span className="text-accent font-medium">{formatCurrency(c.payout_pending)}</span>
                        )}
                        {c.payout_rejected > 0 && (
                          <span className="text-sale font-medium">{formatCurrency(c.payout_rejected)}</span>
                        )}
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
      </main>
    </div>
  );
}
