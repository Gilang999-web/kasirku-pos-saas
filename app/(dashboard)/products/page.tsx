"use client";

import React, { useState, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  CheckCircle2,
  Filter
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Product } from "@/lib/types";
import { formatRupiah, generateSKU } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function ProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, currentUser } = useAppStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: categories[0]?.id || "",
    buy_price: 0,
    sell_price: 0,
    stock_qty: 0,
    min_stock: 5,
    is_active: true,
  });

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === "all" || p.category_id === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const openAddModal = () => {
    setEditingProduct(null);
    const firstCat = categories[0];
    setFormData({
      name: "",
      sku: generateSKU(firstCat ? firstCat.slug : "PROD"),
      category_id: firstCat ? firstCat.id : "",
      buy_price: 10000,
      sell_price: 20000,
      stock_qty: 20,
      min_stock: 5,
      is_active: true,
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      sku: p.sku,
      category_id: p.category_id,
      buy_price: p.buy_price,
      sell_price: p.sell_price,
      stock_qty: p.stock_qty,
      min_stock: p.min_stock,
      is_active: p.is_active,
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("Nama produk wajib diisi", "error");
      return;
    }

    const cat = categories.find((c) => c.id === formData.category_id);
    const category_name = cat ? cat.name : "Umum";

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData,
        category_name,
      });
      toast(`Produk ${formData.name} berhasil diperbarui`, "success");
    } else {
      addProduct({
        ...formData,
        category_name,
      });
      toast(`Produk ${formData.name} berhasil ditambahkan`, "success");
    }
    setIsFormModalOpen(false);
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      toast("Produk berhasil dihapus", "success");
      setIsDeleteModalOpen(false);
      setDeletingProductId(null);
    }
  };

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-primary">
            Manajemen Produk & Inventaris
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Kelola data katalog, harga modal, harga jual, dan batas peringatan stok
          </p>
        </div>
        {isAdmin && (
          <Button onClick={openAddModal} variant="primary" size="md">
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-terracotta-500 w-full sm:w-auto"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-ink-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Nama Produk & SKU</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga Beli</th>
                <th className="py-3.5 px-4 text-right">Harga Jual</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {isAdmin && <th className="py-3.5 px-4 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada produk yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock_qty <= p.min_stock;
                  const margin = p.sell_price - p.buy_price;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink-primary">{p.name}</div>
                        <div className="text-xs font-mono text-slate-400">{p.sku}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                          {p.category_name || "Menu"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                        {formatRupiah(p.buy_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-primary">
                        <div>{formatRupiah(p.sell_price)}</div>
                        <div className="text-[10px] text-emerald-600 font-normal">
                          + {formatRupiah(margin)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 font-mono font-bold">
                          <span
                            className={
                              isLowStock ? "text-amber-600 font-bold" : "text-ink-primary"
                            }
                          >
                            {p.stock_qty}
                          </span>
                          {isLowStock && (
                            <span title="Stok menipis!">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {p.min_stock}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={p.is_active ? "success" : "neutral"}>
                          {p.is_active ? "Aktif" : "Nonaktif"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-slate-500 hover:text-terracotta-600 hover:bg-terracotta-50 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingProductId(p.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
        description="Lengkapi detail item untuk katalog penjualan"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Produk"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Kopi Susu Aren Spesial"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="SKU / Barcode"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Contoh: KOP-101"
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Kategori
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => {
                  const catId = e.target.value;
                  const cat = categories.find((c) => c.id === catId);
                  setFormData({
                    ...formData,
                    category_id: catId,
                    sku: editingProduct ? formData.sku : generateSKU(cat ? cat.slug : "PROD"),
                  });
                }}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-terracotta-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Harga Modal (Beli) Rp"
              type="number"
              value={formData.buy_price || ""}
              onChange={(e) => setFormData({ ...formData, buy_price: Number(e.target.value) })}
              required
            />
            <Input
              label="Harga Jual Rp"
              type="number"
              value={formData.sell_price || ""}
              onChange={(e) => setFormData({ ...formData, sell_price: Number(e.target.value) })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Jumlah Stok"
              type="number"
              value={formData.stock_qty || ""}
              onChange={(e) => setFormData({ ...formData, stock_qty: Number(e.target.value) })}
              required
            />
            <Input
              label="Batas Minimum Stok"
              type="number"
              value={formData.min_stock || ""}
              onChange={(e) => setFormData({ ...formData, min_stock: Number(e.target.value) })}
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 rounded text-terracotta-600 focus:ring-terracotta-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-ink-primary">
              Status Produk Aktif (Tampil di Kasir POS)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFormModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingProduct ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus Produk"
        description="Apakah Anda yakin ingin menghapus produk ini dari katalog?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-ink-secondary">
            Tindakan ini akan menghapus produk dari daftar penjualan. Riwayat transaksi sebelumnya tetap tercatat.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Hapus Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
