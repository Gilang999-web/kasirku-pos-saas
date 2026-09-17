"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, UserCheck, ArrowRight, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { initialUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentUser } = useAppStore();
  const { toast } = useToast();

  const [email, setEmail] = useState("admin@kasirku.com");
  const [password, setPassword] = useState("admin123");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("kasir")) {
        setCurrentUser(initialUsers[1]);
        toast("Berhasil masuk sebagai Kasir (Siti Rahma)", "success");
        router.push("/pos");
      } else {
        setCurrentUser(initialUsers[0]);
        toast("Berhasil masuk sebagai Admin (Budi Santoso)", "success");
        router.push("/dashboard");
      }
    }, 400);
  };

  const loginAsDemo = (role: "admin" | "cashier") => {
    if (role === "admin") {
      setCurrentUser(initialUsers[0]);
      toast("Mode demo: Masuk sebagai Admin (Budi)", "success");
      router.push("/dashboard");
    } else {
      setCurrentUser(initialUsers[1]);
      toast("Mode demo: Masuk sebagai Kasir (Siti)", "success");
      router.push("/pos");
    }
  };

  return (
    <div className="min-h-screen bg-grid-blueprint flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center font-serif font-bold text-2xl shadow-md">
              K
            </div>
            <span className="font-serif font-bold text-3xl tracking-tight text-ink-primary">
              KasirKu
            </span>
          </Link>
          <h1 className="text-xl font-serif font-bold text-ink-primary mt-1">
            Masuk ke Akun POS KasirKu
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Sistem kasir digital terpadu untuk efisiensi bisnis UMKM Anda
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-elevated">
          {/* Quick Demo Selector for Reviewers */}
          <div className="mb-6 p-3.5 bg-terracotta-50/70 border border-terracotta-200/80 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-terracotta-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-terracotta-600" />
              <span>Pilih Akses Cepat Demo:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo("admin")}
                className="py-2 px-3 bg-white text-ink-primary hover:bg-terracotta-500 hover:text-white border border-slate-200 hover:border-terracotta-500 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 text-center"
              >
                1-Klik Admin
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo("cashier")}
                className="py-2 px-3 bg-white text-ink-primary hover:bg-terracotta-500 hover:text-white border border-slate-200 hover:border-terracotta-500 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 text-center"
              >
                1-Klik Kasir
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Akun"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@toko.com"
              required
            />
            <Input
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-terracotta-600">
              ← Kembali ke Beranda Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
