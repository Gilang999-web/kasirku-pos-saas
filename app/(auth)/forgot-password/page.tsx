"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-grid-blueprint flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-elevated">
          {isSuccess ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-ink-primary mb-2">Cek Email Anda</h2>
              <p className="text-sm text-ink-secondary mb-6">
                Kami telah mengirimkan instruksi untuk mengatur ulang kata sandi ke <strong>{email}</strong>.
              </p>
              <Link href="/login">
                <Button variant="primary" className="w-full">Kembali ke Halaman Masuk</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-serif font-bold text-ink-primary">Lupa Kata Sandi?</h1>
                <p className="text-sm text-ink-secondary mt-1">Masukkan email Anda dan kami akan mengirimkan link reset.</p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Alamat Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@toko.com"
                  required
                />
                <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
                  Kirim Link Reset
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-slate-500 hover:text-terracotta-600 flex items-center justify-center gap-1.5 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
