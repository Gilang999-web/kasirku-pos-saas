"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart3, 
  FileSpreadsheet,
  FileText,
  Loader2
} from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts";
import Papa from "papaparse";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"sales" | "products">("sales");
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [reportData, setReportData] = useState({
    totalRevenue: 0,
    totalCost: 0,
    grossProfit: 0,
    profitMargin: "0",
    chartTrend: [] as any[],
    sortedProducts: [] as any[],
  });

  useEffect(() => {
    async function fetchReportData() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/reports");
        const json = await res.json();
        if (json.success && json.data) {
          setReportData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReportData();
  }, []);

  const handleExportCSV = () => {
    if (reportData.sortedProducts.length === 0) return;

    const today = new Date().toISOString().slice(0, 10);

    const summaryRows = [
      { "Laporan": "Ringkasan Keuangan", "Nilai": "" },
      { "Laporan": "Total Omzet (Revenue)", "Nilai": reportData.totalRevenue },
      { "Laporan": "Estimasi HPP (Modal)", "Nilai": reportData.totalCost },
      { "Laporan": "Estimasi Laba Kotor", "Nilai": reportData.grossProfit },
      { "Laporan": `Rasio Profit Margin`, "Nilai": `${reportData.profitMargin}%` },
      { "Laporan": "", "Nilai": "" },
    ];

    const productRows = reportData.sortedProducts.map((p) => ({
      "Nama Produk": p.name,
      "Kategori": p.category,
      "Terjual (Qty)": p.qty,
      "Total Omzet": p.revenue,
      "Total HPP (Modal)": p.cost,
      "Profit Kotor": p.profit,
    }));

    const summaryCsv = Papa.unparse(summaryRows);
    const productCsv = Papa.unparse(productRows);
    const fullCsv = `${summaryCsv}\n\n${productCsv}`;

    const blob = new Blob(["\uFEFF" + fullCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Penjualan_KasirKu_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    setIsExportingPdf(true);

    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const productTableRows = reportData.sortedProducts
      .map(
        (p, i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:12px;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;font-size:12px;">${p.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;color:#64748b;font-size:12px;">${p.category}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-family:monospace;font-size:12px;">${formatNumber(p.qty)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;font-size:12px;">${formatRupiah(p.revenue)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;color:#64748b;font-size:12px;">${formatRupiah(p.cost)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-family:monospace;color:#16a34a;font-weight:600;font-size:12px;">${formatRupiah(p.profit)}</td>
        </tr>`
      )
      .join("");

    const printContent = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <title>Laporan Keuangan KasirKu - ${today}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #0f172a; line-height: 1.5; }
          .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #e05338; margin-bottom: 24px; }
          .header-left { display: flex; align-items: center; gap: 12px; }
          .logo { width: 40px; height: 40px; background: #e05338; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; font-family: Georgia, serif; }
          .brand { font-size: 22px; font-weight: 700; font-family: Georgia, serif; }
          .date { font-size: 12px; color: #64748b; text-align: right; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .kpi-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
          .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: #64748b; }
          .kpi-value { font-size: 20px; font-weight: 700; font-family: monospace; margin-top: 4px; }
          .kpi-desc { font-size: 10px; color: #94a3b8; margin-top: 2px; }
          .section-title { font-size: 14px; font-weight: 700; margin-bottom: 12px; font-family: Georgia, serif; }
          table { width: 100%; border-collapse: collapse; }
          thead th { padding: 8px 12px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; color: #64748b; text-align: left; }
          .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="header-left">
            <div class="logo">K</div>
            <div class="brand">KasirKu</div>
          </div>
          <div class="date">
            <div style="font-weight:600;color:#0f172a;">Laporan Keuangan &amp; Analitik</div>
            <div>Dicetak: ${today}</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Omzet (Revenue)</div>
            <div class="kpi-value">${formatRupiah(reportData.totalRevenue)}</div>
            <div class="kpi-desc">Keseluruhan omzet</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Estimasi HPP (Modal)</div>
            <div class="kpi-value" style="color:#334155;">${formatRupiah(reportData.totalCost)}</div>
            <div class="kpi-desc">Total modal bahan baku terjual</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label" style="color:#15803d;">Estimasi Laba Kotor</div>
            <div class="kpi-value" style="color:#16a34a;">${formatRupiah(reportData.grossProfit)}</div>
            <div class="kpi-desc">Omzet dikurangi HPP</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label" style="color:#c2410c;">Rasio Profit Margin</div>
            <div class="kpi-value" style="color:#ea580c;">${reportData.profitMargin}%</div>
            <div class="kpi-desc">Efisiensi margin operasional</div>
          </div>
        </div>

        <div class="section-title">Performa Penjualan Per Produk</div>
        <table>
          <thead>
            <tr>
              <th style="text-align:center;width:40px;">No</th>
              <th>Nama Produk</th>
              <th>Kategori</th>
              <th style="text-align:center;">Terjual</th>
              <th style="text-align:right;">Total Omzet</th>
              <th style="text-align:right;">Total HPP</th>
              <th style="text-align:right;">Profit Kotor</th>
            </tr>
          </thead>
          <tbody>
            ${productTableRows}
          </tbody>
        </table>

        <div class="footer">
          Dokumen ini di-generate oleh KasirKu Cloud POS pada ${today}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=1100,height=700");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
        setIsExportingPdf(false);
      };
      setTimeout(() => setIsExportingPdf(false), 3000);
    } else {
      setIsExportingPdf(false);
    }
  };

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
            onClick={handleExportCSV}
            className="text-xs"
            disabled={isLoading || reportData.sortedProducts.length === 0}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV (Excel)</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            className="text-xs"
            disabled={isLoading || isExportingPdf || reportData.sortedProducts.length === 0}
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            <span>Ekspor PDF</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-editorial">
                <div className="h-3 bg-slate-100 rounded w-24 mb-3" />
                <div className="h-8 bg-slate-100 rounded w-32 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-20" />
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial p-6">
            <div className="h-5 bg-slate-100 rounded w-48 mb-2" />
            <div className="h-3 bg-slate-100 rounded w-80 mb-6" />
            <div className="h-64 bg-slate-50 rounded-lg" />
          </div>
        </div>
      ) : reportData.sortedProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial p-12 text-center">
          <div className="mx-auto w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <BarChart3 className="w-7 h-7 text-slate-300" />
          </div>
          <h3 className="text-base font-semibold text-ink-primary mb-1">
            Belum Ada Data Laporan
          </h3>
          <p className="text-sm text-ink-secondary">
            Data laporan akan muncul setelah ada transaksi yang diselesaikan melalui layar kasir.
          </p>
        </div>
      ) : (
        <>
          {/* 4 Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Total Omzet (Revenue)
              </span>
              <div className="text-2xl font-bold font-mono text-ink-primary mt-2">
                {formatRupiah(reportData.totalRevenue)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Keseluruhan omzet</div>
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
        </>
      )}
    </div>
  );
}
