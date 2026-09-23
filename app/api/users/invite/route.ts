import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth Check (Verifying if the requester is authenticated)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify requester is an admin and get their store_id
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("store_id, role")
      .eq("id", user.id)
      .single();

    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Hanya admin yang bisa mengundang kasir" }, { status: 403 });
    }

    // Parse Input
    const body = await request.json();
    const { email, name } = inviteSchema.parse(body);

    // Initialize Admin Client with SERVICE ROLE KEY
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Invite the user via Supabase Auth Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name: name,
        role: "cashier",
        store_id: adminProfile.store_id
      },
      redirectTo: `${new URL(request.url).origin}/reset-password`
    });

    if (inviteError) throw inviteError;

    const newUserId = inviteData.user.id;

    // Create the profile record explicitly for the cashier
    const { error: profileError } = await supabaseAdmin.from("profiles").insert([{
      id: newUserId,
      store_id: adminProfile.store_id,
      name: name,
      email: email,
      role: "cashier",
      is_active: true,
      created_at: new Date().toISOString()
    }]);

    if (profileError) {
      console.error("Failed to create profile for invited user", profileError);
    }

    return NextResponse.json({ success: true, message: "Kasir berhasil diundang!" });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Data tidak valid", details: error.errors }, { status: 400 });
    }
    console.error("Invite API Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}
