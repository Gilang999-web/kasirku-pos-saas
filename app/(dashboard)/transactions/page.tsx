"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search, 
  Receipt, 
  Printer, 
  Eye, 
  Filter, 
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Transaction } from "@/lib/types";
import { formatRupiah, formatDateTimeIndonesia } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function TransactionsPage() {
  const { settings, currentUser } = useAppStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isSupabaseConfigured() || !supabase || !currentUser?.store_id) return;
      
      setIsLoading(true);
      try {
        const start = (currentPage - 1) * limit;
        const end = start + limit - 1;

        let query = supabase
          .from("transactions")
          .select("*, items:transaction_items(*)", { count: "exact" })
          .eq("store_id", currentUser.store_id)
          .order("created_at", { ascending: false });

        if (methodFilter !== "all") {
          query = query.eq("payment_method", methodFilter);
        }

        if (debouncedSearch) {
          query = query.or(`invoice_number.ilike.%${debouncedSearch}%,cashier_name.ilike.%${debouncedSearch}%`);
        }

        const { data, count, error } = await query.range(start, end);

        if (error) throw error;
        if (data) {
          setTransactions(data as any[]);
        }
        if (count !== null) {
          setTotalCount(count);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, debouncedSearch, methodFilter, currentUser?.store_id]);

  const totalPages = Math.ceil(totalCount / limit);

  const openDetail = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-editorial">
        <div>
          <h2 className="text-2xl font-serif font-bold text-ink-primary">
            Riwayat Transaksi Penjualan
          </h2>
          <p className="text-sm text-ink-secondary mt-1">
            Daftar seluruh transaksi yang diselesaikan oleh kasir, dengan struk digital yang dapat dicetak ulang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-terracotta-50 text-terracotta-700 px-3 py-2 rounded-xl border border-terracotta-200 font-mono font-bold">
            Total {totalCount} Transaksi
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3 justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari no. invoice atau nama kasir..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1); // Reset page on filter
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-ink-primary focus:outline-none focus:ring-2 focus:ring-terracotta-500 w-full sm:w-auto"
          >
            <option value="all">Semua Metode Pembayaran</option>
            <option value="cash">Tunai (Cash)</option>
            <option value="qris">QRIS</option>
            <option value="transfer">Transfer Bank</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-editorial overflow-hidden">
        <div className="overflow-x-auto relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <span className="text-terracotta-600 font-medium">Memuat data...</span>
            </div>
          )}
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-ink-secondary text-xs uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Waktu Transaksi</th>
                <th className="py-3.5 px-4">Kasir</th>
                <th className="py-3.5 px-4">Metode Bayar</th>
                <th className="py-3.5 px-4 text-center">Item</th>
                <th className="py-3.5 px-4 text-right">Total Transaksi</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada transaksi yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-ink-primary">
                      {tx.invoice_number}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {formatDateTimeIndonesia(tx.created_at)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-ink-primary">
                      {tx.cashier_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          tx.payment_method === "cash"
                            ? "success"
                            : tx.payment_method === "qris"
                            ? "terracotta"
                            : "neutral"
                        }
                        className="uppercase font-mono"
                      >
                        {tx.payment_method}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      {tx.items.length} jenis ({tx.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-ink-primary">
                      {formatRupiah(tx.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDetail(tx)}
                        className="h-8 text-xs gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Detail & Cetak</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              Menampilkan {Math.min((currentPage - 1) * limit + 1, totalCount)} hingga {Math.min(currentPage * limit, totalCount)} dari {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
                Sebelumnya
              </Button>
              <span className="text-sm font-medium px-4">Halaman {currentPage} dari {totalPages}</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
              >
                Selanjutnya
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DETAIL & REPRINT MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Nota Transaksi"
        description="Informasi rincian pembelian pelanggan"
        maxWidth="sm"
      >
        {selectedTx && (
          <div className="space-y-4">
            <div
              id="printable-receipt"
              className="p-5 bg-white border border-dashed border-slate-300 rounded-lg font-mono text-xs text-black leading-relaxed space-y-3 select-text"
            >
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-base uppercase">{settings.name}</div>
                <div className="text-[11px] text-slate-600">{settings.address}</div>
                <div className="text-[11px] text-slate-600">Telp: {settings.phone}</div>
              </div>

              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{selectedTx.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDateTimeIndonesia(selectedTx.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{selectedTx.cashier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="uppercase">{selectedTx.payment_method}</span>
                </div>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                {selectedTx.items.map((it) => (
                  <div key={it.id} className="space-y-0.5">
                    <div className="flex justify-between font-medium">
                      <span>{it.product_name}</span>
                      <span>{formatRupiah(it.subtotal)}</span>
                    </div>
                    <div className="text-[10px] text-slate-600 flex justify-between">
                      <span>{it.quantity} x {formatRupiah(it.unit_price)}</span>
                      {it.notes && <span className="italic">({it.notes})</span>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(selectedTx.subtotal)}</span>
                </div>
                {selectedTx.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(selectedTx.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL</span>
                  <span>{formatRupiah(selectedTx.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{formatRupiah(selectedTx.amount_paid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembali</span>
                  <span>{formatRupiah(selectedTx.change)}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 pt-1 space-y-0.5">
                <div>{settings.receipt_header}</div>
                <div>{settings.receipt_footer}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Ulang Struk</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
