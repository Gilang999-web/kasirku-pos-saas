import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/**
 * Memeriksa apakah kredensial Supabase sudah terkonfigurasi di environment variable
 */
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseAnonKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  );
};

/**
 * Supabase Browser Client (singleton via @supabase/ssr).
 * Uses cookie-based session persistence for Supabase Auth.
 * Returns null if credentials are not configured in .env.local.
 */
export const supabase = isSupabaseConfigured()
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;
