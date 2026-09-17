"use client";

import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  PieChart as PieIcon, 
  Calendar,
  Download
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";

export default function ReportsPage() {
  const { transactions, products } = useAppStore();
  const [activeTab, setActiveTab] = useState<"sales" | "products" | "profit">("sales");

  // Calculations for Reports
  const reportData = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    const productStats: Record<string, { name: string; category: string; qty: number; revenue: number; cost: number; profit: number }> = {};

    transactions.forEach((tx) => {
      totalRevenue += tx.total;

      tx.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.product_id);
        const buyPrice = prod ? prod.buy_price : item.unit_price * 0.5;
        const lineCost = buyPrice * item.quantity;
        const lineProfit = item.subtotal - lineCost;

        totalCost += lineCost;

        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            name: item.product_name,
            category: prod?.category_name || "Menu",
            qty: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }

        productStats[item.product_id].qty += item.quantity;
        productStats[item.product_id].revenue += item.subtotal;
        productStats[item.product_id].cost += lineCost;
        productStats[item.product_id].profit += lineProfit;
      });
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

    // Chart trend by day
    const trendMap: Record<string, { date: string; omzet: number; profit: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      trendMap[key] = { date: label, omzet: 0, profit: 0 };
    }

    transactions.forEach((tx) => {
      const key = tx.created_at.slice(0, 10);
      if (trendMap[key]) {
        trendMap[key].omzet += tx.total;
        // estimate 50% profit margin
        trendMap[key].profit += tx.total * 0.48;
      }
    });

    const chartTrend = Object.values(trendMap);
    const sortedProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      profitMargin,
      chartTrend,
      sortedProducts,
    };
  }, [transactions, products]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-primary">
            Laporan Keuangan & Analitik
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Pantau arus pendapatan, estimasi laba kotor, dan kontribusi profit tiap produk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </Button>
        </div>
      </div>

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Total Omzet (Revenue)
          </span>
          <div className="text-2xl font-bold font-mono text-ink-primary mt-2">
            {formatRupiah(reportData.totalRevenue)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Akumulasi dari {transactions.length} transaksi</div>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Estimasi HPP (Modal)
          </span>
          <div className="text-2xl font-bold font-mono text-slate-700 mt-2">
            {formatRupiah(reportData.totalCost)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Total modal bahan baku terjual</div>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Estimasi Laba Kotor
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-600 mt-2">
            {formatRupiah(reportData.grossProfit)}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Omzet dikurangi HPP</div>
        </Card>

        <Card>
          <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-800">
            Rasio Profit Margin
          </span>
          <div className="text-2xl font-bold font-mono text-terracotta-600 mt-2">
            {reportData.profitMargin}%
          </div>
          <div className="text-xs text-slate-500 mt-1">Efisiensi margin operasional</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "sales"
              ? "border-terracotta-500 text-terracotta-600"
              : "border-transparent text-slate-500 hover:text-ink-primary"
          }`}
        >
          Tren Penjualan & Profit
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-terracotta-500 text-terracotta-600"
              : "border-transparent text-slate-500 hover:text-ink-primary"
          }`}
        >
          Performa Penjualan Produk
        </button>
      </div>

      {/* Tab Content 1: Sales Chart */}
      {activeTab === "sales" && (
        <Card>
          <CardHeader>
            <CardTitle>Tren Arus Pendapatan 7 Hari Terakhir</CardTitle>
            <CardDescription>Grafik perbandingan omzet dan estimasi laba kotor</CardDescription>
          </CardHeader>
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData.chartTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E05338" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E05338" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 11 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [formatRupiah(Number(val)), ""]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="omzet" name="Omzet Penjualan" stroke="#E05338" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOmzet)" />
                <Area type="monotone" dataKey="profit" name="Estimasi Profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Tab Content 2: Products Performance Table */}
      {activeTab === "products" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-ink-secondary text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Menu</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4 text-center">Jumlah Terjual</th>
                  <th className="py-3.5 px-4 text-right">Total Omzet</th>
                  <th className="py-3.5 px-4 text-right">Total Modal (HPP)</th>
                  <th className="py-3.5 px-4 text-right">Profit Kotor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.sortedProducts.map((p) => (
                  <tr key={p.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-ink-primary">{p.name}</td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">{p.category}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-ink-primary">
                      {formatNumber(p.qty)} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-primary">
                      {formatRupiah(p.revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                      {formatRupiah(p.cost)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600">
                      {formatRupiah(p.profit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
