"use client";
import { useEffect, useState, useRef } from 'react';
import { ScanLine, ShieldCheck, ArrowLeft, Loader2, CircleCheckBig, CircleX } from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useSecurity } from '@/context/SecurityContext';

export default function StudentScanPage() {
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { tempSessionId, fingerprintHash, clearSession } = useSecurity();

  useEffect(() => {
    // 1. Check if student is authenticated via Supabase
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
      }
    };
    checkAuth();
    
    // Check for Secure Session Integrity
    if (!tempSessionId || !fingerprintHash) {
       setStatus('ERROR');
       setErrorMessage("No active security handshake detected. Please login again to re-manifest your identity.");
       return;
    }

    // 2. Initialize Scanner
    const scanner = new Html5QrcodeScanner('reader', { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true
    }, false);

    scanner.render(onScanSuccess, onScanError);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear error:", err));
      }
    };
  }, []);

  async function onScanSuccess(decodedText: string) {
    if (status !== 'IDLE' && status !== 'SCANNING') return;
    
    setStatus('VERIFYING');
    try {
      // a. Stop the scanner once we got a result
      if (scannerRef.current) {
         await scannerRef.current.pause(true);
      }

      // b. Parse QR Data
      const qrData = JSON.parse(decodedText);
      const { sId, tId, v } = qrData;

      if (!sId || !v) throw new Error("Invalid Laboratory QR Structure.");

      // c. Trigger Attendance Matrix Pulse
      const attendanceRequest = await fetch('/api/attendance/submit', {
         method: 'POST',
         headers: { 
            'Content-Type': 'application/json',
            'x-session-id': tempSessionId || '',
            'x-fingerprint': fingerprintHash || ''
         },
         body: JSON.stringify({
            temp_session_id: tempSessionId,
            class_session_id: sId,
            verification_code: v,
            fingerprint_hash: fingerprintHash
         })
      });

      const response = await attendanceRequest.json();

      if (!attendanceRequest.ok) {
         // Security Alert: Terminated Session?
         if (response.error?.includes("Device mismatch")) {
            clearSession();
            await supabase.auth.signOut();
            setErrorMessage("SECURITY ALERT: This session was accessed from an unrecognized device.");
         }
         throw new Error(response.error || "Attendance validation failed.");
      }

      setStatus('SUCCESS');
      
      // Auto-redirect back to dashboard after 3 seconds
      setTimeout(() => {
         router.push('/student');
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      setErrorMessage(err.message || "Institutional Proxy Failure: Signature Rejected.");
      
      // Restart scanner for retry after 5 seconds if not a critical security alert
      if (!err.message?.includes("SECURITY ALERT")) {
         setTimeout(() => {
            if (scannerRef.current) {
               scannerRef.current.resume();
               setStatus('IDLE');
            }
         }, 5000);
      }
    }
  }

  function onScanError(err: any) {
    // Normal noise - don't show to user unless critical
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 relative">
      <Link href="/student" className="absolute top-6 left-6 text-white/50 hover:text-white transition-colors duration-300">
         <ArrowLeft size={24} />
      </Link>
      
      <div className="w-full max-w-sm flex flex-col items-center">
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Clinical Gateway</h1>
        
        {status === 'SUCCESS' ? (
           <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                 <CircleCheckBig size={48} className="text-green-500 animate-[bounce_1s_ease-in-out_infinite]" />
              </div>
              <p className="text-xl font-bold text-white mb-2">Authenticated!</p>
              <p className="text-sm text-slate-400 text-center">Your attendance has been cryptographically signed.</p>
           </div>
        ) : status === 'ERROR' ? (
           <div className="flex flex-col items-center animate-pulse">
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                 <CircleX size={48} className="text-red-500" />
              </div>
              <p className="text-xl font-bold text-white mb-2 text-center">{errorMessage?.includes("Fingerprint") ? "Bypassing Blocked" : "Scan Error"}</p>
              <p className="text-sm text-red-500 text-center px-6">{errorMessage}</p>
           </div>
        ) : (
           <>
              <p className="text-sm font-medium text-slate-400 mb-8 text-center px-4 opacity-70">
                Align the Laboratory QR code within the viewfinder.
              </p>

              {/* Secure Scanning Interface */}
              <div className="w-full aspect-square border-2 border-slate-700 bg-slate-800 rounded-3xl relative overflow-hidden shadow-2xl mb-8">
                 <div id="reader" className="w-full h-full object-cover"></div>
                 
                 {/* Virtual Overlays */}
                 {status !== 'VERIFYING' && (
                   <div className="absolute inset-0 pointer-events-none border-[30px] border-slate-900/40">
                      <div className="absolute bottom-0 w-full h-[2px] bg-blue-500/50 shadow-[0_0_10px_#3b82f6] animate-scan z-20"></div>
                   </div>
                 )}
                 
                 {status === 'VERIFYING' && (
                    <div className="absolute inset-0 z-50 bg-slate-900/90 flex flex-col items-center justify-center gap-4">
                       <Loader2 className="animate-spin text-blue-500" size={48} />
                       <p className="text-xs font-bold text-blue-500 uppercase tracking-widest animate-pulse">Analyzing Fingerprint...</p>
                    </div>
                 )}
              </div>

              <div className="w-full p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
                    <ShieldCheck size={20} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Protocol V1.0</p>
                    <p className="text-[13px] font-bold text-slate-200">Zero-Trust Device Lock Active</p>
                 </div>
              </div>
           </>
        )}

        <div className="mt-12 text-center opacity-40">
           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">LabIntelligence™ Security</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0% { bottom: 0; }
          50% { bottom: 100%; }
          100% { bottom: 0; }
        }
        .animate-scan {
           animation: scan 2s linear infinite;
           position: absolute;
        }
      `}</style>
    </div>
  );
}
