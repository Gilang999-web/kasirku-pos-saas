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
import { supabase, isSupabaseConfigured } from "./supabase";

interface AppState {
  // Connection & Sync Status
  isCloudConnected: boolean;
  isLoading: boolean;
  initStore: () => Promise<void>;

  // Auth
  currentUser: User;
  setCurrentUser: (user: User) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addProduct: (data: Omit<Product, "id" | "store_id" | "created_at">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (data: Omit<Category, "id" | "store_id">) => void;
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
  // Connection status
  isCloudConnected: false,
  isLoading: false,

  // Auth
  currentUser: initialUsers[0], // default Admin fallback
  setCurrentUser: (user) => set({ currentUser: user }),

  // Products & Categories
  products: initialProducts,
  categories: initialCategories,

  // Initialize data from Supabase (or fallback to local mock data)
  initStore: async () => {
    if (!isSupabaseConfigured() || !supabase) {
      console.log("KasirKu: Supabase credentials not configured. Running in Local Mock mode.");
      return;
    }

    try {
      set({ isLoading: true });

      // Fetch authenticated user session
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Fetch profile row that matches the auth user's id
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .maybeSingle();

        let profileData = existingProfile;

        if (!profileData) {
          // Auto-create store and profile for new user
          const displayName =
            authUser.user_metadata?.name ||
            authUser.user_metadata?.full_name ||
            authUser.email?.split("@")[0] ||
            "User";

          const storeName = authUser.user_metadata?.store_name || `Toko ${displayName}`;

          const newStoreId = crypto.randomUUID();

          // 1. Create Store
          await supabase.from("stores").insert([{
            id: newStoreId,
            name: storeName
          }]);

          // 2. Create Profile
          const newProfile = {
            id: authUser.id,
            store_id: newStoreId,
            name: displayName,
            email: authUser.email!,
            role: "admin" as const,
            is_active: true,
            created_at: new Date().toISOString(),
          };

          await supabase.from("profiles").insert([newProfile]);

          // 3. Create Default Store Settings
          await supabase.from("store_settings").insert([{
            store_id: newStoreId,
            name: `Toko ${displayName}`,
            currency: "IDR",
            tax_percentage: 0
          }]);

          profileData = newProfile;
        }

        set({
          currentUser: {
            id: profileData.id,
            store_id: profileData.store_id,
            name: profileData.name,
            email: profileData.email,
            role: profileData.role as "admin" | "cashier",
            avatar: profileData.avatar || undefined,
            is_active: Boolean(profileData.is_active),
            created_at: profileData.created_at,
          },
        });
      }

      // RLS handles filtering by store_id securely based on get_auth_store_id()

      // 1. Fetch Categories
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      // 2. Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from("products")
        .select("*")
        .order("name");

      // 3. Fetch Transactions with nested items
      const { data: txData, error: txError } = await supabase
        .from("transactions")
        .select("*, items:transaction_items(*)")
        .order("created_at", { ascending: false });

      // 4. Fetch Store Settings (RLS guarantees it returns this store's settings)
      const { data: setData } = await supabase
        .from("store_settings")
        .select("*")
        .maybeSingle();

      if (catError || prodError) {
        console.warn("Supabase fetch warning, using local mock data:", catError || prodError);
        set({ isCloudConnected: false, isLoading: false });
        return;
      }

      // Transform products numeric fields to numbers
      const formattedProducts: Product[] = (prodData || []).map((p: any) => ({
        id: p.id,
        store_id: p.store_id,
        name: p.name,
        sku: p.sku,
        category_id: p.category_id,
        category_name: p.category_name,
        buy_price: Number(p.buy_price),
        sell_price: Number(p.sell_price),
        stock_qty: Number(p.stock_qty),
        min_stock: Number(p.min_stock),
        image_url: p.image_url || undefined,
        is_active: Boolean(p.is_active),
        created_at: p.created_at,
      }));

      // Transform categories
      const formattedCategories: Category[] = (catData || []).map((c: any) => ({
        id: c.id,
        store_id: c.store_id,
        name: c.name,
        slug: c.slug,
        description: c.description || "",
      }));

      // Transform transactions
      let formattedTransactions: Transaction[] = [];
      if (txData && txData.length > 0) {
        formattedTransactions = txData.map((tx: any) => ({
          id: tx.id,
          store_id: tx.store_id,
          invoice_number: tx.invoice_number,
          user_id: tx.user_id || "",
          cashier_name: tx.cashier_name,
          subtotal: Number(tx.subtotal),
          discount: Number(tx.discount),
          tax: Number(tx.tax),
          total: Number(tx.total),
          amount_paid: Number(tx.amount_paid),
          change: Number(tx.change),
          payment_method: tx.payment_method,
          status: tx.status,
          created_at: tx.created_at,
          items: (tx.items || []).map((item: any) => ({
            id: item.id,
            store_id: item.store_id,
            transaction_id: tx.id,
            product_id: item.product_id,
            product_name: item.product_name,
            quantity: Number(item.quantity),
            unit_price: Number(item.unit_price),
            subtotal: Number(item.subtotal),
            notes: item.notes || undefined,
          })),
        }));
      }

      // Update state with cloud data
      set({
        categories: formattedCategories,
        products: formattedProducts,
        transactions: formattedTransactions,
        settings: setData
          ? {
              id: setData.id,
              store_id: setData.store_id,
              name: setData.name,
              tagline: setData.tagline || "",
              address: setData.address || "",
              phone: setData.phone || "",
              email: setData.email || "",
              receipt_header: setData.receipt_header || "",
              receipt_footer: setData.receipt_footer || "",
              tax_percentage: Number(setData.tax_percentage) || 0,
              currency: setData.currency || "IDR",
            }
          : initialSettings,
        isCloudConnected: true,
        isLoading: false,
      });

      console.log("KasirKu: Connected to Supabase Cloud PostgreSQL successfully.");
    } catch (err) {
      console.error("KasirKu: Supabase initialization error:", err);
      set({ isCloudConnected: false, isLoading: false });
    }
  },

  // CRUD Products with Server API Sync
  addProduct: (data) => {
    const { currentUser } = get();
    const newProduct: Product = {
      ...data,
      id: crypto.randomUUID(), // Optimistic ID, API will return a real one
      store_id: currentUser.store_id,
      created_at: new Date().toISOString(),
    };

    // 1. Optimistic local update
    set((state) => ({ products: [newProduct, ...state.products] }));

    // 2. Cloud sync if connected
    if (isSupabaseConfigured()) {
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          console.error("Failed to sync new product to API:", result.error);
        } else {
          // Update the optimistic ID with the real ID from server
          set((state) => ({
            products: state.products.map(p => p.id === newProduct.id ? { ...p, id: result.id } : p)
          }));
        }
      })
      .catch((err) => console.error("API error:", err));
    }
  },

  updateProduct: (id, updates) => {
    // 1. Optimistic local update
    set((state) => ({
      products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));

    // 2. Cloud sync if connected
    if (isSupabaseConfigured()) {
      fetch(`/api/products?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) console.error("Failed to sync product update to API:", result.error);
      })
      .catch((err) => console.error("API error:", err));
    }
  },

  deleteProduct: (id) => {
    // 1. Optimistic local update
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      cart: state.cart.filter((item) => item.product.id !== id),
    }));

    // 2. Cloud sync if connected
    if (isSupabaseConfigured()) {
      fetch(`/api/products?id=${id}`, {
        method: "DELETE",
      })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) console.error("Failed to sync product deletion to API:", result.error);
      })
      .catch((err) => console.error("API error:", err));
    }
  },

  // CRUD Categories with Server API Sync
  addCategory: (data) => {
    const { currentUser } = get();
    const newCategory: Category = {
      ...data,
      id: crypto.randomUUID(), // Optimistic ID
      store_id: currentUser.store_id,
    };

    set((state) => ({ categories: [...state.categories, newCategory] }));

    if (isSupabaseConfigured()) {
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) {
          console.error("Failed to sync category to API:", result.error);
        } else {
          set((state) => ({
            categories: state.categories.map(c => c.id === newCategory.id ? { ...c, id: result.id } : c)
          }));
        }
      })
      .catch((err) => console.error("API error:", err));
    }
  },

  deleteCategory: (id) => {
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    }));

    if (isSupabaseConfigured()) {
      fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      })
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) console.error("Failed to sync category deletion to API:", result.error);
      })
      .catch((err) => console.error("API error:", err));
    }
  },

  // POS Cart Management (Instant Client-side)
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

  // Transactions with Supabase Cloud Sync
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
    
    const txId = crypto.randomUUID(); // Optimistic ID
    const invoiceNumber = generateInvoiceNumber(); // Optimistic Invoice

    // 1. Optimistic Local Update
    const transactionItems = cart.map((item) => ({
      id: crypto.randomUUID(),
      store_id: currentUser.store_id,
      transaction_id: txId,
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.sell_price,
      subtotal: item.product.sell_price * item.quantity,
      notes: item.notes,
    }));

    const newTx: Transaction = {
      id: txId,
      store_id: currentUser.store_id,
      invoice_number: invoiceNumber,
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

    // 2. Asynchronous Background Sync to API
    if (isSupabaseConfigured()) {
      const payload = {
        payment_method: paymentMethod,
        amount_paid: amountPaid,
        discount: cartDiscount,
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.product.sell_price,
          subtotal: item.product.sell_price * item.quantity,
          notes: item.notes,
        }))
      };

      fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(res => res.json())
      .then(result => {
        if (!result.success) {
          console.error("Failed to process transaction via API:", result.error);
          alert("Gagal memproses transaksi: " + (result.error || "Terjadi kesalahan server"));
        } else {
          // Update the optimistic transaction with real IDs from server
          set((state) => ({
            transactions: state.transactions.map(tx => 
              tx.id === newTx.id 
                ? { ...tx, id: result.id, invoice_number: result.invoice_number } 
                : tx
            ),
            lastTransaction: state.lastTransaction?.id === newTx.id 
              ? { ...state.lastTransaction, id: result.id, invoice_number: result.invoice_number }
              : state.lastTransaction
          }));
        }
      })
      .catch(err => {
        console.error("Transaction API error:", err);
        alert("Terjadi kesalahan jaringan saat memproses transaksi.");
      });
    }

    return newTx;
  },

  // Settings
  settings: initialSettings,
  updateSettings: (updates) => {
    const { currentUser } = get();
    set((state) => ({ settings: { ...state.settings, ...updates } }));

    if (isSupabaseConfigured() && supabase) {
      supabase
        .from("store_settings")
        .update(updates)
        .eq("store_id", currentUser.store_id)
        .then(({ error }) => {
          if (error) console.error("Failed to sync settings to Supabase:", error);
        });
    }
  },
}));
