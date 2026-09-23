import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter").max(100),
  slug: z.string().min(2, "Slug minimal 2 karakter").max(100),
  description: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(150),
  sku: z.string().min(3, "SKU minimal 3 karakter").max(50),
  category_id: z.string().optional().nullable().or(z.literal("")),
  category_name: z.string().optional().nullable(),
  buy_price: z.number().min(0, "Harga beli tidak boleh negatif"),
  sell_price: z.number().min(0, "Harga jual tidak boleh negatif"),
  stock_qty: z.number().int("Stok harus berupa bilangan bulat").min(0, "Stok tidak boleh negatif"),
  min_stock: z.number().int("Min stok harus berupa bilangan bulat").min(0, "Min stok tidak boleh negatif"),
  image_url: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export const transactionItemSchema = z.object({
  product_id: z.string().min(1, "Product ID wajib ada"),
  product_name: z.string().min(1, "Product Name wajib ada"),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  unit_price: z.number().min(0, "Harga satuan tidak valid"),
  subtotal: z.number().min(0, "Subtotal tidak valid"),
  notes: z.string().optional(),
});

export const transactionSchema = z.object({
  payment_method: z.enum(["cash", "qris", "transfer"]),
  amount_paid: z.number().min(0, "Jumlah bayar tidak boleh negatif"),
  discount: z.number().min(0).default(0),
  items: z.array(transactionItemSchema).min(1, "Keranjang tidak boleh kosong"),
});

export const settingsSchema = z.object({
  name: z.string().min(2, "Nama toko minimal 2 karakter"),
  tagline: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  receipt_header: z.string().optional(),
  receipt_footer: z.string().optional(),
  tax_percentage: z.number().min(0).max(100).default(0),
  currency: z.string().min(1).default("IDR"),
});
