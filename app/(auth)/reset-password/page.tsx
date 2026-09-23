"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createSupabaseBrowserClient();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has an active session from the recovery link
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
    });
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      toast("Kata sandi berhasil diperbarui!", "success");
      router.push("/dashboard");
    }
  };

  if (hasSession === null) return null; // loading state

  if (!hasSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Link Tidak Valid</h2>
          <p className="text-slate-500 mb-6">Sesi reset kata sandi Anda tidak valid atau sudah kedaluwarsa.</p>
          <Button onClick={() => router.push("/login")} variant="primary">Kembali ke Halaman Masuk</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid-blueprint flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-elevated">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-serif font-bold text-ink-primary">Setel Kata Sandi Baru</h1>
            <p className="text-sm text-ink-secondary mt-1">
              Silakan masukkan kata sandi baru untuk akun Anda.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Kata Sandi Baru"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              required
            />
            <Input
              label="Konfirmasi Kata Sandi"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru"
              required
            />
            <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
              Simpan Kata Sandi
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
