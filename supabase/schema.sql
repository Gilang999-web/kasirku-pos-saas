-- ==============================================================================
-- KASIRKU CLOUD POS SAAS - DATABASE SCHEMA MIGRATION
-- Target: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Enable extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABEL 0: STORES (Data Tenant / Toko)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- TABEL 1: PROFILES (Relasi Akun Kasir & Admin)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'cashier')),
    avatar TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- TABEL 2: CATEGORIES (Kategori Menu & Produk)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, slug)
);

-- ==============================================================================
-- TABEL 3: PRODUCTS (Katalog Menu & Inventaris)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sku TEXT NOT NULL,
    category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
    category_name TEXT,
    buy_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    sell_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    stock_qty INTEGER NOT NULL DEFAULT 0,
    min_stock INTEGER NOT NULL DEFAULT 5,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, sku)
);

-- ==============================================================================
-- TABEL 4: TRANSACTIONS (Header Transaksi Penjualan POS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    cashier_name TEXT NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(15, 2) NOT NULL DEFAULT 0,
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0,
    total NUMERIC(15, 2) NOT NULL DEFAULT 0,
    amount_paid NUMERIC(15, 2) NOT NULL DEFAULT 0,
    change NUMERIC(15, 2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'qris', 'transfer')),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'void')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(store_id, invoice_number)
);

-- ==============================================================================
-- TABEL 5: TRANSACTION_ITEMS (Rincian Item Produk Terjual)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.transaction_items (
    id TEXT PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    transaction_id TEXT NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- TABEL 6: STOCK_MOVEMENTS (Audit Mutasi Keluar/Masuk Stok)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id TEXT PRIMARY KEY,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- TABEL 7: STORE_SETTINGS (Profil Toko & Pengaturan Struk)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL UNIQUE REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    tagline TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    receipt_header TEXT,
    receipt_footer TEXT,
    tax_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'IDR',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ==============================================================================
-- INDEX PERFORMA UNTUK PENCARIAN & QUERY CEPAT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_invoice ON public.transactions(store_id, invoice_number);
CREATE INDEX IF NOT EXISTS idx_transaction_items_tx ON public.transaction_items(transaction_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (MULTI-TENANT ISOLATION)
-- ==============================================================================

-- Enable RLS for all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's store_id securely from profiles
-- Using a security definer function prevents infinite recursion when querying profiles
CREATE OR REPLACE FUNCTION public.get_auth_store_id()
RETURNS UUID
LANGUAGE sql SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT store_id FROM profiles WHERE id = auth.uid();
$$;

-- 1. STORES
-- A user can only view their own store. 
-- New users can create a store when they register.
CREATE POLICY "Users can view their own store" 
ON public.stores FOR SELECT 
USING (id = get_auth_store_id());

CREATE POLICY "Users can create stores" 
ON public.stores FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- 2. PROFILES
-- Users can view profiles in their own store, and their own profile.
CREATE POLICY "Users can view profiles in their store" 
ON public.profiles FOR SELECT 
USING (store_id = get_auth_store_id() OR id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (id = auth.uid());

-- Initial profile creation during signup
CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- 3. ALL OTHER TABLES (Multi-Tenant Isolation)
-- Users can perform full CRUD, but ONLY for rows where store_id matches their own store_id.

-- Categories
CREATE POLICY "Tenant isolation for categories" ON public.categories 
FOR ALL USING (store_id = get_auth_store_id());

-- Products
CREATE POLICY "Tenant isolation for products" ON public.products 
FOR ALL USING (store_id = get_auth_store_id());

-- Transactions
CREATE POLICY "Tenant isolation for transactions" ON public.transactions 
FOR ALL USING (store_id = get_auth_store_id());

-- Transaction Items
CREATE POLICY "Tenant isolation for transaction_items" ON public.transaction_items 
FOR ALL USING (store_id = get_auth_store_id());

-- Stock Movements
CREATE POLICY "Tenant isolation for stock_movements" ON public.stock_movements 
FOR ALL USING (store_id = get_auth_store_id());

-- Store Settings
CREATE POLICY "Tenant isolation for store_settings" ON public.store_settings 
FOR ALL USING (store_id = get_auth_store_id());

-- ==============================================================================
-- DATABASE FUNCTIONS (RPC)
-- ==============================================================================

-- Function to decrement stock atomically (prevents race conditions)
CREATE OR REPLACE FUNCTION decrement_stock(p_product_id TEXT, p_qty INT, p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_stock INT;
BEGIN
  -- Lock the row for update to prevent concurrent modifications
  SELECT stock_qty INTO current_stock 
  FROM products 
  WHERE id = p_product_id AND store_id = p_store_id 
  FOR UPDATE;
  
  -- Check if product exists and stock is sufficient
  IF current_stock >= p_qty THEN
    UPDATE products 
    SET stock_qty = stock_qty - p_qty 
    WHERE id = p_product_id AND store_id = p_store_id;
    RETURN true;
  ELSE
    RETURN false;
  END IF;
END;
$$;

