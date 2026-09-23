# Tutorial Lengkap Migrasi Backend KasirKu ke Supabase Cloud (PostgreSQL & Auth)

> **Proyek:** KasirKu Cloud POS SaaS  
> **Target Database:** Supabase (PostgreSQL Terkelola di Cloud)  
> **Berkas SQL Pendukung:** [supabase/schema.sql](file:///c:/Users/Gilang%20Anugrah/OneDrive/Dokumen/PORTOFOLIO/Portofolio%201/supabase/schema.sql) dan [supabase/seed.sql](file:///c:/Users/Gilang%20Anugrah/OneDrive/Dokumen/PORTOFOLIO/Portofolio%201/supabase/seed.sql)

---

## Daftar Isi
1. [Gambaran Arsitektur](#1-gambaran-arsitektur)
2. [Langkah 1: Membuat Akun & Proyek di Supabase Cloud](#langkah-1-membuat-akun--proyek-di-supabase-cloud)
3. [Langkah 2: Mengambil Kredensial API](#langkah-2-mengambil-kredensial-api)
4. [Langkah 3: Konfigurasi File Environment `.env.local`](#langkah-3-konfigurasi-file-environment-envlocal)
5. [Langkah 4: Menjalankan Skrip Migrasi SQL di Supabase](#langkah-4-menjalankan-skrip-migrasi-sql-di-supabase)
6. [Langkah 5: Instalasi SDK & Pembuatan Client Supabase](#langkah-5-instalasi-sdk--pembuatan-client-supabase)
7. [Langkah 6: Menghubungkan Store Zustand (`lib/store.ts`) ke Supabase](#langkah-6-menghubungkan-store-zustand-libstorets-ke-supabase)
8. [Langkah 7: Pengujian & Validasi End-to-End](#langkah-7-pengujian--validasi-end-to-end)
9. [Troubleshooting & Solusi Masalah Umum](#troubleshooting--solusi-masalah-umum)

---

## 1. Gambaran Arsitektur

Saat ini, KasirKu menggunakan pendekatan **UI-First** dengan mock data in-memory:
* **Kondisi Sebelum Migrasi:** Data produk dan transaksi disimpan di RAM browser via Zustand. Jika browser di-*refresh* keras (*hard refresh*), data baru akan ter-reset ke data bawaan.
* **Setelah Migrasi ke Supabase:**
  * **Database Cloud (Supabase PostgreSQL):** Menjadi sumber kebenaran data permanen (*single source of truth*).
  * **Zustand (Client Cache):** Tetap digunakan agar respons antarmuka POS kasir secepat kilat (0 lag saat klik menu & hitung kembalian), namun setiap aksi simpan akan disinkronkan ke Supabase di background.
  * **Graceful Fallback:** Jika file `.env.local` belum diisi atau koneksi internet terputus, aplikasi tetap otomatis berjalan menggunakan mock data tanpa error.

---

## Langkah 1: Membuat Akun & Proyek di Supabase Cloud

1. Buka peramban (browser) dan kunjungi [https://supabase.com](https://supabase.com).
2. Klik tombol **"Start your project"** atau **"Sign In"**. Anda dapat login langsung menggunakan akun **GitHub**.
3. Setelah masuk ke dashboard Supabase, klik tombol **"New Project"**.
4. Pilih organisasi Anda (default personal organization).
5. Isi formulir pembuatan proyek:
   * **Name:** `kasirku-pos-saas` (atau nama pilihan Anda).
   * **Database Password:** Buat password yang kuat dan catat di tempat aman.
   * **Region:** Pilih **`Singapore (ap-southeast-1)`** *(sangat penting agar respon POS kasir di Indonesia memiliki latensi rendah < 50ms)*.
   * **Pricing Plan:** Pilih **Free Plan** (sudah mencakup 500MB database dan 50.000 pengguna aktif per bulan).
6. Klik tombol **"Create new project"**.
7. Tunggu sekitar 1 hingga 2 menit hingga proses *provisioning* selesai dan status database menjadi **Active**.

---

## Langkah 2: Mengambil Kredensial API

Setelah proyek aktif di dashboard Supabase:

1. Di bilah menu samping kiri, klik ikon gerigi **Project Settings** (di bagian paling bawah).
2. Pilih sub-menu **API** (atau **Data API**).
3. Temukan dua nilai penting berikut:
   * **Project URL**: Berformat `https://[project-ref].supabase.co`
   * **Project API Keys**: Salin kunci dengan label **`anon` / `public`** (ini adalah token JWT aman untuk sisi browser).
4. Biarkan tab browser ini tetap terbuka untuk langkah selanjutnya.

---

## Langkah 3: Konfigurasi File Environment `.env.local`

1. Buka folder proyek KasirKu di editor Anda: `c:\Users\Gilang Anugrah\OneDrive\Dokumen\PORTOFOLIO\Portofolio 1`.
2. Buat file baru bernama `.env.local` di direktori utama (sejajar dengan `package.json`).
3. Masukkan Project URL dan Anon Key yang Anda salin dari Langkah 2:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Penting:** Pastikan tidak ada spasi di awal atau akhir tanda `=` dan jangan mengunggah file `.env.local` ke repositori Git publik (file ini sudah otomatis tercatat di `.gitignore`).

---

## Langkah 4: Menjalankan Skrip Migrasi SQL di Supabase

Kami telah menyediakan skrip SQL yang sudah disesuaikan persis dengan skema data KasirKu. Anda tinggal menjalankannya di SQL Editor Supabase:

### A. Eksekusi Skema Tabel (`schema.sql`)
1. Di dashboard Supabase Anda, klik menu **SQL Editor** (ikon `>_` di bilah kiri).
2. Klik **"New query"**.
3. Buka file [supabase/schema.sql](file:///c:/Users/Gilang%20Anugrah/OneDrive/Dokumen/PORTOFOLIO/Portofolio%201/supabase/schema.sql) yang ada di proyek Anda, salin seluruh kodenya, lalu tempelkan (*paste*) ke dalam SQL Editor Supabase.
4. Klik tombol **"Run"** (atau tekan shortcut `Ctrl + Enter`).
5. Pastikan muncul notifikasi **"Success. No rows returned"**.

> Skrip ini otomatis membuat 7 tabel utama (`categories`, `products`, `transactions`, `transaction_items`, `stock_movements`, `store_settings`, `profiles`), memasang indeks performa, dan mengaktifkan Row Level Security (RLS) dengan policy siap pakai.

### B. Eksekusi Data Awal (`seed.sql`)
1. Di SQL Editor Supabase, klik **"New query"** lagi.
2. Buka file [supabase/seed.sql](file:///c:/Users/Gilang%20Anugrah/OneDrive/Dokumen/PORTOFOLIO/Portofolio%201/supabase/seed.sql), salin kodenya, dan tempelkan ke SQL Editor.
3. Klik tombol **"Run"**.
4. Skrip ini akan mengisi 4 kategori default, 22 menu realistis Indonesia (Kopi Susu Aren, Mie Ayam Jamur, Croissant, dll.), serta pengaturan profil toko default.

### C. Verifikasi di Supabase Table Editor
1. Klik menu **Table Editor** (ikon tabel di bilah kiri).
2. Periksa tabel `products` dan `categories`: Anda akan melihat 22 produk dan 4 kategori telah berhasil tersimpan di database PostgreSQL cloud.

---

## Langkah 5: Instalasi SDK & Pembuatan Client Supabase

1. Buka terminal di folder proyek Anda, lalu jalankan perintah instalasi SDK resmi Supabase:
   ```bash
   npm install @supabase/supabase-js
   ```

2. Buat file client helper di `lib/supabase.ts`:
   ```typescript
   import { createClient } from "@supabase/supabase-js";

   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
   const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

   export const isSupabaseConfigured = (): boolean => {
     return Boolean(
       supabaseUrl && 
       supabaseAnonKey && 
       !supabaseUrl.includes("your-project-id")
     );
   };

   export const supabase = isSupabaseConfigured()
     ? createClient(supabaseUrl, supabaseAnonKey)
     : null;
   ```

---

## Langkah 6: Menghubungkan Store Zustand (`lib/store.ts`) ke Supabase

Agar aplikasi dapat membaca dan menulis langsung ke Supabase tanpa mengubah kode komponen antarmuka yang sudah ada:

1. **Tambah Fungsi Inisialisasi Data (`initStore`)**:
   Saat aplikasi dibuka, panggil data `categories`, `products`, `transactions`, dan `store_settings` dari Supabase via query `supabase.from('products').select('*')`.
2. **Sinkronkan Aksi Mutasi Produk**:
   * `addProduct`: Selain menambah ke array lokal, jalankan `await supabase.from('products').insert([newProduct])`.
   * `updateProduct`: Jalankan `await supabase.from('products').update(updates).eq('id', id)`.
   * `deleteProduct`: Jalankan `await supabase.from('products').delete().eq('id', id)`.
3. **Sinkronkan Aksi Transaksi Kasir (`completeTransaction`)**:
   * Simpan nota transaksi ke tabel `transactions`.
   * Simpan setiap rincian item ke tabel `transaction_items`.
   * Kurangi `stock_qty` pada tabel `products`.
   * Catat mutasi stok keluar ke tabel `stock_movements`.
4. **Panggil `initStore` di Root Dashboard Layout**:
   Di file `app/(dashboard)/layout.tsx`, tambahkan `useEffect` yang menjalankan `initStore()` saat pertama kali halaman dashboard dirender.

---

## Langkah 7: Pengujian & Validasi End-to-End

Setelah langkah 1 sampai 6 selesai, lakukan validasi berikut:

1. **Jalankan Server Lokal:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di peramban.

2. **Uji Tambah Produk Baru:**
   * Buka halaman `/products`.
   * Klik **"Tambah Produk"**, masukkan nama produk uji coba (misal: *"Es Kopi Pandan"*), harga beli `10000`, harga jual `22000`, stok `50`.
   * Simpan produk.
   * Lakukan *Hard Refresh* browser (`Ctrl + F5` atau `Cmd + Shift + R`).
   * **Hasil Berhasil:** Produk *"Es Kopi Pandan"* tetap muncul dan tidak hilang.
   * Buka Supabase Table Editor -> Tabel `products`: Baris baru *"Es Kopi Pandan"* langsung terlihat.

3. **Uji Checkout Transaksi di POS:**
   * Buka layar kasir `/pos`.
   * Masukkan 2 item ke keranjang belanja.
   * Tekan tombol pintas `F8` atau klik tombol **"Bayar Sekarang"**.
   * Pilih metode pembayaran Tunai, klik tombol cepat Rp 100.000, lalu klik **"Konfirmasi Pembayaran"**.
   * Cetak struk atau tutup dialog.
   * Buka Supabase Table Editor -> Tabel `transactions` dan `transaction_items`: Record transaksi beserta invoice nota dan rincian belanja telah tercatat rapi di cloud.
   * Periksa tabel `products`: Stok kedua produk tersebut otomatis terpotong sesuai kuantitas yang terjual.

---

## Troubleshooting & Solusi Masalah Umum

### 1. Error: *"new row violates row-level security policy for table 'xxx'"*
* **Penyebab:** Row Level Security (RLS) aktif tetapi belum ada policy izin insert/select untuk role `anon`.
* **Solusi:** Jalankan kembali blok RLS policy yang ada di bagian bawah file [supabase/schema.sql](file:///c:/Users/Gilang%20Anugrah/OneDrive/Dokumen/PORTOFOLIO/Portofolio%201/supabase/schema.sql).

### 2. Error: *"FetchError: Failed to fetch / invalid API key"*
* **Penyebab:** Format URL atau API Key di file `.env.local` keliru atau server Next.js belum di-*restart*.
* **Solusi:** Matikan server dev di terminal (`Ctrl + C`) dan jalankan kembali `npm run dev` agar Next.js memuat ulang file environment terbaru.

### 3. Layar Blank saat Koneksi Terputus
* **Penyebab:** Query Supabase tidak memiliki penanganan error (*try-catch*).
* **Solusi:** Selalu gunakan pola pengecekan `if (!isSupabaseConfigured() || error) { fallbackToLocal(); }` seperti yang telah disiapkan di modul integrasi.

---

## Ringkasan Check-List Selesai

- [ ] Akun Supabase dibuat & project berstatus Active (Region Singapore)
- [ ] File `.env.local` dibuat dan diisi kredensial Supabase
- [ ] Skrip `supabase/schema.sql` sukses dijalankan di SQL Editor
- [ ] Skrip `supabase/seed.sql` sukses dijalankan di SQL Editor
- [ ] Dependensi `@supabase/supabase-js` terpasang
- [ ] Modul `lib/supabase.ts` dan pembaruan `lib/store.ts` aktif
- [ ] Uji coba transaksi POS tersimpan permanen di cloud
