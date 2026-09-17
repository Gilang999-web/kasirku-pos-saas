"use client";

import React, { useState } from "react";
import { Save, Store, Receipt, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { settings, updateSettings, currentUser } = useAppStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: settings.name,
    tagline: settings.tagline,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    receipt_header: settings.receipt_header,
    receipt_footer: settings.receipt_footer,
    tax_percentage: settings.tax_percentage,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    toast("Pengaturan toko berhasil diperbarui!", "success");
  };

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-primary">
            Pengaturan Toko & Struk Kasir
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Konfigurasikan profil usaha, kontak, dan catatan kaki pada struk belanja
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-terracotta-600" />
              <CardTitle>Identitas Usaha</CardTitle>
            </div>
            <CardDescription>Nama dan alamat yang muncul di header struk kasir</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Toko / Usaha"
                value={formData.name}
                disabled={!isAdmin}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Tagline / Slogan"
                value={formData.tagline}
                disabled={!isAdmin}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>

            <Input
              label="Alamat Lengkap Outlet"
              value={formData.address}
              disabled={!isAdmin}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nomor Telepon / WhatsApp"
                value={formData.phone}
                disabled={!isAdmin}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
              <Input
                label="Alamat Email Usaha"
                type="email"
                value={formData.email}
                disabled={!isAdmin}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
        </Card>

        {/* Receipt Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-terracotta-600" />
              <CardTitle>Format Struk Belanja Termal</CardTitle>
            </div>
            <CardDescription>Pesan ucapan dan syarat ketentuan pada kertas struk</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Pesan Sambutan (Header Struk)"
              value={formData.receipt_header}
              disabled={!isAdmin}
              onChange={(e) => setFormData({ ...formData, receipt_header: e.target.value })}
            />

            <Input
              label="Catatan Kaki (Footer Struk)"
              value={formData.receipt_footer}
              disabled={!isAdmin}
              onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
              hint="Contoh: Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan."
            />
          </div>
        </Card>

        {isAdmin && (
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="lg">
              <Save className="w-5 h-5" />
              <span>Simpan Pengaturan</span>
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
