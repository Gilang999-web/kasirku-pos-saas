"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("KasirKu Global Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-canvas-light flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center border border-red-100">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-serif font-bold text-ink-primary">
            Terjadi Kesalahan
          </h1>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Maaf, terjadi kesalahan yang tidak terduga pada sistem.
            Silakan coba muat ulang halaman ini.
          </p>
        </div>

        {error.digest && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5">
            <p className="text-xs text-ink-muted font-mono">
              Kode Error: {error.digest}
            </p>
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-terracotta-500 text-white text-sm font-medium rounded-lg hover:bg-terracotta-600 active:scale-[0.98] transition-all shadow-sm min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-ink-primary text-sm font-medium rounded-lg hover:bg-slate-50 hover:border-slate-400 active:scale-[0.98] transition-all shadow-sm min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            Ke Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
