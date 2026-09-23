"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Store, 
  Wifi, 
  Clock, 
  Menu, 
  X,
  Keyboard
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Topbar({ onToggleMobileMenu, isMobileMenuOpen }: TopbarProps) {
  const pathname = usePathname();
  const { settings, currentUser, isCloudConnected } = useAppStore();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isPosPage = pathname === "/pos";

  return (
    <header className="h-16 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Toggle & Store Name */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Toggle menu navigasi"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full ring-4 shrink-0 transition-all",
              isCloudConnected
                ? "bg-emerald-500 ring-emerald-100 animate-pulse"
                : "bg-amber-500 ring-amber-100"
            )}
          />
          <div>
            <h1 className="text-sm font-bold text-ink-primary font-serif sm:text-base leading-tight">
              {settings.name}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-mono">
                <Wifi
                  className={cn(
                    "w-3 h-3",
                    isCloudConnected ? "text-emerald-600" : "text-amber-600"
                  )}
                />
                <span>{isCloudConnected ? "Supabase Cloud" : "Lokal Mode"}</span>
              </span>
              <span>•</span>
              <span>
                Kasir: <strong className="font-semibold text-ink-primary">{currentUser.name}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clock, POS status & Shortcut indicator */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time || "00:00:00"} WIB</span>
        </div>

        {/* Shortcuts quick badge for POS */}
        {isPosPage ? (
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600 bg-terracotta-50/70 border border-terracotta-200/80 px-3 py-1.5 rounded-lg">
            <Keyboard className="w-3.5 h-3.5 text-terracotta-600" />
            <span>F2: Cari</span>
            <span className="text-slate-300">|</span>
            <span>F4: Diskon</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-terracotta-700">F8: Bayar</span>
          </div>
        ) : (
          <Link href="/pos">
            <Button size="sm" variant="primary" className="shadow-sm">
              <Store className="w-4 h-4" />
              <span>Buka POS Kasir</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
