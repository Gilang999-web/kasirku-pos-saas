export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  category_name?: string;
  buy_price: number;
  sell_price: number;
  stock_qty: number;
  min_stock: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  discount?: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer';

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  user_id: string;
  cashier_name: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amount_paid: number;
  change: number;
  payment_method: PaymentMethod;
  items: TransactionItem[];
  status: 'completed' | 'void';
  created_at: string;
}

export interface StockMovement {
  id: string;
  product_id: string;
  product_name: string;
  user_id: string;
  user_name: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  notes: string;
  created_at: string;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  receipt_header: string;
  receipt_footer: string;
  tax_percentage: number;
  currency: string;
}
