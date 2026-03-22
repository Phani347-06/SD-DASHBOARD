import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * RFID Hardware Node Gateway
 * { tag_id, direction, timestamp, student_roll_no }
 */
export async function POST(request: Request) {
  try {
    const { tag_id, direction, student_roll_no } = await request.json();

    if (!tag_id) return NextResponse.json({ error: 'Missing Tag Identity' }, { status: 400 });

    // 1. Resolve Inventory Asset
    const { data: item, error: itemError } = await supabase
      .from('inventory')
      .select('id, status, student_id')
      .eq('tag_id', tag_id)
      .single();

    if (itemError || !item) return NextResponse.json({ error: 'Unrecognized Node Segment' }, { status: 404 });

    const newStatus = direction === 'OUT' ? 'USING' : 'IN LAB';
    const eventType = direction === 'OUT' ? 'checkout' : 'return';

    // 2. Resolve Student ID if roll_no provided
    let studentId = item.student_id;
    if (student_roll_no) {
      const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('roll_no', student_roll_no)
        .single();
      if (student) studentId = student.id;
    }

    // 3. Status Transition Logic
    if (direction === 'OUT') {
      // Create active checkout record
      await supabase.from('inventory_checkouts').insert({
        item_id: item.id,
        student_id: studentId,
        due_at: new Date(Date.now() + 21600000).toISOString(), // +6 Hours (Lab Session Period)
        status: 'ACTIVE'
      });

      await supabase.from('inventory').update({
        status: 'USING',
        student_id: studentId,
        last_seen: new Date().toISOString()
      }).eq('id', item.id);

    } else if (direction === 'IN') {
      // Close active checkouts for this item
      await supabase.from('inventory_checkouts').update({
        status: 'CLOSED',
        returned_at: new Date().toISOString()
      }).eq('item_id', item.id).eq('status', 'ACTIVE');

      await supabase.from('inventory').update({
        status: 'IN LAB',
        student_id: null,
        last_seen: new Date().toISOString()
      }).eq('id', item.id);
    }

    // 4. Record RFID Audit Event
    const { data: ev, error: evError } = await supabase.from('rfid_events').insert({
      item_id: item.id,
      type: eventType,
      details: direction === 'OUT' ? 'Node Scan Exit (Checkout Triggered)' : 'Node Scan Entry (Asset Recovered)'
    }).select().single();

    if (evError) throw evError;

    return NextResponse.json({ success: true, new_status: newStatus, event: ev });

  } catch (err) {
    console.error("RFID Gateway API Error:", err);
    return NextResponse.json({ error: 'Matrix Event Synchronization Failure' }, { status: 500 });
  }
}

// GET /rfid/events (Fetch Activity Stream)
export async function GET() {
  try {
     const { data, error } = await supabase
       .from('rfid_events')
       .select('*, inventory(name)')
       .order('timestamp', { ascending: false })
       .limit(20);
     
     if (error) throw error;
     return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to query institutional audit logs' }, { status: 500 });
  }
}
