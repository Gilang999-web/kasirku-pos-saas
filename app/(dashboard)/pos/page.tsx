"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt as ReceiptIcon, 
  Printer, 
  Check, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Tag, 
  RotateCcw,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Product, PaymentMethod, Transaction } from "@/lib/types";
import { formatRupiah, formatNumber, formatDateTimeIndonesia } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

export default function PosPage() {
  const { 
    products, 
    categories, 
    cart, 
    cartDiscount, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    setCartItemNotes,
    setCartDiscount, 
    clearCart, 
    completeTransaction,
    settings,
    currentUser,
    lastTransaction
  } = useAppStore();

  const { toast } = useToast();

  // Search and category filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedCartItemForNote, setSelectedCartItemForNote] = useState<string | null>(null);
  const [itemNoteText, setItemNoteText] = useState("");
  const [discountInput, setDiscountInput] = useState("");

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);

  // Cart Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sell_price * item.quantity, 0);
  }, [cart]);

  const total = Math.max(0, subtotal - cartDiscount);
  const change = Math.max(0, cashGiven - total);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.is_active) return false;
      const matchesCat = selectedCategory === "all" || p.category_id === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Global Keyboard Shortcuts (F2, F4, F8, F9, Esc) - DESIGN.md Section 8
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "F4") {
        e.preventDefault();
        if (cart.length > 0) setIsDiscountModalOpen(true);
      } else if (e.key === "F8") {
        e.preventDefault();
        if (cart.length > 0) {
          setCashGiven(total);
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === "F9") {
        e.preventDefault();
        if (lastTransaction) {
          setCurrentReceipt(lastTransaction);
          setIsReceiptModalOpen(true);
        } else {
          toast("Belum ada riwayat transaksi untuk dicetak", "info");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cart.length, total, lastTransaction, toast]);

  // Handle Add to cart with tactile toast
  const handleProductClick = (product: Product) => {
    if (product.stock_qty <= 0) {
      toast(`Stok ${product.name} habis`, "error");
      return;
    }
    addToCart(product);
  };

  // Quick Cash suggestions
  const setQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  // Numpad key tap
  const handleNumpadTap = (val: string) => {
    if (val === "C") {
      setCashGiven(0);
    } else if (val === "000") {
      setCashGiven((prev) => prev * 1000);
    } else {
      setCashGiven((prev) => Number(`${prev}${val}`));
    }
  };

  // Submit Transaction
  const handleProcessPayment = () => {
    if (paymentMethod === "cash" && cashGiven < total) {
      toast("Uang yang diterima kurang dari total belanja", "error");
      return;
    }

    const tx = completeTransaction(paymentMethod, paymentMethod === "cash" ? cashGiven : total);
    if (tx) {
      setCurrentReceipt(tx);
      setIsPaymentModalOpen(false);
      setIsReceiptModalOpen(true);
      toast("Transaksi berhasil diselesaikan!", "success");
    }
  };

  const openNoteModal = (productId: string, currentNotes?: string) => {
    setSelectedCartItemForNote(productId);
    setItemNoteText(currentNotes || "");
    setIsNoteModalOpen(true);
  };

  const saveItemNote = () => {
    if (selectedCartItemForNote) {
      setCartItemNotes(selectedCartItemForNote, itemNoteText);
      setIsNoteModalOpen(false);
      toast("Catatan item disimpan", "success");
    }
  };

  const applyDiscount = () => {
    const val = Number(discountInput);
    if (isNaN(val) || val < 0) {
      toast("Masukkan nominal diskon yang valid", "error");
      return;
    }
    setCartDiscount(val);
    setIsDiscountModalOpen(false);
    toast(`Diskon sebesar ${formatRupiah(val)} diterapkan`, "success");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 -m-4 sm:-m-6 lg:-m-8 h-[calc(100vh-4rem)] overflow-hidden">
      {/* LEFT SECTION (65%): Product Catalog & Categories */}
      <div className="flex-1 flex flex-col min-w-0 bg-canvas-light p-4 sm:p-5 overflow-hidden">
        {/* Top Controls: Search Bar (F2) */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Cari produk atau scan barcode... (Tekan F2)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-12 py-3 bg-white border border-slate-300 rounded-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-terracotta-500 shadow-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border">
              F2
            </span>
          </div>

          {lastTransaction && (
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setCurrentReceipt(lastTransaction);
                setIsReceiptModalOpen(true);
              }}
              title="Cetak struk transaksi terakhir (F9)"
              className="shrink-0 hidden sm:flex"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Struk Terakhir (F9)</span>
            </Button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 scrollbar-none shrink-0">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
              selectedCategory === "all"
                ? "bg-ink-primary text-white shadow-sm"
                : "bg-white text-ink-secondary hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Semua Menu ({products.length})
          </button>
          {categories.map((cat) => {
            const count = products.filter((p) => p.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none ${
                  isSelected
                    ? "bg-terracotta-500 text-white shadow-sm"
                    : "bg-white text-ink-secondary hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>

        {/* Product Grid (Tactile Cards >=48px touch ergonomics) */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Search className="w-8 h-8 opacity-40" />
              <p className="text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock_qty <= 0;
                const inCartItem = cart.find((item) => item.product.id === p.id);

                return (
                  <button
                    key={p.id}
                    disabled={isOutOfStock}
                    onClick={() => handleProductClick(p)}
                    className={`relative text-left p-3.5 bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between select-none min-h-[115px] group ${
                      isOutOfStock
                        ? "opacity-50 cursor-not-allowed border-slate-200"
                        : inCartItem
                        ? "border-terracotta-500 ring-2 ring-terracotta-100 bg-terracotta-50/20 shadow-sm"
                        : "border-slate-200/90 hover:border-terracotta-400 hover:shadow-card-hover active:scale-[0.98]"
                    }`}
                  >
                    {/* Badge Quantity in Cart */}
                    {inCartItem && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-terracotta-500 text-white font-mono font-bold text-xs flex items-center justify-center shadow-sm">
                        {inCartItem.quantity}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-mono font-medium text-slate-400 uppercase">
                          {p.sku}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            p.stock_qty <= p.min_stock
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Stok: {p.stock_qty}
                        </span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-semibold text-ink-primary line-clamp-2 leading-snug group-hover:text-terracotta-700">
                        {p.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-terracotta-600">
                        {formatRupiah(p.sell_price)}
                      </span>
                      <div className="w-6 h-6 rounded-md bg-slate-100 group-hover:bg-terracotta-500 group-hover:text-white flex items-center justify-center text-slate-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION (35%): Digital Ticket / Cart */}
      <div className="w-full lg:w-[380px] xl:w-[420px] bg-white border-l border-slate-200/90 flex flex-col h-full shadow-lg shrink-0">
        {/* Ticket Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptIcon className="w-4 h-4 text-terracotta-600" />
              <h3 className="font-serif font-bold text-ink-primary text-base">
                Tiket Belanja
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Kasir: <span className="font-semibold text-ink-primary">{currentUser.name}</span>
            </p>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium px-2 py-1 rounded hover:bg-rose-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <ReceiptIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium text-slate-600">Keranjang masih kosong</p>
              <p className="text-xs text-slate-400 text-center max-w-[200px]">
                Pilih menu dari katalog di sebelah kiri untuk memulai pesanan.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-3 bg-canvas-light rounded-xl border border-slate-200/70 flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-ink-primary leading-tight">
                      {item.product.name}
                    </div>
                    <div className="text-xs font-mono text-slate-500 mt-0.5">
                      {formatRupiah(item.product.sell_price)} x {item.quantity}
                    </div>
                  </div>
                  <div className="text-right font-mono font-bold text-sm text-ink-primary">
                    {formatRupiah(item.product.sell_price * item.quantity)}
                  </div>
                </div>

                {/* Notes or Add Note */}
                {item.notes ? (
                  <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <span className="italic">Note: {item.notes}</span>
                    <button
                      onClick={() => openNoteModal(item.product.id, item.notes)}
                      className="text-amber-800 underline ml-2"
                    >
                      Ubah
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openNoteModal(item.product.id)}
                    className="self-start text-[11px] text-slate-400 hover:text-terracotta-600 flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Tambah catatan</span>
                  </button>
                )}

                {/* Stepper (Min 44px ergonomics) */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded transition-colors"
                    aria-label="Hapus item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-0.5">
                    <button
                      onClick={() => updateCartQuantity(item.product.id, -1)}
                      className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-sm text-ink-primary">
                      {item.quantity}
                    </span>
                    <button
                      disabled={item.quantity >= item.product.stock_qty}
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="w-8 h-8 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 active:scale-95 transition-all"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Calculations */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50 space-y-2 text-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span>Subtotal</span>
            <span className="font-mono font-medium">{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <button
              onClick={() => {
                setDiscountInput(cartDiscount.toString());
                setIsDiscountModalOpen(true);
              }}
              className="text-xs text-terracotta-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Diskon (F4)</span>
            </button>
            <span className="font-mono font-medium text-red-600">
              {cartDiscount > 0 ? `-${formatRupiah(cartDiscount)}` : "Rp 0"}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <span className="text-base font-bold text-ink-primary">TOTAL</span>
            <span className="text-xl font-bold font-mono text-terracotta-600">
              {formatRupiah(total)}
            </span>
          </div>

          {/* Primary CTA: BAYAR (F8) */}
          <Button
            size="pos"
            variant="primary"
            disabled={cart.length === 0}
            onClick={() => {
              setCashGiven(total);
              setIsPaymentModalOpen(true);
            }}
            className="w-full mt-2 shadow-md"
          >
            <span>BAYAR SEKARANG (F8)</span>
            <span className="font-mono ml-1">• {formatRupiah(total)}</span>
          </Button>
        </div>
      </div>

      {/* PAYMENT MODAL (F8) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pembayaran Transaksi"
        description="Pilih metode pembayaran dan masukkan nominal uang pelanggan"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Total Tag Readout */}
          <div className="bg-terracotta-50 p-4 rounded-xl border border-terracotta-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-terracotta-800">
                Total Tagihan
              </span>
              <div className="text-2xl font-bold font-mono text-terracotta-700">
                {formatRupiah(total)}
              </div>
            </div>
            <span className="text-xs font-mono bg-white text-terracotta-700 px-2.5 py-1 rounded-lg border border-terracotta-200 font-bold">
              {cart.length} Item
            </span>
          </div>

          {/* Payment Method Switcher */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  paymentMethod === "cash"
                    ? "bg-terracotta-500 text-white border-terracotta-500 shadow-sm"
                    : "bg-white text-ink-secondary border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Tunai / Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("qris")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  paymentMethod === "qris"
                    ? "bg-terracotta-500 text-white border-terracotta-500 shadow-sm"
                    : "bg-white text-ink-secondary border-slate-200 hover:bg-slate-50"
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">QRIS Statis</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                  paymentMethod === "transfer"
                    ? "bg-terracotta-500 text-white border-terracotta-500 shadow-sm"
                    : "bg-white text-ink-secondary border-slate-200 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs font-semibold">Transfer Bank</span>
              </button>
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentMethod === "cash" ? (
            <div className="space-y-4">
              {/* Quick Cash Buttons */}
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary block mb-2">
                  Nominal Cepat
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickCash(total)}
                    className="p-2 text-xs font-bold font-mono rounded-lg border border-slate-200 hover:border-terracotta-500 hover:bg-terracotta-50 transition-colors"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(20000)}
                    className="p-2 text-xs font-bold font-mono rounded-lg border border-slate-200 hover:border-terracotta-500 hover:bg-terracotta-50 transition-colors"
                  >
                    20k
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(50000)}
                    className="p-2 text-xs font-bold font-mono rounded-lg border border-slate-200 hover:border-terracotta-500 hover:bg-terracotta-50 transition-colors"
                  >
                    50k
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(100000)}
                    className="p-2 text-xs font-bold font-mono rounded-lg border border-slate-200 hover:border-terracotta-500 hover:bg-terracotta-50 transition-colors"
                  >
                    100k
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickCash(200000)}
                    className="p-2 text-xs font-bold font-mono rounded-lg border border-slate-200 hover:border-terracotta-500 hover:bg-terracotta-50 transition-colors"
                  >
                    200k
                  </button>
                </div>
              </div>

              {/* Cash Given Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                    Uang Diterima (Rp)
                  </label>
                  <input
                    type="number"
                    value={cashGiven || ""}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg font-mono text-lg font-bold text-ink-primary focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                    Kembalian
                  </label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg font-mono text-lg font-bold text-emerald-700">
                    {formatRupiah(change)}
                  </div>
                </div>
              </div>

              {/* Cashier Touch Numpad (Min 56px touch target - DESIGN.md Section 5.1) */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumpadTap(n.toString())}
                    className="min-h-[50px] bg-white border border-slate-200 hover:bg-terracotta-50 active:bg-terracotta-100 text-lg font-mono font-bold text-ink-primary rounded-xl transition-all shadow-sm active:scale-95"
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleNumpadTap("C")}
                  className="min-h-[50px] bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-bold rounded-xl transition-all active:scale-95"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadTap("0")}
                  className="min-h-[50px] bg-white border border-slate-200 hover:bg-terracotta-50 text-lg font-mono font-bold text-ink-primary rounded-xl transition-all active:scale-95"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => handleNumpadTap("000")}
                  className="min-h-[50px] bg-white border border-slate-200 hover:bg-terracotta-50 font-mono font-bold text-ink-primary rounded-xl transition-all active:scale-95 text-sm"
                >
                  000
                </button>
              </div>
            </div>
          ) : paymentMethod === "qris" ? (
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center gap-3">
              <div className="w-36 h-36 bg-white p-2 rounded-xl border border-slate-300 flex items-center justify-center shadow-inner">
                <QrCode className="w-28 h-28 text-slate-800" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-ink-primary">Scan QRIS KasirKu</p>
                <p className="text-xs text-slate-500">Mendukung GoPay, OVO, Dana, BCA, dan ShopeePay</p>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="text-xs font-semibold text-slate-500">Rekening Tujuan:</div>
              <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="font-mono font-bold text-sm text-ink-primary">BCA: 8840-1234-5678</div>
                <div className="text-xs text-slate-500">a.n. Kopi & Roti Nusantara</div>
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleProcessPayment}
              disabled={paymentMethod === "cash" && cashGiven < total}
              className="min-w-[160px]"
            >
              <Check className="w-5 h-5" />
              <span>Selesaikan Bayar</span>
            </Button>
          </div>
        </div>
      </Modal>

      {/* RECEIPT PREVIEW & THERMAL PRINT MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title="Struk Pembayaran Digital"
        description="Pratinjau struk kasir termal siap cetak"
        maxWidth="sm"
      >
        {currentReceipt && (
          <div className="space-y-4">
            {/* Printable Receipt Paper (Monochrome 80mm format - DESIGN.md Section 8) */}
            <div
              id="printable-receipt"
              className="p-5 bg-white border border-dashed border-slate-300 rounded-lg font-mono text-xs text-black leading-relaxed space-y-3 shadow-sm select-text"
            >
              {/* Store Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-base uppercase tracking-wider">{settings.name}</div>
                <div className="text-[11px] text-slate-600">{settings.address}</div>
                <div className="text-[11px] text-slate-600">Telp: {settings.phone}</div>
              </div>

              {/* Invoice Meta */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>No. Nota:</span>
                  <span className="font-bold">{currentReceipt.invoice_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDateTimeIndonesia(currentReceipt.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{currentReceipt.cashier_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode:</span>
                  <span className="uppercase">{currentReceipt.payment_method}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                {currentReceipt.items.map((it) => (
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

              {/* Financial Totals */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(currentReceipt.subtotal)}</span>
                </div>
                {currentReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Diskon</span>
                    <span>-{formatRupiah(currentReceipt.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm pt-1">
                  <span>TOTAL</span>
                  <span>{formatRupiah(currentReceipt.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{formatRupiah(currentReceipt.amount_paid)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Kembali</span>
                  <span>{formatRupiah(currentReceipt.change)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-500 pt-1 space-y-0.5">
                <div>{settings.receipt_header}</div>
                <div>{settings.receipt_footer}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk (F9)</span>
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                <span>Selesai</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ITEM NOTE MODAL */}
      <Modal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        title="Catatan Tambahan Menu"
        description="Contoh: Less Sugar, Extra Shot, Sambal Dipisah"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Catatan Pesanan"
            value={itemNoteText}
            onChange={(e) => setItemNoteText(e.target.value)}
            placeholder="Ketik catatan..."
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsNoteModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={saveItemNote}>
              Simpan Catatan
            </Button>
          </div>
        </div>
      </Modal>

      {/* DISCOUNT MODAL (F4) */}
      <Modal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        title="Beri Diskon Transaksi"
        description="Masukkan nominal potongan harga (Rp) untuk seluruh pesanan"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Nominal Diskon (Rp)"
            type="number"
            value={discountInput}
            onChange={(e) => setDiscountInput(e.target.value)}
            placeholder="Contoh: 5000"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsDiscountModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" size="sm" onClick={applyDiscount}>
              Terapkan Diskon
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
