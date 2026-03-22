import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * 🛰️ Institutional Attendance Submission Matrix
 * Performs the high-integrity handshake between the session node and the laboratory QR.
 */
export async function POST(req: Request) {
  try {
    const { temp_session_id, class_session_id, verification_code, fingerprint_hash } = await req.json();

    // 1. Session Integrity Node Check
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*, students(*)')
      .eq('temp_session_id', temp_session_id)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session invalid or expired' }, { status: 401 });
    }

    // 2. Device Fingerprint Binding Validation
    if (session.fingerprint_hash !== fingerprint_hash) {
      // Security Breach: Invalidate session immediately
      await supabase.from('sessions').update({ is_active: false }).eq('temp_session_id', temp_session_id);
      return NextResponse.json({ error: 'Device mismatch — session terminated' }, { status: 401 });
    }

    // 3. Expiration Pulse
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('sessions').update({ is_active: false }).eq('temp_session_id', temp_session_id);
      return NextResponse.json({ error: 'Session expired — please login again' }, { status: 401 });
    }

    // 4. Laboratory QR Verification (Dual Layer)
    const { data: qrSession, error: qrError } = await supabase
      .from('temp_qr_sessions')
      .select('*, class_sessions(*)')
      .eq('class_session_id', class_session_id)
      .eq('verification_code', verification_code)
      .eq('is_active', true)
      .single();

    if (qrError || !qrSession) {
      return NextResponse.json({ error: 'Laboratory QR Signature Mismatch' }, { status: 400 });
    }

    // 5. Duplicate Submission Prevention
    if (session.attendance_submitted) {
      return NextResponse.json({ error: 'Attendance already Manifested for this session node.' }, { status: 400 });
    }

    // 6. Manifest Attendance Log
    const { error: logError } = await supabase
      .from('attendance_logs')
      .insert({
        class_session_id,
        temp_session_id: qrSession.temp_session_id, // Link to the specific QR window
        student_id: session.student_id,
        device_fingerprint_match: true,
        stage_1_passed: true,
        final_status: 'VERIFIED'
      });

    if (logError) throw logError;

    // 7. Update Session State
    await supabase.from('sessions').update({ attendance_submitted: true }).eq('temp_session_id', temp_session_id);

    // 8. Institutional Receipt Dispatch (Resend Node)
    try {
      const { resend } = await import('@/lib/resend');
      const student = session.students;
      
      await resend.emails.send({
        from: 'Lab Intel <onboarding@resend.dev>', // ⚠️ ACTION: Change to [name]@[your-domain] once verified
        to: [`${student.roll_no}@vnrvjiet.in`],
        subject: `✅ Attendance Verified: ${qrSession.class_sessions.course_code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #334155;">
            <h1 style="color: #0052a5; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px;">Laboratory Presence Confirmed</h1>
            <p>Hello <strong>${student.full_name}</strong>,</p>
            <p>Your institutional presence has been cryptographically validated for the following session:</p>
            
            <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold; color: #64748b; letter-spacing: 0.05em;">Session Node</p>
              <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 800; color: #0052a5;">${qrSession.class_sessions.course_code}</p>
              
              <p style="margin: 0; font-size: 14px; text-transform: uppercase; font-weight: bold; color: #64748b; letter-spacing: 0.05em;">Timestamp</p>
              <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600;">${new Date().toLocaleString()}</p>
            </div>

            <p style="font-size: 11px; color: #94a3b8;">
              Signature Node: ${temp_session_id.substring(0,12)}... Verified via Institutional Zero-Trust Engine.
            </p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Receipt Dispatch Failure:", e);
    }

    return NextResponse.json({ success: true, message: 'Institutional Attendance Manifested' });

  } catch (err: any) {
    console.error('Attendance Matrix Protocol Error:', err);
    return NextResponse.json({ error: 'Protocol Failure: System integrity compromised.' }, { status: 500 });
  }
}
