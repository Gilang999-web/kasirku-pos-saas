import React from "react";
import { Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-canvas-light flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-terracotta-50 rounded-2xl flex items-center justify-center border border-terracotta-100">
          <Search className="w-8 h-8 text-terracotta-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl font-serif font-bold text-terracotta-500">
            404
          </h1>
          <h2 className="text-xl font-serif font-bold text-ink-primary">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
            Periksa kembali URL yang dimasukkan.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 text-white text-sm font-medium rounded-lg hover:bg-terracotta-600 active:scale-[0.98] transition-all shadow-sm min-h-[44px]"
          >
            Kembali ke Dashboard
          </Link>
          <Link
            href="/pos"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-ink-primary text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-sm min-h-[44px]"
          >
            Buka Kasir
          </Link>
        </div>
      </div>
    </div>
  );
}
