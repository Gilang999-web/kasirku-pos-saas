import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations";
import { generateInvoiceNumber } from "@/lib/utils";
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
      .select("store_id, name")
      .eq("id", user.id)
      .single();

    if (!profile?.store_id) {
      return NextResponse.json({ error: "Store not found" }, { status: 403 });
    }

    // Parse & Validate Input
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    const txId = crypto.randomUUID();
    const invoiceNumber = generateInvoiceNumber();
    const createdAt = new Date().toISOString();

    // 1. Calculate totals to ensure integrity (server-side validation)
    const calculatedSubtotal = validatedData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const calculatedTotal = Math.max(0, calculatedSubtotal - validatedData.discount);
    const calculatedChange = Math.max(0, validatedData.amount_paid - calculatedTotal);

    // 2. Perform atomic stock decrements via RPC
    for (const item of validatedData.items) {
      const { data: success, error: rpcError } = await supabase
        .rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_qty: item.quantity,
          p_store_id: profile.store_id
        });

      if (rpcError) throw rpcError;
      if (!success) {
        return NextResponse.json(
          { error: `Stok tidak cukup untuk produk: ${item.product_name}` },
          { status: 400 }
        );
      }
    }

    // 3. Insert Transaction Header
    const { error: txError } = await supabase.from("transactions").insert([{
      id: txId,
      store_id: profile.store_id,
      invoice_number: invoiceNumber,
      user_id: user.id,
      cashier_name: profile.name,
      subtotal: calculatedSubtotal,
      discount: validatedData.discount,
      tax: 0,
      total: calculatedTotal,
      amount_paid: validatedData.amount_paid,
      change: calculatedChange,
      payment_method: validatedData.payment_method,
      status: "completed",
      created_at: createdAt,
    }]);

    if (txError) throw txError;

    // 4. Insert Transaction Items
    const transactionItems = validatedData.items.map((item) => ({
      id: crypto.randomUUID(),
      store_id: profile.store_id,
      transaction_id: txId,
      product_id: item.product_id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      notes: item.notes || null,
      created_at: createdAt,
    }));

    const { error: itemError } = await supabase.from("transaction_items").insert(transactionItems);
    if (itemError) throw itemError;

    // 5. Record Stock Movements
    const stockMovements = validatedData.items.map((item) => ({
      id: crypto.randomUUID(),
      store_id: profile.store_id,
      product_id: item.product_id,
      product_name: item.product_name,
      user_id: user.id,
      user_name: profile.name,
      type: "out",
      quantity: item.quantity,
      notes: `Penjualan POS Nota #${invoiceNumber}`,
      created_at: createdAt,
    }));

    const { error: moveError } = await supabase.from("stock_movements").insert(stockMovements);
    if (moveError) throw moveError;

    return NextResponse.json({ 
      success: true, 
      id: txId, 
      invoice_number: invoiceNumber,
      change: calculatedChange
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Transaction Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
