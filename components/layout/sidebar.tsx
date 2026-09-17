"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  Tag, 
  Receipt, 
  BarChart3, 
  Settings, 
  LogOut,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { initialUsers } from "@/lib/mock-data";

export function Sidebar() {
  const pathname = usePathname();
  const { currentUser, setCurrentUser } = useAppStore();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "cashier"] },
    { label: "Layar Kasir (POS)", href: "/pos", icon: Store, roles: ["admin", "cashier"], highlight: true },
    { label: "Manajemen Produk", href: "/products", icon: Package, roles: ["admin"] },
    { label: "Kategori", href: "/categories", icon: Tag, roles: ["admin"] },
    { label: "Riwayat Transaksi", href: "/transactions", icon: Receipt, roles: ["admin"] },
    { label: "Laporan & Omzet", href: "/reports", icon: BarChart3, roles: ["admin"] },
    { label: "Pengaturan Toko", href: "/settings", icon: Settings, roles: ["admin"] },
  ];

  const allowedNav = navItems.filter((item) => item.roles.includes(currentUser.role));

  const toggleRole = () => {
    if (currentUser.role === "admin") {
      setCurrentUser(initialUsers[1]); // switch to Cashier
    } else {
      setCurrentUser(initialUsers[0]); // switch to Admin
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col shrink-0 h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            K
          </div>
          <div>
            <span className="font-serif font-bold text-lg tracking-tight text-ink-primary block leading-none">
              KasirKu
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-terracotta-600 mt-1 block">
              POS Cloud SaaS
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Menu Utama
        </div>
        {allowedNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-terracotta-50 text-terracotta-700 font-semibold border-l-4 border-terracotta-500 rounded-l-none"
                  : "text-ink-secondary hover:text-ink-primary hover:bg-slate-50",
                item.highlight && !isActive && "text-terracotta-600 font-semibold"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-terracotta-600" : "text-slate-400 group-hover:text-ink-primary"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="text-[10px] bg-terracotta-500 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  POS
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Role Switcher & User Profile */}
      <div className="p-3.5 border-t border-slate-100 bg-canvas-light/60 space-y-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-ink-primary shrink-0">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-ink-primary truncate">{currentUser.name}</div>
              <div className="text-[11px] text-slate-500 capitalize flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", currentUser.role === "admin" ? "bg-purple-600" : "bg-emerald-500")} />
                Role: {currentUser.role}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Demo Switcher for Evaluation */}
        <button
          onClick={toggleRole}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-terracotta-700 bg-terracotta-50/70 hover:bg-terracotta-100 border border-terracotta-200/80 rounded-lg transition-colors font-medium"
          title="Klik untuk simulasi peran Pengguna"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Ganti ke {currentUser.role === "admin" ? "Kasir (Siti)" : "Admin (Budi)"}</span>
        </button>

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-ink-primary rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Ke Landing Page</span>
        </Link>
      </div>
    </aside>
  );
}
