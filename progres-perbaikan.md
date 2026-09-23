# KasirKu POS SaaS — Progres Perbaikan Production-Ready

> Dokumen ini berisi analisis menyeluruh dan checklist langkah-langkah yang harus dilakukan agar KasirKu **aman, nyaman, dan siap digunakan user sungguhan**.
> Tandai `[x]` pada setiap item yang sudah selesai dikerjakan.

---

## Hasil Analisis Keadaan Saat Ini

### Apa yang Sudah Bagus ✅

| Area         | Detail                                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- |
| UI/UX        | Desain premium dengan Tailwind, Fraunces + Plus Jakarta Sans font, responsive layout, keyboard shortcuts (F2/F4/F8/F9) |
| POS Flow     | Alur kasir lengkap: katalog → cart → pembayaran → struk digital                                                     |
| Cloud Sync   | Optimistic update + background sync ke Supabase                                                                        |
| Fitur Bisnis | Dashboard, laporan keuangan, manajemen produk, kategori, riwayat transaksi, pengaturan toko                            |

### Masalah yang Ditemukan 🚨

| #  | Masalah                                                                                                                       | Severity    | File Terkait                     |
| -- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | -------------------------------- |
| 1  | **Tidak ada autentikasi sungguhan** — Login hanya dummy (cek apakah email mengandung "kasir", tanpa validasi password) | 🔴 CRITICAL | `app/(auth)/login/page.tsx`    |
| 2  | **RLS Supabase terbuka total** — Semua tabel `USING (true)` artinya siapapun bisa baca/tulis/hapus semua data        | 🔴 CRITICAL | `supabase/schema.sql` L139-162 |
| 3  | **Tidak ada route protection** — Dashboard bisa diakses langsung tanpa login, tidak ada middleware                     | 🔴 CRITICAL | Tidak ada`middleware.ts`       |
| 4  | **Supabase client hanya anon key** — Tidak ada server-side auth, semua operasi lewat client-side anon key              | 🔴 HIGH     | `lib/supabase.ts`              |
| 5  | **Tidak ada multi-tenancy** — Semua toko share database yang sama, tidak ada `store_id` / `tenant_id`              | 🔴 HIGH     | Semua tabel                      |
| 6  | **ID menggunakan `Date.now()`** — Race condition, tidak collision-safe                                               | 🟡 MEDIUM   | `lib/store.ts` L208            |
| 7  | **Tidak ada input validation/sanitization** — Form produk, kategori, settings tanpa batasan                            | 🟡 MEDIUM   | Semua form pages                 |
| 8  | **Tidak ada error boundary** — Crash di satu komponen mematikan seluruh app                                            | 🟡 MEDIUM   | -                                |
| 9  | **Tidak ada halaman register** — User baru tidak bisa mendaftar                                                        | 🟡 MEDIUM   | -                                |
| 10 | **Tidak ada rate limiting** — Cloud sync tanpa throttle                                                                | 🟡 MEDIUM   | `lib/store.ts`                 |
| 11 | **Anon key di-commit ke Git** — `.env.local` di-commit ke repo                                                       | 🟡 MEDIUM   | `.env.local`                   |
| 12 | **Stok bisa negatif secara race condition** — Tidak ada server-side stock check                                        | 🟡 MEDIUM   | `lib/store.ts` L425-434        |
| 13 | **Tidak ada pagination** — Transaksi & produk di-load seluruhnya                                                       | 🟢 LOW      | -                                |

---

## FASE 1: Keamanan Autentikasi (Paling Kritis)

> ⚠️ CAUTION: Tanpa fase ini, siapapun bisa mengakses dan memanipulasi seluruh data.
> JANGAN deploy ke publik sebelum fase ini selesai.

### 1.1 Implementasi Supabase Auth

- [x] Ganti login dummy dengan `supabase.auth.signInWithPassword()`
- [x] Tambahkan halaman register dengan `supabase.auth.signUp()`
- [x] Simpan session di cookie (bukan hanya client-side state)
- [x] Install `@supabase/ssr` untuk integrasi server-side yang aman

**File yang harus diubah/ditambah:**

```
lib/supabase.ts           → Refactor menjadi client + server helpers
lib/supabase-server.ts    → [NEW] Server-side Supabase client
lib/supabase-middleware.ts → [NEW] Middleware Supabase client  
app/(auth)/login/page.tsx  → Ganti dummy login → real auth
app/(auth)/register/page.tsx → [NEW] Halaman pendaftaran
```

### 1.2 Route Protection dengan Middleware

- [x] Buat `middleware.ts` di root project
- [x] Cek session Supabase; redirect ke `/login` jika belum login
- [x] Redirect user yang sudah login dari `/login` ke `/dashboard`

**File yang harus ditambah:**

```
middleware.ts → [NEW] Next.js middleware untuk proteksi route
```

### 1.3 Perbaiki RLS (Row Level Security) di Supabase

- [x] Hapus policy `USING (true)` — ini membuka data ke semua orang
- [x] Buat policy yang hanya mengizinkan user yang ter-autentikasi dan terkait dengan toko tertentu

**Contoh policy yang benar:**

```sql
-- Hanya user yang login bisa mengakses data tokonya sendiri
CREATE POLICY "Users can view own store products" ON products
  FOR SELECT USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE id = auth.uid()
    )
  );
```

**File yang harus diubah:**

```
supabase/schema.sql → Rewrite semua RLS policies
```

---

## FASE 2: Multi-Tenancy (Data Isolation per Toko)

> ℹ️ PENTING: Sebagai SaaS, setiap toko harus memiliki data yang terisolasi.
> Tanpa ini, toko A bisa melihat data toko B.

### 2.1 Tambahkan Kolom `store_id` ke Semua Tabel

- [x] Buat tabel `stores` baru (id, name, owner_id, plan, created_at)
- [x] Tambahkan kolom `store_id` ke: `categories`, `products`, `transactions`, `transaction_items`, `stock_movements`, `store_settings`, `profiles`
- [x] Update semua query untuk menyertakan filter `store_id`

**File yang harus diubah:**

```
supabase/schema.sql → Tambah tabel stores + kolom store_id
lib/types.ts        → Tambah Store type, update semua types
lib/store.ts        → Semua query filter by store_id
```

### 2.2 Update RLS Policy Berbasis `store_id`

- [x] Setiap tabel hanya bisa diakses oleh user yang `store_id`-nya cocok

```sql
CREATE POLICY "Tenant isolation" ON products
  FOR ALL USING (
    store_id = (SELECT store_id FROM profiles WHERE id = auth.uid())
  );
```

---

## FASE 3: Keamanan Data & Input Validation

### 3.1 Server-Side Input Validation

- [x] Buat API routes (`app/api/...`) sebagai lapisan validasi antara frontend dan Supabase
- [x] Validasi semua input: tipe data, panjang string, range angka
- [x] Install library validasi `zod`

**File yang harus ditambah:**

```
lib/validations.ts              → [NEW] Zod schemas
app/api/products/route.ts       → [NEW] API CRUD produk
app/api/transactions/route.ts   → [NEW] API transaksi  
app/api/categories/route.ts     → [NEW] API kategori
app/api/settings/route.ts       → [NEW] API settings
```

**Contoh validasi dengan Zod:**

```typescript
const productSchema = z.object({
  name: z.string().min(2).max(100),
  sku: z.string().min(3).max(20),
  buy_price: z.number().min(0).max(999999999),
  sell_price: z.number().min(0).max(999999999),
  stock_qty: z.number().int().min(0),
  min_stock: z.number().int().min(0),
});
```

### 3.2 Proteksi Stok dari Race Condition

- [x] Pindahkan logic pengurangan stok ke database function (Supabase RPC)
- [x] Gunakan `SELECT FOR UPDATE` atau atomic decrement agar stok tidak pernah negatif

**Database function yang harus ditambah di Supabase:**

```sql
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id TEXT, p_qty INT)
RETURNS BOOLEAN AS $$
DECLARE current_stock INT;
BEGIN
  SELECT stock_qty INTO current_stock FROM products WHERE id = p_product_id FOR UPDATE;
  IF current_stock >= p_qty THEN
    UPDATE products SET stock_qty = stock_qty - p_qty WHERE id = p_product_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### 3.3 Gunakan UUID bukan `Date.now()`

- [x] Ganti semua `prod-${Date.now()}`, `tx-${Date.now()}` dengan `crypto.randomUUID()`
- [x] Atau biarkan Supabase generate UUID secara otomatis

---

## FASE 4: Fitur yang Dibutuhkan User Sungguhan

### 4.1 Halaman Register & Onboarding

- [x] Buat halaman `/register` dengan form: nama toko, email, password
- [x] Setelah register, otomatis buat record di `stores` dan `profiles`
- [x] Redirect ke setup wizard (isi nama toko, alamat, dll)

### 4.2 Manajemen User & Role

- [x] Buat halaman `/settings/users` untuk admin menambah/mengelola kasir
- [x] Admin bisa invite kasir via email
- [x] Kasir hanya bisa mengakses POS dan dashboard ringkas

### 4.3 Logout yang Berfungsi

- [x] Tambahkan tombol Logout di sidebar/topbar yang memanggil `supabase.auth.signOut()`
- [x] Hapus session dan redirect ke `/login`

### 4.4 Forgot Password / Reset Password

- [x] Buat halaman `/forgot-password`
- [x] Gunakan `supabase.auth.resetPasswordForEmail()`
- [x] Buat halaman `/reset-password` untuk set password baru

### 4.5 Export Laporan (CSV/PDF)

- [ ] Implementasi export CSV yang benar (bukan hanya `window.print()`)
- [ ] Install library seperti `papaparse` untuk CSV
- [ ] Opsional: generate PDF dengan `@react-pdf/renderer`

### 4.6 Pagination & Infinite Scroll

- [ ] Implementasi pagination server-side (Supabase `.range()`) di halaman Transactions
- [ ] Implementasi pagination di halaman Products
- [ ] Tampilkan 20-50 item per halaman

---

## FASE 5: Optimasi & Polish untuk Production

### 5.1 Error Boundaries

- [ ] Buat `app/error.tsx` — Global error boundary
- [ ] Buat `app/not-found.tsx` — Custom 404 page
- [ ] Buat `components/error-boundary.tsx` — Reusable error boundary

### 5.2 Loading States yang Proper

- [ ] Tambah `app/(dashboard)/loading.tsx` skeleton screens
- [ ] Tampilkan loading spinner saat fetch data dari Supabase
- [ ] Handle state `isLoading` di store dengan benar

### 5.3 Environment Variables & Security

- [ ] Pastikan `.env.local` ada di `.gitignore` (JANGAN commit anon key ke Git!)
- [ ] Pisahkan `SUPABASE_SERVICE_ROLE_KEY` (hanya server-side) dari anon key
- [ ] Tambahkan `NEXT_PUBLIC_` prefix hanya untuk variable yang memang perlu di client

### 5.4 Security Headers di `next.config.ts`

- [ ] Tambahkan security headers berikut:

```typescript
const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [{
    source: '/(.*)',
    headers: [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    ],
  }],
};
```

### 5.5 Monitoring & Logging

- [ ] Integrasikan error tracking (Sentry, LogRocket, atau Supabase Edge Functions logs)
- [ ] Log semua operasi penting (login, transaksi, perubahan produk) ke tabel `audit_logs`

---

## FASE 6: Deployment

### 6.1 Deploy ke Vercel

- [ ] Push code ke GitHub
- [ ] Connect repo ke Vercel
- [ ] Set environment variables di Vercel dashboard
- [ ] Vercel otomatis build dan deploy

### 6.2 Custom Domain & SSL

- [ ] Hubungkan domain custom (misal: `kasirku.id`) di Vercel
- [ ] SSL otomatis dari Vercel (Let's Encrypt)

### 6.3 Setup Supabase Production

- [ ] Buat project Supabase baru (terpisah dari development)
- [ ] Enable email confirmation di Auth settings
- [ ] Set password policy minimal 8 karakter
- [ ] Disable anonymous access di Supabase dashboard

---

## Ringkasan Prioritas

| Prioritas | Fase                                              | Estimasi Effort | Status   |
| --------- | ------------------------------------------------- | --------------- | -------- |
| 🔴 P0     | Fase 1: Autentikasi & Route Protection            | 2-3 hari        | ❌ Belum |
| 🔴 P0     | Fase 2: Multi-Tenancy & RLS                       | 2-3 hari        | ❌ Belum |
| 🟡 P1     | Fase 3: Input Validation & API Routes             | 2-3 hari        | ❌ Belum |
| 🟡 P1     | Fase 4: Fitur User (Register, Logout, Reset PW)   | 2-3 hari        | ❌ Belum |
| 🟢 P2     | Fase 5: Error Handling, Loading, Security Headers | 1-2 hari        | ❌ Belum |
| 🟢 P2     | Fase 6: Deployment & Monitoring                   | 1 hari          | ❌ Belum |

**Total estimasi: ~10-15 hari kerja**

---

## Keputusan Arsitektur yang Perlu Ditentukan

1. **Multi-tenancy approach**: Satu database shared dengan `store_id` (lebih mudah) atau database per tenant (lebih mahal)?
2. **Subscription / Billing**: Apakah ada rencana sistem langganan (free tier, pro, enterprise)?
3. **Email provider**: Cukup built-in Supabase email, atau custom SMTP (Resend, SendGrid)?
4. **Prioritas fase**: Mulai dari fase mana?

---

> 📝 **Cara penggunaan**: Tandai checkbox `[x]` setiap item yang sudah selesai.
> Dokumen ini bisa direferensikan kembali kapan saja untuk melanjutkan pekerjaan.
