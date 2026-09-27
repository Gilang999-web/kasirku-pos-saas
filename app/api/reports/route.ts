import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

    const storeId = profile.store_id;

    // We can fetch all products to get buy_price for cost calculation
    const { data: productsData, error: prodError } = await supabase
      .from("products")
      .select("id, name, buy_price, category_name")
      .eq("store_id", storeId);

    if (prodError) throw prodError;

    const productsMap = new Map();
    productsData?.forEach(p => {
      productsMap.set(p.id, p);
    });

    // Fetch transactions with items.
    // For performance, we might want to filter by date in the future.
    // For now, we mimic the existing logic which aggregates all transactions.
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select("*, items:transaction_items(*)")
      .eq("store_id", storeId)
      .eq("status", "completed");

    if (txError) throw txError;

    let totalRevenue = 0;
    let totalCost = 0;
    const productStats: Record<string, any> = {};

    // Chart trend by day (last 7 days)
    const trendMap: Record<string, { date: string; omzet: number; profit: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" });
      trendMap[key] = { date: label, omzet: 0, profit: 0 };
    }

    txData?.forEach((tx: any) => {
      const txTotal = Number(tx.total) || 0;
      totalRevenue += txTotal;
      
      const txDateStr = tx.created_at.slice(0, 10);
      let txCost = 0;

      (tx.items || []).forEach((item: any) => {
        const prod = productsMap.get(item.product_id);
        const buyPrice = prod ? Number(prod.buy_price) : (Number(item.unit_price) * 0.5);
        const qty = Number(item.quantity) || 0;
        const subtotal = Number(item.subtotal) || 0;
        
        const lineCost = buyPrice * qty;
        const lineProfit = subtotal - lineCost;

        totalCost += lineCost;
        txCost += lineCost;

        if (!productStats[item.product_id]) {
          productStats[item.product_id] = {
            name: item.product_name,
            category: prod?.category_name || "Menu",
            qty: 0,
            revenue: 0,
            cost: 0,
            profit: 0,
          };
        }

        productStats[item.product_id].qty += qty;
        productStats[item.product_id].revenue += subtotal;
        productStats[item.product_id].cost += lineCost;
        productStats[item.product_id].profit += lineProfit;
      });

      // Update trend
      if (trendMap[txDateStr]) {
        trendMap[txDateStr].omzet += txTotal;
        trendMap[txDateStr].profit += (txTotal - txCost); // actual profit for that day
      }
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0";

    const chartTrend = Object.values(trendMap);
    const sortedProducts = Object.values(productStats).sort((a: any, b: any) => b.revenue - a.revenue);

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalCost,
        grossProfit,
        profitMargin,
        chartTrend,
        sortedProducts,
      }
    });
  } catch (error: any) {
    console.error("API /reports error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
