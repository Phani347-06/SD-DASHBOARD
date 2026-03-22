import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * ESP32 Hardware Scan Endpoint
 * Triggered when an RFID item passes through the lab portal.
 */
export async function POST(request: Request) {
  try {
    const supabase = supabaseAdmin;
    if (!supabase) {
       console.error("Institutional Admin Node Offline: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local");
       return NextResponse.json({ error: 'Institutional Admin Node Offline' }, { status: 500 });
    }

    const body = await request.json();
    const { tag_id, student_roll_no, direction } = body;

    if (!tag_id) {
      return NextResponse.json({ error: 'Missing RFID Tag ID' }, { status: 400 });
    }

    // 1. Resolve Inventory Item
    const { data: item, error: itemError } = await supabase
      .from('inventory')
      .select('id, status, student_id')
      .eq('tag_id', tag_id)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Unit not recognized in institutional matrix' }, { status: 404 });
    }

    // 2. Resolve Student if provided (Roll Number lookup)
    let studentId = null;
    let studentName = "System Node";
    if (student_roll_no) {
      const { data: student } = await supabase
        .from('students')
        .select('id, full_name')
        .eq('roll_no', student_roll_no)
        .single();
      
      if (student) {
        studentId = student.id;
        studentName = student.full_name;
      }
    }

    // 3. Determine New Status & Type
    // If direction is provided (IN/OUT), use it. Otherwise toggle.
    let newStatus: 'IN LAB' | 'USING' = 'IN LAB';
    let eventType: 'checkout' | 'return' = 'return';

    if (direction) {
      if (direction === 'OUT') {
        newStatus = 'USING';
        eventType = 'checkout';
      } else {
        newStatus = 'IN LAB';
        eventType = 'return';
      }
    } else {
      // Toggle Logic
      newStatus = item.status === 'IN LAB' ? 'USING' : 'IN LAB';
      eventType = newStatus === 'USING' ? 'checkout' : 'return';
    }

    // 4. Update Inventory Matrix
    const { error: updateError } = await supabase
      .from('inventory')
      .update({
        status: newStatus,
        student_id: newStatus === 'USING' ? (studentId || item.student_id) : null,
        last_seen: new Date().toISOString(),
        overdue: false, // Reset threshold flag on any scan
        updated_at: new Date().toISOString()
      })
      .eq('id', item.id);

    if (updateError) throw updateError;

    // 5. Log RFID Event
    await supabase.from('rfid_events').insert({
      item_id: item.id,
      type: eventType,
      details: eventType === 'checkout' 
        ? `Asset anchored to ${studentName} via Node Scan.` 
        : `Asset verified at Central Lab Gateway.`
    });

    return NextResponse.json({
      success: true,
      unit_id: item.id,
      new_status: newStatus,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("RFID Matrix Scan Error:", error);
    return NextResponse.json({ error: 'Internal Matrix Sync Failure' }, { status: 500 });
  }
}
