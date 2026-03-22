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

  const setSession = (id: string, hash: string) => {
    setTempSessionId(id);
    setFingerprintHash(hash);
  };

  const clearSession = () => {
    setTempSessionId(null);
    setFingerprintHash(null);
  };

  /**
   * 🛡️ Silent Re-Manifestation Protocol
   * On refresh, re-authenticates and generates a new session node if token exists.
   */
  useEffect(() => {
    const reinitSecurity = async () => {
      setIsVerifying(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
         // Auto-generate session node on refresh
         try {
            const fingerprint = generateInstitutionalFingerprint();
            const hash = await hashFingerprint(fingerprint);
            
            // Generate temp_session_id via Vanguard protocol (handles unsafe origins)
            const temp_id = generateVanguardUUID();
            
            // Registry Manifestation (Service Role Admin Proxy)
            const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            
            // Invalidate legacy sessions
            await supabase.from('sessions').update({ is_active: false }).eq('student_id', session.user.id).eq('is_active', true);
            
            // Manifest new session
            const { error } = await supabase.from('sessions').insert({
              temp_session_id: temp_id,
              student_id: session.user.id,
              fingerprint_hash: hash,
              expires_at,
              is_active: true
            });

            if (!error) {
               setSession(temp_id, hash);
            }
         } catch (err) {
            console.error("Security Re-Manifestation Failure:", err);
         }
      }
      setIsVerifying(false);
    };

    reinitSecurity();
  }, []);

  return (
    <SecurityContext.Provider value={{ tempSessionId, fingerprintHash, setSession, clearSession, isVerifying }}>
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
