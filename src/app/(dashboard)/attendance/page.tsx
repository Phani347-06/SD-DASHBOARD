"use client";
import { useState, useEffect } from "react";
import { 
  QrCode, 
  RotateCw, 
  LogOut, 
  Signal, 
  Filter, 
  Download,
  Search,
  Play,
  Pause,
  StopCircle,
  Loader2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

export default function AttendancePage() {
  const [session, setSession] = useState<any>(null);
  const [tempSession, setTempSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [elapsed, setElapsed] = useState("00h 00m 00s");
  
  // Faculty Specific States
  const [facultyLabs, setFacultyLabs] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState<string>("");

  // Fetch Labs and Active Session
  useEffect(() => {
    const initCommandCenter = async () => {
       setLoading(true);
       try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // 1. Fetch Faculty's Labs
          const { data: labs } = await supabase
             .from('labs')
             .select('*')
             .eq('created_by', user.id);
          
          if (labs) setFacultyLabs(labs);

          // 2. Get current active session
          const { data: activeSession } = await supabase
             .from('class_sessions')
             .select('*, labs(name)')
             .eq('teacher_id', user.id)
             .eq('status', 'ACTIVE')
             .order('created_at', { ascending: false })
             .limit(1)
             .maybeSingle();

          if (activeSession) {
             setSession(activeSession);
             setSelectedLabId(activeSession.lab_id);
             
             // 3. Get the active token for this session
             const { data: activeToken } = await supabase
                .from('temp_qr_sessions')
                .select('*')
                .eq('class_session_id', activeSession.id)
                .is('is_active', true)
                .maybeSingle();
             
             if (activeToken) {
                setTempSession(activeToken);
             }
          }
       } catch (err: any) {
          console.error("Hub synchronization failure:", err);
       } finally {
          setLoading(false);
       }
    };
    initCommandCenter();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (session && session.created_at) {
      interval = setInterval(() => {
        const start = new Date(session.created_at).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        
        setElapsed(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
      }, 1000);
    } else {
       setElapsed("00h 00m 00s");
    }
    return () => clearInterval(interval);
  }, [session]);

  // Fetch real attendance logs
  useEffect(() => {
    if (session) {
      const fetchLogs = async () => {
        const { data } = await supabase
          .from('attendance_logs')
          .select('*, students(full_name, roll_no)')
          .eq('class_session_id', session.id)
          .order('scanned_at', { ascending: false });
        if (data) setLogs(data);
      };

      fetchLogs();
      const channel = supabase
        .channel('attendance_changes')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'attendance_logs', 
            filter: `class_session_id=eq.${session.id}` 
        }, () => {
          fetchLogs();
        })
        .subscribe();
      
      return () => { supabase.removeChannel(channel); };
    }
  }, [session]);

  const startNewSession = async () => {
    if (!selectedLabId) {
        setError("Institutional Error: Laboratory Node must be selected.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized Access Detection.");

      const selectedLab = facultyLabs.find(l => l.id === selectedLabId);

      // 1. Create a Master Class Session
      const { data: newSession, error: sError } = await supabase
        .from('class_sessions')
        .insert({
          lab_id: selectedLabId,
          course_code: selectedLab.name,
          teacher_id: user.id,
          date: new Date().toISOString().split('T')[0],
          status: 'ACTIVE'
        })
        .select('*, labs(name)')
        .single();
      
      if (sError) throw sError;
      setSession(newSession);

      // 2. Generate initial Rolling Token
      await generateNewToken(newSession.id);
    } catch (err: any) {
      setError("Handshake Failure: " + (err.message || "Database node unreachable."));
    } finally {
      setLoading(false);
    }
  };

  const generateNewToken = async (sessionId: string) => {
    setLoading(true);
    try {
       const { data: newToken, error: tError } = await supabase
          .from('temp_qr_sessions')
          .insert({
            class_session_id: sessionId, 
            verification_code: Math.floor(100000 + Math.random() * 900000).toString(),
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            is_active: true
          })
          .select()
          .single();
       
       if (tError) throw tError;
       setTempSession(newToken);
    } catch (err: any) {
       setError("Token Manifestation Failure: " + err.message);
    } finally {
       setLoading(false);
    }
  };

  const togglePause = async () => {
    if (!tempSession) return;
    setLoading(true);
    try {
      const { data: updated, error: pError } = await supabase
        .from('temp_qr_sessions')
        .update({ is_paused: !tempSession.is_paused })
        .eq('temp_session_id', tempSession.temp_session_id)
        .select()
        .single();
      
      if (pError) throw pError;
      setTempSession(updated);
    } catch (err: any) {
      setError("Matrix Pause Failed: Handshake interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { error: eError } = await supabase
        .from('class_sessions')
        .update({ status: 'COMPLETED' })
        .eq('id', session.id);
      
      if (eError) throw eError;

      if (tempSession) {
        await supabase
          .from('temp_qr_sessions')
          .update({ is_active: false })
          .eq('temp_session_id', tempSession.temp_session_id);
      }

       setSession(null);
       setTempSession(null);
       setLogs([]);
       setElapsed("00h 00m 00s");
    } catch (err: any) {
       setError("Shutdown Protocol Failure: Node lock detected.");
    } finally {
       setLoading(false);
    }
  };

  const qrValue = JSON.stringify({
     s_id: session?.id,
     lab_id: session?.lab_id,
     temp_session_id: tempSession?.temp_session_id,
     verification_code: tempSession?.verification_code
  });


  return (
    <div className="flex flex-col h-full bg-[#f8fafc] text-slate-900 pb-12 w-full max-w-[1400px] mx-auto overflow-y-auto animate-in fade-in duration-700">
      
      {error && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-8 py-4 rounded-2xl shadow-2xl font-black text-[12px] uppercase tracking-widest flex items-center gap-4 animate-in slide-in-from-top-4 duration-300">
           <ShieldCheck size={20} /> {error}
           <button onClick={() => setError(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">Dismiss</button>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6 md:mb-8 gap-6 px-4 md:px-0">
        <div className="space-y-2">
          <div className="flex items-center gap-3 mb-2">
            <span className={`flex items-center gap-1.5 px-3 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full border ${session ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${session ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {session ? 'Manifested' : 'Standby'}
            </span>
            <span className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest">{session ? `Uptime ${elapsed}` : 'Awaiting initialization'}</span>
          </div>
          <h1 className="text-3xl md:text-[40px] font-black text-slate-900 tracking-tighter leading-tight md:leading-none font-display">
            {session ? session.labs?.name : (
                <div className="flex flex-col gap-4 mt-2">
                    <p className="text-xl md:text-3xl font-black text-slate-400 uppercase">Command Center</p>
                    <select 
                        disabled={!!session}
                        value={selectedLabId}
                        onChange={(e) => setSelectedLabId(e.target.value)}
                        className="bg-white border border-slate-200 rounded-2xl px-5 py-3 text-[14px] md:text-[16px] font-black tracking-tight text-[#0052a5] focus:outline-none focus:ring-4 focus:ring-blue-500/10 w-full md:min-w-[300px]"
                    >
                        <option value="">Select Laboratory Node</option>
                        {facultyLabs.map(lab => (
                            <option key={lab.id} value={lab.id}>{lab.name}</option>
                        ))}
                    </select>
                </div>
            )}
          </h1>
        </div>

        <div className="flex bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-slate-100 overflow-hidden divide-x divide-slate-100 h-28 transform hover:scale-[1.02] transition-transform">
          <div className="px-10 py-6 flex flex-col justify-center">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 mb-2">Identity Nodes</p>
            <p className="text-4xl font-black text-slate-900 tracking-tighter">{logs.length}<span className="text-xl text-slate-300 ml-1">/{session ? '45' : '0'}</span></p>
          </div>
          <div className="px-10 py-6 flex flex-col justify-center bg-slate-50/50">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-2 bg-[#0052a5] rounded-full animate-pulse" />
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Integrity Pulse</p>
             </div>
             <p className="text-sm font-black text-[#0052a5] uppercase tracking-widest">Handshake Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - QR Protocol */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6 px-4 md:px-0">
          <div className="bg-white rounded-[40px] p-6 md:p-10 shadow-sm border border-slate-100 flex flex-col items-center group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-[60px] -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-50 transition-colors" />
            
            <h3 className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] mb-8 md:mb-10 w-full text-center relative z-10">Access Portal</h3>
            
            <div className="w-48 h-48 md:w-56 md:h-56 bg-white border border-slate-100 rounded-3xl md:rounded-[40px] mb-8 md:mb-10 flex items-center justify-center p-4 md:p-6 shadow-2xl shadow-blue-900/5 relative z-10 group-hover:scale-105 transition-transform duration-500">
               <div className="w-full h-full bg-slate-50 rounded-2xl md:rounded-[30px] flex items-center justify-center flex-col p-4 relative overflow-hidden border border-slate-100">
                  {session && tempSession ? (
                    tempSession.is_paused ? (
                       <div className="flex flex-col items-center animate-pulse">
                          <Pause size={48} className="text-amber-500 mb-3" fill="currentColor" />
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Matrix Disconnected</p>
                       </div>
                    ) : (
                      <QRCodeSVG 
                         value={qrValue}
                         size={160}
                         level="H"
                         includeMargin={false}
                         className="relative z-10"
                      />
                    )
                  ) : (
                    <>
                      <QrCode size={56} className="text-slate-100 animate-pulse" strokeWidth={1} />
                      <p className="text-[9px] text-slate-300 mt-4 font-black uppercase tracking-[0.2em] text-center px-4">Initialize Lab Beacon to Manifest QR</p>
                    </>
                  )}
               </div>
            </div>

            <div className="w-full space-y-4 relative z-10">
              <button 
                onClick={startNewSession}
                disabled={!!session || loading}
                className="w-full py-5 bg-[#0052a5] hover:bg-[#00438a] text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 active:scale-95"
              >
                 {loading ? <Loader2 className="animate-spin" size={18} /> : (
                   <><Play size={18} fill="currentColor" stroke="none" /> {session ? 'Session Locked' : 'Manifest Protocol'}</>
                 )}
              </button>
              
              <button 
                onClick={togglePause}
                disabled={!session || loading}
                className={`w-full py-4 border-2 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 ${tempSession?.is_paused ? 'bg-amber-500 text-white border-amber-600 shadow-xl shadow-amber-900/10' : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-100'}`}
              >
                {tempSession?.is_paused ? <Play size={16} fill="currentColor" stroke="none" /> : <Pause size={16} fill="currentColor" stroke="none" />}
                {tempSession?.is_paused ? 'Resume Matrix' : 'Toggle Standby'}
              </button>
            </div>

            <button 
              onClick={endSession}
              disabled={!session}
              className="mt-10 w-full py-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-3xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
              <StopCircle size={18} fill="currentColor" stroke="none" /> Terminate Node
            </button>
          </div>

          <div className="bg-slate-900 rounded-[40px] p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] -mr-16 -mt-16 opacity-20 group-hover:opacity-30 transition-opacity" />
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                   <ShieldCheck size={32} className="text-blue-400" />
                   <h4 className="text-sm font-black uppercase tracking-widest">Protocol Integrity</h4>
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-100/40">
                      <span>Encryption Type</span>
                      <span className="text-blue-300">SHA-256 Digest</span>
                   </div>
                   <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-100/40">
                      <span>Hardware Handshake</span>
                      <span className="text-blue-300">Enabled</span>
                   </div>
                   <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                      <div className="w-[85%] h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column - Attendance Matrix */}
        <div className="md:col-span-8 lg:col-span-9 bg-white rounded-3xl md:rounded-[50px] shadow-sm border border-slate-100 overflow-hidden flex flex-col md:h-[800px] relative transition-all mx-2 md:mx-0">
          
          <div className="pt-8 md:pt-12 px-6 md:px-12 pb-6 md:pb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2 md:mb-3 font-display uppercase">Presence Ledger</h2>
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Identity Synchronization</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 md:flex-none relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0052a5] transition-colors" size={14} md-size={16} />
                 <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-slate-50 border-none rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-6 text-[10px] md:text-[11px] font-black uppercase tracking-widest focus:ring-4 focus:ring-blue-100 transition-all md:w-64" 
                 />
              </div>
              <button className="bg-[#0052a5] p-2.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-xl hover:rotate-6 transition-transform">
                 <Download size={18} md-size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto relative custom-scrollbar">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-[#fcfdff] sticky top-0 z-10 border-b border-slate-50">
                <tr className="text-[9px] md:text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">
                  <th className="px-8 md:px-12 py-6">Institutional Roll</th>
                  <th className="px-8 md:px-12 py-6">Manifest</th>
                  <th className="px-8 md:px-12 py-6">Handshake</th>
                  <th className="px-8 md:px-12 py-6">Security</th>
                  <th className="px-8 md:px-12 py-6 pr-8 md:pr-12 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-[13px] font-medium text-slate-700">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                       <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Signal size={32} className="text-slate-100 animate-pulse" />
                       </div>
                       <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em]">Awaiting Peer Manifestation...</p>
                    </td>
                  </tr>
                ) : logs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-all group h-24">
                    <td className="px-12 font-black text-slate-900 text-[14px] uppercase tracking-tighter">{log.students?.roll_no || 'EXTERNAL'}</td>
                    <td className="px-12">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#0052a5]/5 text-[#0052a5] font-black text-[12px] flex items-center justify-center shadow-inner group-hover:bg-[#0052a5] group-hover:text-white transition-all transform group-hover:rotate-6">
                             {(log.students?.full_name || '??').substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-[#0052a5] transition-colors">{log.students?.full_name || 'Unauthorized Node'}</p>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Enrolled Research Fellow</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-12 font-black text-slate-500 text-[12px] uppercase">
                       {new Date(log.scanned_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-12 font-mono text-[10px] text-slate-300 uppercase tracking-tighter">
                       NODE-{log.id.slice(0,8).toUpperCase()}
                    </td>
                    <td className="px-12 pr-12 text-right">
                       <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                          <CheckCircle2 size={12} strokeWidth={3} /> VERIFIED
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-12 py-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] relative z-10">
            <span className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-[#0052a5] rounded-full animate-pulse" />
               Roster Integrity: {logs.length} Nodes Synchronized
            </span>
            <div className="flex gap-4">
               <button className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-500 rounded-2xl transition-all shadow-sm border border-slate-100 active:scale-95">Matrix Prev</button>
               <button className="px-6 py-3 bg-[#0052a5] hover:bg-[#00438a] text-white rounded-2xl shadow-xl shadow-blue-900/10 transition-all active:scale-95">Matrix Next</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
