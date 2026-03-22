"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateInstitutionalFingerprint, hashFingerprint, generateVanguardUUID } from '@/lib/security';
import { supabase } from '@/lib/supabase';

interface SecurityContextType {
  tempSessionId: string | null;
  fingerprintHash: string | null;
  setSession: (id: string, hash: string) => void;
  clearSession: () => void;
  isVerifying: boolean;
  hardwareMismatch: boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

/**
 * 🛰️ Institutional Security Provider
 * Manages the memory-only session nodes for the Silent Background Security layer.
 */
export function SecurityProvider({ children }: { children: React.ReactNode }) {
  // Memory-only storage (not in localStorage/sessionStorage)
  const [tempSessionId, setTempSessionId] = useState<string | null>(null);
  const [fingerprintHash, setFingerprintHash] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hardwareMismatch, setHardwareMismatch] = useState(false);

  const setSession = (id: string, hash: string) => {
    setTempSessionId(id);
    setFingerprintHash(hash);
  };

  const clearSession = () => {
    setTempSessionId(null);
    setFingerprintHash(null);
  };

  /**
   * 🛡️ Permanent Institutional Device Anchor Protocol
   * On refresh, re-authenticates and verifies hardware signature binding.
   */
  useEffect(() => {
    const reinitSecurity = async () => {
      setIsVerifying(true);
      setHardwareMismatch(false);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
         try {
            // 1. Generate Hardware Fingerprint (Physical DNA)
            const fingerprintData = generateInstitutionalFingerprint();
            const currentHash = await hashFingerprint(fingerprintData);
            
            // 2. Resolve Academic Identity and Hardware Lock
            const { data: student, error: sError } = await supabase
              .from('students')
              .select('registered_device_fingerprint')
              .eq('id', session.user.id)
              .single();

            if (sError || !student) {
              console.error("No student identity found.");
              setIsVerifying(false);
              return;
            }

            // 3. Hardware Anchor Check (Protocol IPAS v1.0)
            if (!student.registered_device_fingerprint) {
              // First Handshake: Bind this hardware forever
              await supabase
                .from('students')
                .update({ registered_device_fingerprint: currentHash })
                .eq('id', session.user.id);
            } else if (student.registered_device_fingerprint !== currentHash) {
              // Security Violation: Hardware signature mismatch
              setHardwareMismatch(true);
              setIsVerifying(false);
              return;
            }
            
            // 4. Manifest Session Node
            const temp_id = generateVanguardUUID();
            const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            
            // Invalidate legacy nodes
            await supabase.from('sessions').update({ is_active: false }).eq('student_id', session.user.id).eq('is_active', true);
            
            // Register new session node
            const { error } = await supabase.from('sessions').insert({
              temp_session_id: temp_id,
              student_id: session.user.id,
              fingerprint_hash: currentHash,
              expires_at,
              is_active: true
            });

            if (!error) {
               setSession(temp_id, currentHash);
            }
         } catch (err) {
            console.error("Identity Manifestation Failure:", err);
         }
      }
      setIsVerifying(false);
    };

    reinitSecurity();
  }, []);

  return (
    <SecurityContext.Provider value={{ tempSessionId, fingerprintHash, setSession, clearSession, isVerifying, hardwareMismatch }}>
      {children}
    </SecurityContext.Provider>
  );
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}
