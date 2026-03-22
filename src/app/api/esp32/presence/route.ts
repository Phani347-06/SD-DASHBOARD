import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { device_id, roll_no, session_id, is_present } = body;

    // Validate incoming payload from ESP32
    if (!device_id || !roll_no || !session_id) {
      return NextResponse.json(
        { error: 'Missing required physical presence parameters' },
        { status: 400 }
      );
    }

    if (!is_present) {
      return NextResponse.json(
        { message: 'Presence not detected, ignoring update' },
        { status: 200 }
      );
    }

    // 1. Verify that the session is still active
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('status')
      .eq('session_id', session_id)
      .single();

    if (sessionError || !sessionData) {
        return NextResponse.json({ error: 'Session not found or invalid' }, { status: 404 });
    }

    if (sessionData.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Lab session is closed' }, { status: 403 });
    }

    // 2. Update the student's attendance to 'Present' in the database
    // This assumes they have already passed the Challenge-Response hash digitally via the app
    const { data, error } = await supabase
      .from('attendance')
      .update({ status: 'PRESENT', end_scan: new Date().toISOString() })
      .match({ roll_no: roll_no, session_id: session_id });

    if (error) {
      console.error("Supabase Error updating attendance:", error);
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Attendance marked PRESENT for student ${roll_no}`,
      device: device_id
    });

  } catch (error) {
    console.error("API Error processing ESP32 presence:", error);
    return NextResponse.json({ error: 'Internal Server Error processing payload' }, { status: 500 });
  }
}
