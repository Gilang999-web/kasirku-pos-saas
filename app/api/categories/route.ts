import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("store_id")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) {
      return NextResponse.json({ error: "Store not found" }, { status: 403 });
    }

    // Parse & Validate Input
    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    const categoryId = crypto.randomUUID();
    
    const { error } = await supabase.from("categories").insert([{
      ...validatedData,
      id: categoryId,
      store_id: profile.store_id,
    }]);

    if (error) throw error;

    return NextResponse.json({ success: true, id: categoryId });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing category ID" }, { status: 400 });

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
