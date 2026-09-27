import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit-log";

/**
 * POST /api/auth/audit
 * Called from the client after a successful login or logout to record the event.
 * Body: { action: "login" | "logout" }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action;

    if (action !== "login" && action !== "logout") {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    writeAuditLog({
      action: action as "login" | "logout",
      entityType: "auth",
      details: {
        email: user.email,
        method: action === "login" ? "password" : undefined,
      },
      ipAddress: ip || undefined,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
