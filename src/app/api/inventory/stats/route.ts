import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /inventory/stats (Dashboard load)
export async function GET() {
  try {
    // 1. Fetch All Inventory
    const { data: items, error } = await supabase.from('inventory').select('status, created_at');

    if (error) throw error;

    const total_items = items.length;
    const checked_out = items.filter(i => i.status === 'USING').length;
    const missing = items.filter(i => i.status === 'MISSING').length;

    // 2. Overdue logic - Fetch active checkouts
    const { data: checkouts } = await supabase
      .from('inventory_checkouts')
      .select('item_id')
      .eq('status', 'ACTIVE')
      .lt('due_at', new Date().toISOString());

    const overdue = checkouts ? checkouts.length : 0;

    // 3. Added this month
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const added_this_month = items.filter(i => i.created_at >= startOfMonth).length;

    // 4. Operational intelligence %
    const operational_percentage = total_items > 0 ? (((total_items - missing) / total_items) * 100).toFixed(1) : "0.0";

    return NextResponse.json({
      total_items,
      checked_out,
      missing,
      overdue,
      added_this_month,
      operational_percentage: parseFloat(operational_percentage)
    });

  } catch (err) {
    console.error("GET /inventory/stats API Error:", err);
    return NextResponse.json({ error: 'Institutional Metrics Query Failure' }, { status: 500 });
  }
}
