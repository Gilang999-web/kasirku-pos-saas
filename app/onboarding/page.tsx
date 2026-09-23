"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Store, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { initStore, settings, updateSettings, isCloudConnected, currentUser } = useAppStore();
  const supabase = createSupabaseBrowserClient();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [tagline, setTagline] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize store to get the user and settings
  useEffect(() => {
    initStore().then(() => setIsInitializing(false));
  }, [initStore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (isCloudConnected && currentUser) {
      updateSettings({
        address,
        phone,
        tagline,
      });
      toast("Pengaturan toko berhasil disimpan!", "success");
      router.push("/dashboard");
    } else {
      toast("Koneksi bermasalah. Coba lagi.", "error");
      setIsSaving(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-canvas-light flex flex-col justify-center items-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-terracotta-500 mb-4" />
        <p className="text-ink-secondary">Menyiapkan toko Anda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid-blueprint flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100 shadow-sm">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-ink-primary mb-2">
            Selamat Datang di KasirKu!
          </h1>
          <p className="text-sm text-ink-secondary">
            Mari lengkapi profil toko Anda agar siap digunakan.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-elevated">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-ink-primary border-b border-slate-100 pb-2">
                Informasi Toko: <span className="text-terracotta-600">{settings.name}</span>
              </h2>
              
              <Input
                label="Alamat Toko (Opsional)"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Jl. Sudirman No. 123, Jakarta"
              />
              
              <Input
                label="Nomor Telepon (Opsional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
              />
              
              <Input
                label="Slogan / Tagline (Opsional)"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Contoh: Solusi Kebutuhan Anda"
              />
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSaving}
              >
                <span>Selesai & Masuk Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="w-full mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors py-2"
              >
                Lewati langkah ini
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
