"use client";

import React, { useState } from "react";
import { Plus, Trash2, Tag } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

export default function CategoriesPage() {
  const { categories, products, addCategory, deleteCategory } = useAppStore();
  const { toast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Nama kategori wajib diisi", "error");
      return;
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, "-");
    addCategory({
      name: formData.name,
      slug,
      description: formData.description,
    });

    toast(`Kategori ${formData.name} berhasil ditambahkan`, "success");
    setIsAddModalOpen(false);
    setFormData({ name: "", slug: "", description: "" });
  };

  const handleDelete = (cat: Category) => {
    const productsInCat = products.filter((p) => p.category_id === cat.id).length;
    if (productsInCat > 0) {
      toast(`Kategori tidak bisa dihapus karena masih digunakan oleh ${productsInCat} produk`, "error");
      return;
    }
    deleteCategory(cat.id);
    toast("Kategori berhasil dihapus", "success");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-primary">
            Kategori Produk
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Pengelompokan menu untuk mempermudah pemilihan item di layar kasir POS
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} variant="primary">
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </Button>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.category_id === c.id).length;

          return (
            <div
              key={c.id}
              className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between gap-4 hover:border-terracotta-200 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-terracotta-50 text-terracotta-600 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-ink-primary text-base">{c.name}</h4>
                  <span className="text-xs font-mono text-slate-400">slug: {c.slug}</span>
                  <p className="text-xs text-slate-500 mt-1">{c.description || "Tidak ada deskripsi"}</p>
                  <div className="mt-3">
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {count} Produk Terkait
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDelete(c)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Hapus Kategori"
                aria-label={`Hapus ${c.name}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Kategori Baru"
        description="Masukkan nama dan deskripsi kategori menu"
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Kategori"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Makanan Berat"
            required
            autoFocus
          />
          <Input
            label="Kode Slug"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="Contoh: makanan-berat"
            hint="Opsional, akan otomatis di-generate bila kosong"
          />
          <Input
            label="Deskripsi Singkat"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Contoh: Aneka nasi dan lauk"
          />
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Kategori
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
