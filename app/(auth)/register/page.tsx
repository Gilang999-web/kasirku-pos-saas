"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  LogIn,
  Mail,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();

  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage("Nama lengkap wajib diisi.");
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: fullName.trim(),
          full_name: fullName.trim(),
          store_name: storeName.trim(),
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setIsLoading(false);

    if (error) {
      const msg =
        error.message === "User already registered"
          ? "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk ke akun Anda."
          : error.message;
      setErrorMessage(msg);
      return;
    }

    if (data.user && !data.session) {
      // Email confirmation required
      setIsSuccess(true);
      return;
    }

    if (data.session) {
      // Auto-confirmed (email confirmation disabled in Supabase)
      toast("Akun berhasil dibuat! Mengalihkan ke halaman setup…", "success");
      router.push("/onboarding");
      router.refresh();
    }
  };

  // Email confirmation success view
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-grid-blueprint flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-elevated text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-xl font-serif font-bold text-ink-primary mb-2">
              Cek Email Anda
            </h2>
            <p className="text-sm text-ink-secondary mb-6 leading-relaxed">
              Kami telah mengirimkan link konfirmasi ke{" "}
              <strong className="text-ink-primary">{email}</strong>.
              <br />
              Klik link tersebut untuk mengaktifkan akun Anda.
            </p>

            <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-xl mb-6">
              <p className="text-xs text-amber-800 leading-relaxed">
                Tidak menerima email? Periksa folder <strong>Spam</strong> atau{" "}
                <strong>Promosi</strong>. Link berlaku selama 24 jam.
              </p>
            </div>

            <Link href="/login">
              <Button variant="primary" size="lg" className="w-full">
                <LogIn className="w-4 h-4" />
                <span>Kembali ke Halaman Masuk</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Buat Akun Baru
          </h1>
          <p className="text-xs text-ink-secondary mt-1">
            Daftarkan bisnis UMKM Anda ke sistem kasir cloud terpadu
          </p>
        </div>

        {/* Register Box */}
        <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-elevated">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nama Lengkap Pemilik"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
              autoComplete="name"
            />
            <Input
              label="Nama Toko"
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: Toko Budi Maju"
              required
            />
            <Input
              label="Alamat Email"
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
              placeholder="Minimal 6 karakter"
              required
              autoComplete="new-password"
            />
            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi"
              required
              autoComplete="new-password"
            />

            <div className="pt-1 flex items-start gap-2.5 text-xs text-slate-500">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                Dengan mendaftar, Anda akan otomatis mendapatkan akses sebagai{" "}
                <strong className="text-ink-primary">Admin</strong> untuk toko Anda.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <span>Daftar Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-terracotta-600 font-semibold hover:text-terracotta-700 flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sudah punya akun? Masuk di sini</span>
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
