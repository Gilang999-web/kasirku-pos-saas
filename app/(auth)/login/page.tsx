"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Store, ArrowRight, ShieldCheck, AlertCircle, UserPlus } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsLoading(false);

    if (error) {
      const msg =
        error.message === "Invalid login credentials"
          ? "Email atau kata sandi salah. Silakan coba lagi."
          : error.message;
      setErrorMessage(msg);
      return;
    }

    if (data.session) {
      toast("Berhasil masuk! Mengalihkan ke dashboard…", "success");
      router.push("/dashboard");
      router.refresh();
    }
  };

  const handleDemoLogin = async (role: "admin" | "cashier") => {
    setIsLoading(true);
    setErrorMessage(null);

    const demoCredentials = {
      admin: { email: "admin@kasirku.com", password: "admin123" },
      cashier: { email: "kasir@kasirku.com", password: "kasir123" },
    };

    const creds = demoCredentials[role];
    const { data, error } = await supabase.auth.signInWithPassword(creds);

    setIsLoading(false);

    if (error) {
      setErrorMessage(
        `Akun demo ${role} belum terdaftar di Supabase Auth. ` +
        `Silakan buat akun terlebih dahulu melalui halaman Register, atau tambahkan user "${creds.email}" dari Supabase Dashboard.`
      );
      return;
    }

    if (data.session) {
      toast(`Masuk sebagai demo ${role === "admin" ? "Admin" : "Kasir"}`, "success");
      router.push(role === "admin" ? "/dashboard" : "/pos");
      router.refresh();
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
          {/* Quick Demo Selector */}
          <div className="mb-6 p-3.5 bg-terracotta-50/70 border border-terracotta-200/80 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-bold text-terracotta-800 mb-2">
              <ShieldCheck className="w-4 h-4 text-terracotta-600" />
              <span>Akses Cepat Demo:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin("admin")}
                className="py-2 px-3 bg-white text-ink-primary hover:bg-terracotta-500 hover:text-white border border-slate-200 hover:border-terracotta-500 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 text-center disabled:opacity-50"
              >
                1-Klik Admin
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin("cashier")}
                className="py-2 px-3 bg-white text-ink-primary hover:bg-terracotta-500 hover:text-white border border-slate-200 hover:border-terracotta-500 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95 text-center disabled:opacity-50"
              >
                1-Klik Kasir
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Akun"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@toko.com"
              required
              autoComplete="email"
            />
            <Input
              label="Kata Sandi"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
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

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            <Link
              href="/register"
              className="text-sm text-terracotta-600 font-semibold hover:text-terracotta-700 flex items-center gap-1.5 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Belum punya akun? Daftar Sekarang</span>
            </Link>
            <Link href="/" className="text-xs text-slate-500 hover:text-terracotta-600">
              ← Kembali ke Beranda Utama
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
