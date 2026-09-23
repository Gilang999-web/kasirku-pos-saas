-- ==============================================================================
-- KASIRKU CLOUD POS SAAS - SEED DATA INICIAL
-- Target: PostgreSQL / Supabase
-- Tanggal: 18 September 2026
-- ==============================================================================

-- 1. SEED DATA STORE SETTINGS
INSERT INTO public.store_settings (id, name, tagline, address, phone, email, receipt_header, receipt_footer, tax_percentage, currency)
VALUES (
    1,
    'Kopi & Roti Nusantara',
    'Sajian Tradisi Rasa Masa Kini',
    'Jl. Veteran No. 45, Kebayoran Baru, Jakarta Selatan',
    '0812-3456-7890',
    'kontak@kopinusantara.id',
    'Terima kasih atas kunjungan Anda!',
    'Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.',
    10,
    'IDR'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    receipt_header = EXCLUDED.receipt_header,
    receipt_footer = EXCLUDED.receipt_footer,
    tax_percentage = EXCLUDED.tax_percentage;

-- 2. SEED DATA PROFILES
INSERT INTO public.profiles (id, name, email, role, is_active)
VALUES
    ('usr-admin', 'Budi Santoso', 'admin@kasirku.com', 'admin', TRUE),
    ('usr-cashier-1', 'Siti Rahma', 'kasir@kasirku.com', 'cashier', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED DATA CATEGORIES
INSERT INTO public.categories (id, name, slug, description)
VALUES
    ('cat-1', 'Minuman Kopi', 'kopi', 'Varian kopi arabika dan espresso based'),
    ('cat-2', 'Non-Kopi & Teh', 'non-kopi', 'Minuman teh artisan dan olahan susu'),
    ('cat-3', 'Makanan Utama', 'makanan', 'Menu makanan berat siap saji'),
    ('cat-4', 'Snack & Pastry', 'snack', 'Camilan pendamping dan roti panggang')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED DATA PRODUCTS (22 Produk UMKM Indonesia)
INSERT INTO public.products (id, name, sku, category_id, category_name, buy_price, sell_price, stock_qty, min_stock, is_active)
VALUES
    -- Minuman Kopi
    ('prod-1', 'Kopi Susu Gula Aren', 'KOP-101', 'cat-1', 'Minuman Kopi', 9000, 20000, 65, 15, TRUE),
    ('prod-2', 'Espresso Double Shot', 'KOP-102', 'cat-1', 'Minuman Kopi', 7000, 18000, 40, 10, TRUE),
    ('prod-3', 'Cold Brew Signature', 'KOP-103', 'cat-1', 'Minuman Kopi', 12000, 25000, 18, 10, TRUE),
    ('prod-4', 'Caramel Macchiato', 'KOP-104', 'cat-1', 'Minuman Kopi', 13000, 28000, 24, 8, TRUE),
    ('prod-5', 'Americano Iced', 'KOP-105', 'cat-1', 'Minuman Kopi', 6500, 16000, 55, 15, TRUE),
    ('prod-6', 'Caffe Latte Hot', 'KOP-106', 'cat-1', 'Minuman Kopi', 11000, 24000, 32, 10, TRUE),

    -- Non-Kopi & Teh
    ('prod-7', 'Matcha Latte Uji', 'TEH-201', 'cat-2', 'Non-Kopi & Teh', 14000, 26000, 28, 8, TRUE),
    ('prod-8', 'Earl Grey Milk Tea', 'TEH-202', 'cat-2', 'Non-Kopi & Teh', 10000, 22000, 35, 10, TRUE),
    ('prod-9', 'Teh Tarik Melati', 'TEH-203', 'cat-2', 'Non-Kopi & Teh', 6000, 15000, 50, 12, TRUE),
    ('prod-10', 'Chocolate Swiss Artisan', 'TEH-204', 'cat-2', 'Non-Kopi & Teh', 13000, 25000, 22, 8, TRUE),
    ('prod-11', 'Lemon Lychee Tea', 'TEH-205', 'cat-2', 'Non-Kopi & Teh', 8000, 18000, 42, 10, TRUE),

    -- Makanan Utama
    ('prod-12', 'Nasi Goreng Kampung Spesial', 'MAK-301', 'cat-3', 'Makanan Utama', 16000, 32000, 30, 8, TRUE),
    ('prod-13', 'Mie Ayam Jamur Pangsit', 'MAK-302', 'cat-3', 'Makanan Utama', 14000, 28000, 25, 6, TRUE),
    ('prod-14', 'Rice Bowl Ayam Sambal Matah', 'MAK-303', 'cat-3', 'Makanan Utama', 17000, 34000, 20, 5, TRUE),
    ('prod-15', 'Rice Bowl Sapi Lada Hitam', 'MAK-304', 'cat-3', 'Makanan Utama', 21000, 42000, 15, 5, TRUE),
    ('prod-16', 'Spaghetti Aglio Olio Tuna', 'MAK-305', 'cat-3', 'Makanan Utama', 18000, 36000, 12, 5, TRUE),

    -- Snack & Pastry
    ('prod-17', 'Croissant Mentega Perancis', 'SNK-401', 'cat-4', 'Snack & Pastry', 11000, 22000, 16, 6, TRUE),
    ('prod-18', 'Pain au Chocolat', 'SNK-402', 'cat-4', 'Snack & Pastry', 13000, 25000, 14, 5, TRUE),
    ('prod-19', 'Roti Bakar Keju Coklat', 'SNK-403', 'cat-4', 'Snack & Pastry', 9000, 20000, 30, 10, TRUE),
    ('prod-20', 'Singkong Krispi Sambal Roa', 'SNK-404', 'cat-4', 'Snack & Pastry', 8000, 18000, 4, 8, TRUE),
    ('prod-21', 'Kentang Goreng Truffle Parm', 'SNK-405', 'cat-4', 'Snack & Pastry', 12000, 24000, 3, 10, TRUE),
    ('prod-22', 'Pisang Goreng Wijen Madu', 'SNK-406', 'cat-4', 'Snack & Pastry', 7500, 16000, 25, 8, TRUE)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    sku = EXCLUDED.sku,
    category_id = EXCLUDED.category_id,
    category_name = EXCLUDED.category_name,
    buy_price = EXCLUDED.buy_price,
    sell_price = EXCLUDED.sell_price,
    stock_qty = EXCLUDED.stock_qty,
    min_stock = EXCLUDED.min_stock,
    is_active = EXCLUDED.is_active;
