import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuditAction =
  | "login"
  | "logout"
  | "register"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "category.create"
  | "category.delete"
  | "transaction.create"
  | "settings.update"
  | "user.invite"
  | "password.reset";

export type AuditEntityType =
  | "auth"
  | "product"
  | "category"
  | "transaction"
  | "settings"
  | "user";

interface AuditLogEntry {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Writes an audit log entry to the audit_logs table.
 * Fire-and-forget: errors are logged but don't block the caller.
 */
export async function writeAuditLog(entry: AuditLogEntry) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id, email")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) return;

    await supabase.from("audit_logs").insert({
      store_id: profile.store_id,
      user_id: user.id,
      user_email: profile.email || user.email,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || null,
      details: entry.details || null,
      ip_address: entry.ipAddress || null,
    });
  } catch (err) {
    console.error("Audit log write failed (non-blocking):", err);
  }
}
