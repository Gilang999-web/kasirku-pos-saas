import { create } from "zustand";
import { 
  User, 
  Product, 
  Category, 
  Transaction, 
  CartItem, 
  PaymentMethod, 
  StoreSettings 
} from "./types";
import { 
  initialUsers, 
  initialCategories, 
  initialProducts, 
  initialSettings, 
  generateInitialTransactions 
} from "./mock-data";
import { generateInvoiceNumber } from "./utils";

interface AppState {
  // Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (data: Omit<Product, "id" | "created_at">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (data: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;

  // POS Cart
  cart: CartItem[];
  cartDiscount: number;
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  setCartQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  setCartItemNotes: (productId: string, notes: string) => void;
  setCartDiscount: (amount: number) => void;
  clearCart: () => void;

  // Transactions
  transactions: Transaction[];
  lastTransaction: Transaction | null;
  completeTransaction: (
    paymentMethod: PaymentMethod,
    amountPaid: number
  ) => Transaction | null;

  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: initialUsers[0], // default Admin
  setCurrentUser: (user) => set({ currentUser: user }),

  products: initialProducts,
  categories: initialCategories,

  addProduct: (data) => {
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    set((state) => ({ products: [newProduct, ...state.products] }));
  },

  updateProduct: (id, updates) => {
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      cart: state.cart.filter((item) => item.product.id !== id),
    }));
  },

  addCategory: (data) => {
    const newCategory: Category = {
      ...data,
      id: `cat-${Date.now()}`,
    };
    set((state) => ({ categories: [...state.categories, newCategory] }));
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));
  },

  // Cart
  cart: [],
  cartDiscount: 0,

  addToCart: (product) => {
    set((state) => {
      const existingIndex = state.cart.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updatedCart = [...state.cart];
        updatedCart[existingIndex] = {
          ...updatedCart[existingIndex],
          quantity: updatedCart[existingIndex].quantity + 1,
        };
        return { cart: updatedCart };
      }
      return { cart: [...state.cart, { product, quantity: 1 }] };
    });
  },

  updateCartQuantity: (productId, delta) => {
    set((state) => {
      const updated = state.cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
      return { cart: updated };
    });
  },

  setCartQuantity: (productId, qty) => {
    set((state) => {
      if (qty <= 0) {
        return { cart: state.cart.filter((item) => item.product.id !== productId) };
      }
      return {
        cart: state.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity: qty } : item
        ),
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  setCartItemNotes: (productId, notes) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      ),
    }));
  },

  setCartDiscount: (amount) => set({ cartDiscount: amount }),

  clearCart: () => set({ cart: [], cartDiscount: 0 }),

  // Transactions
  transactions: generateInitialTransactions(),
  lastTransaction: null,

  completeTransaction: (paymentMethod, amountPaid) => {
    const { cart, cartDiscount, currentUser, products } = get();
    if (cart.length === 0) return null;

    const subtotal = cart.reduce(
      (sum, item) => sum + item.product.sell_price * item.quantity,
      0
    );
    const total = Math.max(0, subtotal - cartDiscount);
    const change = Math.max(0, amountPaid - total);

    const transactionItems = cart.map((item, idx) => ({
      id: `tx-item-${Date.now()}-${idx}`,
      transaction_id: "",
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.sell_price,
      subtotal: item.product.sell_price * item.quantity,
      notes: item.notes,
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      invoice_number: generateInvoiceNumber(),
      user_id: currentUser.id,
      cashier_name: currentUser.name,
      subtotal,
      discount: cartDiscount,
      tax: 0,
      total,
      amount_paid: amountPaid,
      change,
      payment_method: paymentMethod,
      items: transactionItems,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    // Update product stock
    const updatedProducts = products.map((prod) => {
      const soldItem = cart.find((item) => item.product.id === prod.id);
      if (soldItem) {
        return {
          ...prod,
          stock_qty: Math.max(0, prod.stock_qty - soldItem.quantity),
        };
      }
      return prod;
    });

    set((state) => ({
      transactions: [newTx, ...state.transactions],
      products: updatedProducts,
      lastTransaction: newTx,
      cart: [],
      cartDiscount: 0,
    }));

    return newTx;
  },

  // Settings
  settings: initialSettings,
  updateSettings: (updates) => {
    set((state) => ({ settings: { ...state.settings, ...updates } }));
  },
}));
