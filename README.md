# KasirKu: Cloud Point of Sale (POS) SaaS

> **Aplikasi Kasir Berbasis Web Modern untuk UMKM Indonesia**  
> Dibangun dengan Next.js 15 App Router, TypeScript, Tailwind CSS, Zustand, dan Recharts dengan pendekatan *Modern Editorial SaaS* dan standar kualitas tinggi.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

---

## 📌 Ringkasan Produk

**KasirKu** adalah platform Point of Sale (POS) multi-peran berbasis cloud yang dirancang untuk menggantikan pembukuan manual warung, kafe, dan toko retail UMKM Indonesia dengan alur operasional kasir berkecepatan tinggi, pencatatan otomatis, serta visualisasi analitik keuangan terpadu.

### 🌟 Fitur Utama

1. **Layar Kasir POS Berkecepatan Tinggi (`/pos`):**
   * Desain *split-screen* responsif (katalog produk 65% + tiket kasir 35%).
   * **Keyboard-First Accelerators:** Operasikan kasir tanpa mouse dengan shortcut keyboard:
     * `F2`: Fokus cepat ke pencarian atau pemindaian barcode.
     * `F4`: Buka dialog pemberian diskon transaksi.
     * `F8`: Buka modal pembayaran kasir.
     * `F9`: Cetak ulang struk transaksi terakhir.
     * `Esc`: Menutup modal aktif.
   * **Touch Ergonomics Numpad:** Tombol berukuran 56px ramah layar sentuh untuk kasir counter.
   * **Modal Pembayaran Lengkap:** Pilihan Tunai (dengan tombol nominal cepat 20k, 50k, 100k, 200k, Uang Pas & kalkulator kembalian otomatis), QRIS, dan Transfer Bank.
   * **Struk Termal Digital 80mm:** Pratinjau nota monokrom siap cetak ke printer kasir termal (`window.print`).

2. **Dashboard Pemilik Usaha (`/dashboard`):**
   * 4 Metrik Kartu KPI Utama: Penjualan Hari Ini, Jumlah Transaksi, Nilai Rata-rata Keranjang (AOV), dan Omzet Mingguan.
   * Grafik tren penjualan 7 hari terakhir (*Recharts Bar Chart*).
   * Daftar 5 produk terlaris dan widget peringatan otomatis stok menipis (*low-stock alert*).

3. **Manajemen Produk & Kategori (`/products` & `/categories`):**
   * CRUD inventaris produk lengkap dengan auto-generate kode SKU.
   * Manajemen harga modal (HPP), harga jual, margin keuntungan, serta batas minimum stok aman.
   * Filter kategori instan dan pencarian produk cepat.

4. **Riwayat Transaksi Terperinci (`/transactions`):**
   * Pencatatan riwayat nota terurut waktu dengan filter metode pembayaran.
   * Rincian belanja per item dan tombol cetak ulang struk.

5. **Laporan & Analitik Keuangan (`/reports`):**
   * Analisis komparasi omzet kotor vs total modal HPP terjual.
   * Estimasi laba kotor, rasio margin profit %, dan tabel performa volume tiap menu.

6. **Pengaturan Toko & Struk (`/settings`):**
   * Kustomisasi nama gerai, alamat, nomor telepon/WhatsApp, serta teks header dan footer struk.

7. **Role-Based Access Control (RBAC):**
   * Akses peran terpisah antara **Admin** (akses seluruh modul) dan **Kasir** (fokus layar POS & transaksi).
   * Tombol *1-Click Demo Switcher* pada halaman login dan sidebar untuk kemudahan pengujian.

---

## 🎨 Desain & Identitas Visual

Aplikasi ini dibangun berdasarkan panduan spesifikasi `DESIGN.md`:
* **Aset Warna:** *Warm Terracotta* (`#E05338`), *Canvas Off-White* (`#FBFBFA`), dan *Ink Slate* (`#0F172A`).
* **Signature Motif:** Blueprint Graph Grid Canvas (`.bg-grid-blueprint`).
* **Tipografi:** Google Font `Fraunces` (Editorial Serif) dipadukan dengan `Plus Jakarta Sans` dan `JetBrains Mono`.
* **Aksesibilitas:** Memenuhi standar rasio kontras WCAG AA (minimal 4.5:1) dan keyboard navigable.

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v3 |
| **State Management** | Zustand (Store Terpusat) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Typography** | Next Font Google (`Fraunces`, `Plus Jakarta Sans`, `JetBrains Mono`) |

---

## 🚀 Menjalankan Aplikasi Secara Lokal

### Prasyarat
* Node.js v18+ atau v20+
* Git

### Langkah Instalasi
1. Clone repository ini:
   ```bash
   git clone https://github.com/Gilang999-web/kasirku-pos-saas.git
   cd kasirku-pos-saas
   ```

2. Install dependensi:
   ```bash
   npm install
   ```

3. Jalankan server development:
   ```bash
   npm run dev
   ```

4. Buka browser pada alamat:
   ```
   http://localhost:3000
   ```

---

## 👤 Akun Pengujian Demo

Pada halaman login (`/login`), Anda dapat langsung menggunakan tombol **"1-Klik Admin"** atau **"1-Klik Kasir"**, atau memasukkan kredensial:

| Peran | Email | Password | Hak Akses |
|---|---|---|---|
| **Admin** | `admin@kasirku.com` | `admin123` | Akses penuh ke seluruh fitur dan pengaturan toko |
| **Kasir** | `kasir@kasirku.com` | `kasir123` | Akses fokus ke Layar Kasir POS & profil |

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT License** — lihat file [LICENSE](LICENSE) untuk rincian lengkap.

Dibuat dengan dedikasi oleh [Gilang Anugrah](https://github.com/Gilang999-web).
