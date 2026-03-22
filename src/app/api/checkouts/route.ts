import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /checkouts (Fetch All Active or Filter by Student)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    let query = supabase.from('inventory_checkouts').select('*, inventory(name, tag_id), students(full_name, roll_no)');

    if (studentId) query = query.eq('student_id', studentId);

    const { data, error } = await query.order('checked_out_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET /checkouts API Error:", err);
    return NextResponse.json({ error: 'Failed to fetch institutional checkouts' }, { status: 500 });
  }
}

// POST /checkouts (Manually Create Checkout)
export async function POST(request: Request) {
  try {
    const { item_id, student_id, due_at } = await request.json();

    if (!item_id || !student_id) {
       return NextResponse.json({ error: 'Missing Required Asset or Roster ID' }, { status: 400 });
    }

    // 1. Verify availability
    const { data: item } = await supabase.from('inventory').select('status').eq('id', item_id).single();
    if (item?.status !== 'IN LAB') {
       return NextResponse.json({ error: 'Asset currently unavailable (Conflict Detected)' }, { status: 409 });
    }

    // 2. Insert Checkout
    const { data: checkout, error: checkoutError } = await supabase
      .from('inventory_checkouts')
      .insert({
        item_id,
        student_id,
        due_at: due_at || new Date(Date.now() + 21600000).toISOString(), // Default 6 hours
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (checkoutError) throw checkoutError;

    // 3. Update Inventory Status
    await supabase.from('inventory').update({
       status: 'USING',
       student_id,
       last_seen: new Date().toISOString()
    }).eq('id', item_id);

    return NextResponse.json({ success: true, checkout });

  } catch (err) {
    console.error("POST /checkouts API Error:", err);
    return NextResponse.json({ error: 'Internal Checkout Synchronization Failure' }, { status: 500 });
  }
}
