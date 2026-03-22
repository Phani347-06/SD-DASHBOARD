import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET /alerts (Fetch All Unresolved or Filter by Status)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'UNRESOLVED';

    const { data, error } = await supabase
      .from('inventory_alerts')
      .select('*, inventory(name, tag_id)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /alerts API Error:", err);
    return NextResponse.json({ error: 'Alert Cluster Query Failure' }, { status: 500 });
  }
}
