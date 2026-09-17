"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight,
  Store,
  Clock,
  PackageCheck
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatRupiah, formatNumber, formatDateIndonesia } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

export default function DashboardPage() {
  const { transactions, products, currentUser } = useAppStore();

  // Compute analytics dynamically based on transaction data
  const {
    todaySales,
    todayCount,
    averageBasket,
    monthSales,
    chartData,
    topProducts,
    lowStockProducts,
  } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = transactions.filter((t) => t.created_at.slice(0, 10) === today);

    const todaySales = todayTxs.reduce((sum, t) => sum + t.total, 0);
    const todayCount = todayTxs.length;
    const averageBasket = todayCount > 0 ? Math.round(todaySales / todayCount) : 0;
    const monthSales = transactions.reduce((sum, t) => sum + t.total, 0);

    // Group last 7 days for Recharts
    const last7DaysMap: Record<string, { dateLabel: string; omzet: number; count: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dateLabel = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      last7DaysMap[dateKey] = { dateLabel, omzet: 0, count: 0 };
    }

    transactions.forEach((tx) => {
      const dateKey = tx.created_at.slice(0, 10);
      if (last7DaysMap[dateKey]) {
        last7DaysMap[dateKey].omzet += tx.total;
        last7DaysMap[dateKey].count += 1;
      }
    });

    const chartData = Object.values(last7DaysMap);

    // Top 5 selling products calculation
    const productSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    transactions.forEach((tx) => {
      tx.items.forEach((item) => {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = { name: item.product_name, qty: 0, revenue: 0 };
        }
        productSalesMap[item.product_id].qty += item.quantity;
        productSalesMap[item.product_id].revenue += item.subtotal;
      });
    });

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Low stock products alert
    const lowStockProducts = products.filter((p) => p.stock_qty <= p.min_stock);

    return {
      todaySales,
      todayCount,
      averageBasket,
      monthSales,
      chartData,
      topProducts,
      lowStockProducts,
    };
  }, [transactions, products]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-serif font-bold text-ink-primary">
              Selamat Datang, {currentUser.name}
            </h2>
            <Badge variant="terracotta" className="capitalize">
              {currentUser.role}
            </Badge>
          </div>
          <p className="text-sm text-ink-secondary">
            Berikut adalah performa operasional toko hari ini, {formatDateIndonesia(new Date().toISOString())}.
          </p>
        </div>
        <Link href="/pos">
          <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md">
            <Store className="w-5 h-5" />
            <span>Mulai Transaksi Kasir</span>
          </Button>
        </Link>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Penjualan Hari Ini
            </span>
            <div className="w-9 h-9 rounded-lg bg-terracotta-50 text-terracotta-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-ink-primary">
              {formatRupiah(todaySales)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dari {todayCount} transaksi hari ini</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Jumlah Transaksi
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-ink-primary">
              {formatNumber(todayCount)} Transaksi
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Tercatat di sistem POS</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Rata-rata Keranjang
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-ink-primary">
              {formatRupiah(averageBasket)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <span>Nilai rata-rata per struk belanja</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Revenue 7 Hari Terakhir
            </span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-ink-primary">
              {formatRupiah(monthSales)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <span>Total dari seluruh transaksi aktif</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Sales Trend Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts 7 Days Omzet */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tren Penjualan 7 Hari Terakhir</CardTitle>
                <CardDescription>Grafik omzet harian yang diperoleh dari operasional kasir</CardDescription>
              </div>
              <Badge variant="neutral">Mingguan</Badge>
            </div>
          </CardHeader>
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="dateLabel" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), "Omzet"]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar 
                  dataKey="omzet" 
                  fill="#E05338" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Low Stock Alert */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <CardTitle>Peringatan Stok Menipis</CardTitle>
                <CardDescription>Produk yang mendekati atau di bawah batas minimum</CardDescription>
              </div>
            </div>
          </CardHeader>
          <div className="flex-1 space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs flex flex-col items-center gap-2">
                <PackageCheck className="w-8 h-8 text-emerald-500" />
                <span>Semua stok produk dalam kondisi aman.</span>
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-200/80"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink-primary">{p.name}</div>
                    <div className="text-xs text-slate-500 font-mono">SKU: {p.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-700 font-mono">
                      Sisa: {p.stock_qty}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Min: {p.min_stock}</span>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="pt-4 mt-auto border-t border-slate-100">
            <Link href="/products">
              <Button variant="outline" size="sm" className="w-full">
                <span>Kelola Inventaris Produk</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Top 5 Products & Recent Transactions Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>5 Produk Terlaris</CardTitle>
            <CardDescription>Item dengan volume penjualan terbanyak</CardDescription>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {topProducts.map((p, index) => (
              <div key={p.name} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-ink-primary">{p.name}</div>
                    <div className="text-xs text-slate-500">{p.qty} porsi terjual</div>
                  </div>
                </div>
                <div className="text-right font-mono font-semibold text-sm text-terracotta-600">
                  {formatRupiah(p.revenue)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Transaksi Terkini</CardTitle>
                <CardDescription>Aktivitas pembayaran kasir terbaru</CardDescription>
              </div>
              <Link href="/transactions" className="text-xs text-terracotta-600 font-semibold hover:underline">
                Lihat Semua
              </Link>
            </div>
          </CardHeader>
          <div className="divide-y divide-slate-100">
            {transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div>
                  <div className="text-sm font-mono font-bold text-ink-primary">{tx.invoice_number}</div>
                  <div className="text-xs text-slate-500">
                    Kasir: {tx.cashier_name} • {tx.payment_method.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-ink-primary">
                    {formatRupiah(tx.total)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {formatDateIndonesia(tx.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
