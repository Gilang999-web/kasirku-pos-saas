"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Store, 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Receipt, 
  BarChart3, 
  Package, 
  Keyboard, 
  Clock, 
  Zap,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRupiah } from "@/lib/utils";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  return (
    <div className="min-h-screen bg-canvas-light text-ink-primary flex flex-col selection:bg-terracotta-100 selection:text-terracotta-800">
      {/* Global Navigation */}
      <header className="h-20 bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold text-xl shadow-sm">
              K
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-ink-primary block leading-none">
                KasirKu
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta-600 mt-1 block">
                Cloud POS SaaS
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-secondary">
            <a href="#fitur" className="hover:text-ink-primary transition-colors">
              Fitur Unggulan
            </a>
            <a href="#demo" className="hover:text-ink-primary transition-colors">
              Alur Kasir POS
            </a>
            <a href="#harga" className="hover:text-ink-primary transition-colors">
              Paket Langganan
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm">
                Masuk
              </Button>
            </Link>
            <Link href="/pos">
              <Button variant="primary" size="sm" className="shadow-sm text-xs sm:text-sm">
                <Store className="w-4 h-4" />
                <span>Buka Demo POS</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-grid-blueprint py-16 sm:py-24 px-4 sm:px-8 border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-semibold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />
            <span>Sistem Kasir Web Khusus Usaha Kuliner & Retail Indonesia</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-ink-primary leading-[1.15] max-w-4xl mx-auto">
            Sistem Kasir Digital Cepat, Akurat, dan Mudah Digunakan
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-ink-secondary max-w-2xl mx-auto leading-relaxed">
            Gantikan pencatatan buku manual dengan kasir digital berbasis web. Proses transaksi hitungan detik, cetak struk termal instan, dan kontrol stok barang secara akurat.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/pos" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto shadow-md">
                <Store className="w-5 h-5" />
                <span>Coba Langsung Layar POS</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <BarChart3 className="w-5 h-5" />
                <span>Lihat Dashboard Owner</span>
              </Button>
            </Link>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Akses demo instan tanpa perlu kartu kredit. Data contoh UMKM siap pakai.
          </p>

          {/* Interactive POS Terminal Preview Box */}
          <div className="mt-12 bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-elevated max-w-4xl mx-auto text-left overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="font-mono text-slate-400 ml-2">KasirKu POS Terminal v1.0</span>
              </div>
              <span className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                ● Status: Ready for Cashier
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Katalog Menu Populer
                  </span>
                  <span className="text-xs font-mono text-slate-400">Shortcut: F2 (Cari)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-ink-primary">Kopi Susu Aren</div>
                    <div className="text-xs font-mono text-terracotta-600 font-bold mt-1">Rp 20.000</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-ink-primary">Cold Brew Sig.</div>
                    <div className="text-xs font-mono text-terracotta-600 font-bold mt-1">Rp 25.000</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <div className="text-xs font-bold text-ink-primary">Croissant Mentega</div>
                    <div className="text-xs font-mono text-terracotta-600 font-bold mt-1">Rp 22.000</div>
                  </div>
                </div>
              </div>

              <div className="bg-terracotta-50/50 p-4 rounded-xl border border-terracotta-200/70 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-terracotta-800 mb-2">
                    Tiket Kasir Aktif
                  </div>
                  <div className="space-y-1 font-mono text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>2x Kopi Susu Aren</span>
                      <span>Rp 40.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Croissant</span>
                      <span>Rp 22.000</span>
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-terracotta-200 mt-4">
                  <div className="flex justify-between font-bold font-mono text-sm text-ink-primary">
                    <span>TOTAL</span>
                    <span className="text-terracotta-600">Rp 62.000</span>
                  </div>
                  <Link href="/pos" className="block mt-2">
                    <button className="w-full py-2 bg-terracotta-500 text-white rounded-lg text-xs font-bold text-center hover:bg-terracotta-600 transition-colors">
                      BAYAR (F8)
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="fitur" className="py-20 px-4 sm:px-8 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-serif font-bold text-ink-primary">
              Dirancang untuk Kecepatan Kasir di Jam Ramai
            </h2>
            <p className="mt-3 text-sm text-ink-secondary">
              Setiap tombol dan alur transaksi dioptimalkan agar kasir dapat melayani antrean tanpa jeda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-canvas-light flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center mb-2">
                <Keyboard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">Keyboard Accelerators</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Navigasi layar kasir tanpa mouse: tekan F2 untuk cari produk, F4 untuk diskon, F8 untuk pembayaran instan, dan F9 untuk cetak ulang nota.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-canvas-light flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">Struk Termal Standar 80mm</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Format struk monokrom kontras tinggi yang kompatibel dengan printer kasir termal Bluetooth dan USB, lengkap dengan catatan kaki toko.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200/90 bg-canvas-light flex flex-col gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-ink-primary">Kontrol Stok & Peringatan Otomatis</h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Stok berkurang otomatis saat pembayaran sukses. Notifikasi peringatan langsung muncul ketika stok produk mendekati batas aman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (DESIGN.md Section 5.2, 5.3, 6.1) */}
      <section id="harga" className="py-20 px-4 sm:px-8 bg-grid-blueprint border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-bold text-ink-primary">
              Paket Langganan Sederhana & Transparan
            </h2>
            <p className="mt-3 text-sm text-ink-secondary">
              Pilih paket yang sesuai dengan jumlah kasir dan skala outlet usaha Anda.
            </p>

            {/* Segmented Control Billing Toggle */}
            <div className="inline-flex items-center mt-6 p-1 bg-white border border-slate-200 rounded-full shadow-sm">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === "monthly"
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-ink-primary"
                }`}
              >
                Tagihan Bulanan
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  billingCycle === "annual"
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-ink-primary"
                }`}
              >
                <span>Tagihan Tahunan</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  Hemat 20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Starter Tier */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-editorial flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink-primary">Starter</h3>
                <p className="text-xs text-slate-500 mt-1">Cocok untuk warung dan stan minuman tunggal.</p>
                <div className="my-6">
                  <span className="text-3xl font-serif font-bold text-ink-primary font-mono">
                    {billingCycle === "annual" ? "Rp 39.000" : "Rp 49.000"}
                  </span>
                  <span className="text-xs text-slate-500"> / bulan</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>1 Lisensi Kasir Terminal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Maksimal 100 Item Menu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Cetak Struk Digital & Termal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Laporan Penjualan Harian</span>
                  </li>
                </ul>
              </div>
              <Link href="/pos" className="mt-8 block">
                <Button variant="outline" className="w-full text-xs">
                  Pilih Paket Starter
                </Button>
              </Link>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="bg-white p-7 rounded-2xl border-2 border-terracotta-500 shadow-elevated flex flex-col justify-between relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta-500 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Paling Diminati UMKM
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-ink-primary">Pro Bisnis</h3>
                <p className="text-xs text-slate-500 mt-1">Untuk kafe, resto kecil, dan toko retail berkembang.</p>
                <div className="my-6">
                  <span className="text-3xl font-serif font-bold text-terracotta-600 font-mono">
                    {billingCycle === "annual" ? "Rp 79.000" : "Rp 99.000"}
                  </span>
                  <span className="text-xs text-slate-500"> / bulan</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Hingga 5 Kasir & Shift Kerja</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Produk & Transaksi Tanpa Batas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Manajemen Modal & HPP Produk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Laporan Analitik Laba Kotor</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Peringatan Otomatis Stok Menipis</span>
                  </li>
                </ul>
              </div>
              <Link href="/pos" className="mt-8 block">
                <Button variant="primary" className="w-full text-xs shadow-md">
                  Mulai 7 Hari Uji Coba Gratis
                </Button>
              </Link>
            </div>

            {/* Enterprise Tier */}
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-editorial flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-xl text-ink-primary">Multi-Outlet</h3>
                <p className="text-xs text-slate-500 mt-1">Dukungan cabang ganda dan rantai toko.</p>
                <div className="my-6">
                  <span className="text-3xl font-serif font-bold text-ink-primary font-mono">
                    {billingCycle === "annual" ? "Rp 159.000" : "Rp 199.000"}
                  </span>
                  <span className="text-xs text-slate-500"> / bulan</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Manajemen Banyak Cabang Outlet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Hak Akses Peran Kustom</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Ekspor Laporan Keuangan Excel & PDF</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-terracotta-600 shrink-0" />
                    <span>Dukungan Teknis Prioritas</span>
                  </li>
                </ul>
              </div>
              <Link href="/pos" className="mt-8 block">
                <Button variant="outline" className="w-full text-xs">
                  Hubungi Tim Penjualan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-4 sm:px-8 border-t border-slate-200/80 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold">
              K
            </div>
            <span className="font-serif font-bold text-ink-primary text-sm">KasirKu</span>
            <span>: Aplikasi Kasir Digital UMKM</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-ink-primary">
              Masuk Akun
            </Link>
            <Link href="/pos" className="hover:text-ink-primary">
              Layar Kasir POS
            </Link>
            <Link href="/dashboard" className="hover:text-ink-primary">
              Dashboard Owner
            </Link>
          </div>

          <div>
            <span>© 2026 KasirKu. Dikembangkan untuk kemajuan UMKM Indonesia.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
