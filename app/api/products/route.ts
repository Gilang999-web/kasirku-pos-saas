import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { productSchema } from "@/lib/validations";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get store_id for the user
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
    const validatedData = productSchema.parse(body);

    const productId = crypto.randomUUID();
    
    const insertData = {
      ...validatedData,
      id: productId,
      store_id: profile.store_id,
      category_id: validatedData.category_id || null, // Convert "" to null
      category_name: validatedData.category_name || null, // Convert "" to null
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from("products").insert([insertData]);

    if (error) throw error;

    return NextResponse.json({ success: true, id: productId });
  } catch (error) {
    console.error("API Error [POST /api/products]:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const body = await request.json();
    // Use partial schema for updates
    const validatedData = productSchema.partial().parse(body);

    const { error } = await supabase
      .from("products")
      .update(validatedData)
      .eq("id", id);
      // RLS handles store_id isolation automatically

    if (error) throw error;

    return NextResponse.json({ success: true });
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
    if (!id) return NextResponse.json({ error: "Missing product ID" }, { status: 400 });

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);
      // RLS handles store_id isolation automatically

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
