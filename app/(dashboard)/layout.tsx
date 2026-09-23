"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
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
  X 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { currentUser, initStore } = useAppStore();

  React.useEffect(() => {
    initStore();
  }, [initStore]);

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

  return (
    <div className="min-h-screen bg-canvas-light flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm">
          <div className="w-72 bg-white h-full flex flex-col p-4 shadow-elevated animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold">
                  K
                </div>
                <span className="font-serif font-bold text-lg text-ink-primary">KasirKu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-slate-400 hover:text-ink-primary rounded"
                aria-label="Tutup menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {allowedNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-terracotta-50 text-terracotta-700 font-semibold"
                        : "text-ink-secondary hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          isMobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-grid-blueprint-subtle">
          {children}
        </main>
      </div>
    </div>
  );
}
