import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 1. GET /inventory (Fetch All with Search & Filter)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');

    let query = supabase.from('inventory').select('*, students(full_name, roll_no)');

    // FILTERS
    if (status) query = query.eq('status', status.toUpperCase());
    if (category) query = query.ilike('category', `%${category}%`);
    if (search) query = query.or(`name.ilike.%${search}%,tag_id.ilike.%${search}%`);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /inventory API Error:", err);
    return NextResponse.json({ error: 'Failed to fetch inventory matrix' }, { status: 500 });
  }
}

// 2. POST /inventory (Add New Item)
export async function POST(request: Request) {
  try {
    const item = await request.json();
    const { name, tag_id, category, lab_id } = item;

    if (!name || !tag_id) {
      return NextResponse.json({ error: 'Name and Tag ID are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        name,
        tag_id,
        category: category || 'General',
        lab_id,
        status: 'IN LAB',
        last_seen: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, item: data });
  } catch (err) {
    console.error("POST /inventory API Error:", err);
    return NextResponse.json({ error: 'Failed to provision institutional unit' }, { status: 500 });
  }
}
