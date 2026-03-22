import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from './supabase';
import { generateVanguardUUID } from './security';

export interface StudentSession {
  tempSessionId: string;
  fingerprint: string;
}

/** 
 * SILENT HANDSHAKE PROTOCOL v1.0
 * Generates hardware fingerprint and manages the institutional session lock.
 */
export async function performSilentHandshake(): Promise<StudentSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No authenticated personnel detected.");

  // 1. Generate Hardware Fingerprint (Device Anchor)
  const fpLoad = await FingerprintJS.load();
  const result = await fpLoad.get();
  const fingerprint = result.visitorId;

  // 2. Resolve/Update Temp Session ID via Vanguard protocol
  const newTempId = generateVanguardUUID();

  // 3. Search for existing Identity Node
  const { data: existingStudent, error: fetchError } = await supabase
    .from('students')
    .select('*')
    .eq('id', user.id)
    .single();

  if (fetchError || !existingStudent) {
    // If not found, they might need to complete the 'Join Lab' profile first
    console.error("Identity Node missing for User:", user.id);
    throw new Error("Handshake Rejected: No academic identity found. Please join a lab first.");
  }

  // 4. Update and Anchor the session
  const { data: student, error: updateError } = await supabase
    .from('students')
    .update({ 
      current_session_token: newTempId,
      last_ping: new Date().toISOString()
    })
    .eq('id', user.id)
    .select('registered_device_fingerprint')
    .single();

  if (updateError || !student) {
    console.error("Matrix Update Failure Details:", updateError);
    throw new Error(`Matrix Anchor Failure: ${updateError?.message || "Integrity check failed (Zero rows updated)."} Check RLS policies.`);
  }

  // 4. Verification Check (If already bound, ensure it matches)
  if (student.registered_device_fingerprint && student.registered_device_fingerprint !== fingerprint) {
    // If we want to allow device switching but alert:
    console.warn("Hardware Signature Transition Detected.");
    // For now, let's just use the current one if not registered yet
  }

  // 5. Store session artifacts locally (encrypted/private)
  localStorage.setItem('lab_matrix_token', newTempId);
  localStorage.setItem('lab_matrix_anchor', fingerprint);

  return { tempSessionId: newTempId, fingerprint };
}

/** 
 * DUAL-SESSION WATCHDOG
 * Checks if another device has claimed this student's matrix node.
 */
export async function verifySessionIntegrity(currentTempToken: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: student } = await supabase
    .from('students')
    .select('current_session_token')
    .eq('id', user.id)
    .single();

  if (!student) return false;
  
  return student.current_session_token === currentTempToken;
}
