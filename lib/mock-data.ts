import { Category, Product, Transaction, User, StoreSettings } from "./types";

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Minuman Kopi", slug: "kopi", description: "Varian kopi arabika dan espresso based" },
  { id: "cat-2", name: "Non-Kopi & Teh", slug: "non-kopi", description: "Minuman teh artisan dan olahan susu" },
  { id: "cat-3", name: "Makanan Utama", slug: "makanan", description: "Menu makanan berat siap saji" },
  { id: "cat-4", name: "Snack & Pastry", slug: "snack", description: "Camilan pendamping dan roti panggang" },
];

export const initialProducts: Product[] = [
  // Minuman Kopi
  {
    id: "prod-1",
    name: "Kopi Susu Gula Aren",
    sku: "KOP-101",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 9000,
    sell_price: 20000,
    stock_qty: 65,
    min_stock: 15,
    is_active: true,
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "prod-2",
    name: "Espresso Double Shot",
    sku: "KOP-102",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 7000,
    sell_price: 18000,
    stock_qty: 40,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-01T08:00:00Z",
  },
  {
    id: "prod-3",
    name: "Cold Brew Signature",
    sku: "KOP-103",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 12000,
    sell_price: 25000,
    stock_qty: 18,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-02T08:00:00Z",
  },
  {
    id: "prod-4",
    name: "Caramel Macchiato",
    sku: "KOP-104",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 13000,
    sell_price: 28000,
    stock_qty: 24,
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-02T08:00:00Z",
  },
  {
    id: "prod-5",
    name: "Americano Iced",
    sku: "KOP-105",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 6500,
    sell_price: 16000,
    stock_qty: 55,
    min_stock: 15,
    is_active: true,
    created_at: "2026-09-03T08:00:00Z",
  },
  {
    id: "prod-6",
    name: "Caffe Latte Hot",
    sku: "KOP-106",
    category_id: "cat-1",
    category_name: "Minuman Kopi",
    buy_price: 11000,
    sell_price: 24000,
    stock_qty: 32,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-03T08:00:00Z",
  },

  // Non-Kopi & Teh
  {
    id: "prod-7",
    name: "Matcha Latte Uji",
    sku: "TEH-201",
    category_id: "cat-2",
    category_name: "Non-Kopi & Teh",
    buy_price: 14000,
    sell_price: 26000,
    stock_qty: 28,
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-03T08:00:00Z",
  },
  {
    id: "prod-8",
    name: "Earl Grey Milk Tea",
    sku: "TEH-202",
    category_id: "cat-2",
    category_name: "Non-Kopi & Teh",
    buy_price: 10000,
    sell_price: 22000,
    stock_qty: 35,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-04T08:00:00Z",
  },
  {
    id: "prod-9",
    name: "Teh Tarik Melati",
    sku: "TEH-203",
    category_id: "cat-2",
    category_name: "Non-Kopi & Teh",
    buy_price: 6000,
    sell_price: 15000,
    stock_qty: 50,
    min_stock: 12,
    is_active: true,
    created_at: "2026-09-04T08:00:00Z",
  },
  {
    id: "prod-10",
    name: "Chocolate Swiss Artisan",
    sku: "TEH-204",
    category_id: "cat-2",
    category_name: "Non-Kopi & Teh",
    buy_price: 13000,
    sell_price: 25000,
    stock_qty: 22,
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-05T08:00:00Z",
  },
  {
    id: "prod-11",
    name: "Lemon Lychee Tea",
    sku: "TEH-205",
    category_id: "cat-2",
    category_name: "Non-Kopi & Teh",
    buy_price: 8000,
    sell_price: 18000,
    stock_qty: 42,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-05T08:00:00Z",
  },

  // Makanan Utama
  {
    id: "prod-12",
    name: "Nasi Goreng Kampung Spesial",
    sku: "MAK-301",
    category_id: "cat-3",
    category_name: "Makanan Utama",
    buy_price: 16000,
    sell_price: 32000,
    stock_qty: 30,
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-06T08:00:00Z",
  },
  {
    id: "prod-13",
    name: "Mie Ayam Jamur Pangsit",
    sku: "MAK-302",
    category_id: "cat-3",
    category_name: "Makanan Utama",
    buy_price: 14000,
    sell_price: 28000,
    stock_qty: 25,
    min_stock: 6,
    is_active: true,
    created_at: "2026-09-06T08:00:00Z",
  },
  {
    id: "prod-14",
    name: "Rice Bowl Ayam Sambal Matah",
    sku: "MAK-303",
    category_id: "cat-3",
    category_name: "Makanan Utama",
    buy_price: 17000,
    sell_price: 34000,
    stock_qty: 20,
    min_stock: 5,
    is_active: true,
    created_at: "2026-09-07T08:00:00Z",
  },
  {
    id: "prod-15",
    name: "Rice Bowl Sapi Lada Hitam",
    sku: "MAK-304",
    category_id: "cat-3",
    category_name: "Makanan Utama",
    buy_price: 21000,
    sell_price: 42000,
    stock_qty: 15,
    min_stock: 5,
    is_active: true,
    created_at: "2026-09-07T08:00:00Z",
  },
  {
    id: "prod-16",
    name: "Spaghetti Aglio Olio Tuna",
    sku: "MAK-305",
    category_id: "cat-3",
    category_name: "Makanan Utama",
    buy_price: 18000,
    sell_price: 36000,
    stock_qty: 12,
    min_stock: 5,
    is_active: true,
    created_at: "2026-09-08T08:00:00Z",
  },

  // Snack & Pastry
  {
    id: "prod-17",
    name: "Croissant Mentega Perancis",
    sku: "SNK-401",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 11000,
    sell_price: 22000,
    stock_qty: 16,
    min_stock: 6,
    is_active: true,
    created_at: "2026-09-08T08:00:00Z",
  },
  {
    id: "prod-18",
    name: "Pain au Chocolat",
    sku: "SNK-402",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 13000,
    sell_price: 25000,
    stock_qty: 14,
    min_stock: 5,
    is_active: true,
    created_at: "2026-09-09T08:00:00Z",
  },
  {
    id: "prod-19",
    name: "Roti Bakar Keju Coklat",
    sku: "SNK-403",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 9000,
    sell_price: 20000,
    stock_qty: 30,
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-09T08:00:00Z",
  },
  {
    id: "prod-20",
    name: "Singkong Krispi Sambal Roa",
    sku: "SNK-404",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 8000,
    sell_price: 18000,
    stock_qty: 4, // low stock alert
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-10T08:00:00Z",
  },
  {
    id: "prod-21",
    name: "Kentang Goreng Truffle Parm",
    sku: "SNK-405",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 12000,
    sell_price: 24000,
    stock_qty: 3, // low stock alert
    min_stock: 10,
    is_active: true,
    created_at: "2026-09-10T08:00:00Z",
  },
  {
    id: "prod-22",
    name: "Pisang Goreng Wijen Madu",
    sku: "SNK-406",
    category_id: "cat-4",
    category_name: "Snack & Pastry",
    buy_price: 7500,
    sell_price: 16000,
    stock_qty: 25,
    min_stock: 8,
    is_active: true,
    created_at: "2026-09-11T08:00:00Z",
  },
];

export const initialUsers: User[] = [
  {
    id: "usr-admin",
    name: "Budi Santoso",
    email: "admin@kasirku.com",
    role: "admin",
    is_active: true,
    created_at: "2026-08-01T08:00:00Z",
  },
  {
    id: "usr-cashier-1",
    name: "Siti Rahma",
    email: "kasir@kasirku.com",
    role: "cashier",
    is_active: true,
    created_at: "2026-08-15T08:00:00Z",
  },
];

export const initialSettings: StoreSettings = {
  name: "Kopi & Roti Nusantara",
  tagline: "Sajian Tradisi Rasa Masa Kini",
  address: "Jl. Veteran No. 45, Kebayoran Baru, Jakarta Selatan",
  phone: "0812-3456-7890",
  email: "kontak@kopinusantara.id",
  receipt_header: "Terima kasih atas kunjungan Anda!",
  receipt_footer: "Barang yang sudah dibeli tidak dapat ditukar atau dikembalikan.",
  tax_percentage: 10,
  currency: "IDR",
};

// Generate realistic transactions for the last 7 days
export function generateInitialTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const cashiers = [
    { id: "usr-cashier-1", name: "Siti Rahma" },
    { id: "usr-admin", name: "Budi Santoso" },
  ];
  const paymentMethods: Array<"cash" | "qris" | "transfer"> = ["cash", "qris", "cash", "qris", "transfer"];

  const now = new Date();

  // Create transactions spanning the last 7 days
  let counter = 101;
  for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() - dayOffset);

    // Number of transactions per day: 7 to 10
    const txCount = 7 + (counter % 4);

    for (let i = 0; i < txCount; i++) {
      counter++;
      const hour = 8 + Math.floor((i / txCount) * 12); // between 8 AM and 8 PM
      const minute = (i * 7) % 60;
      targetDate.setHours(hour, minute, 0, 0);

      const cashier = cashiers[counter % 2];
      const method = paymentMethods[counter % paymentMethods.length];

      // Pick 1 to 3 items
      const numItems = (counter % 3) + 1;
      const items = [];
      let subtotal = 0;

      for (let j = 0; j < numItems; j++) {
        const productIndex = (counter + j * 3) % initialProducts.length;
        const prod = initialProducts[productIndex];
        const qty = ((counter + j) % 2) + 1;
        const lineTotal = prod.sell_price * qty;
        subtotal += lineTotal;

        items.push({
          id: `item-${counter}-${j}`,
          transaction_id: `tx-${counter}`,
          product_id: prod.id,
          product_name: prod.name,
          quantity: qty,
          unit_price: prod.sell_price,
          subtotal: lineTotal,
        });
      }

      const discount = counter % 8 === 0 ? 5000 : 0;
      const total = subtotal - discount;
      const amountPaid = method === "cash" 
        ? (total <= 50000 ? 50000 : (total <= 100000 ? 100000 : total + 20000))
        : total;
      const change = amountPaid - total;

      const dateCode = targetDate.toISOString().slice(2, 10).replace(/-/g, "");
      const invoiceNumber = `INV/${dateCode}/${String(counter).padStart(4, "0")}`;

      transactions.push({
        id: `tx-${counter}`,
        invoice_number: invoiceNumber,
        user_id: cashier.id,
        cashier_name: cashier.name,
        subtotal,
        discount,
        tax: 0,
        total,
        amount_paid: amountPaid,
        change,
        payment_method: method,
        items,
        status: "completed",
        created_at: targetDate.toISOString(),
      });
    }
  }

  return transactions;
}
