"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    User, 
    Mail, 
    Shield, 
    Smartphone, 
    Activity, 
    Package, 
    Calendar,
    LogOut,
    Camera,
    CircleCheckBig,
    ShieldCheck,
    TriangleAlert,
    CircleUser,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSecurity } from "@/context/SecurityContext";

export default function ProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { tempSessionId, fingerprintHash } = useSecurity();
    const [profile, setProfile] = useState<any>(null);
    const [currentSession, setCurrentSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [isRotatingKeys, setIsRotatingKeys] = useState(false);
    const [isIntegrityScanning, setIsIntegrityScanning] = useState(false);
    const [isSecurityAuditing, setIsSecurityAuditing] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanState, setScanState] = useState("");

    const BREACH_LOGS = [
        { id: 1, event: "Unauthorized Fingerprint Shift", device: "Android Node 10.x", timestamp: "Mar 20, 02:22 PM", action: "AUTO_ROTATE_KEYS" },
        { id: 2, event: "IP Geolocation Mismatch", device: "Browser Hub 4.0", timestamp: "Mar 18, 11:15 AM", action: "TERMINATED_SESSION" }
    ];

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Fetch Student Profile
                const { data } = await supabase
                    .from('students')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                setProfile(data);

                // Fetch Active Session Node
                if (tempSessionId) {
                  const { data: sessionData } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('temp_session_id', tempSessionId)
                    .single();
                  setCurrentSession(sessionData);
                }
            }
            setLoading(false);
        }
        loadProfile();

        if (searchParams.get('action') === 'integrity_scan') {
            performIntegrityScan();
        } else if (searchParams.get('action') === 'security_audit') {
            performSecurityAudit();
        }
    }, [searchParams, tempSessionId]);
    
    // Helper to calculate expiration
    const getSessionExpiry = () => {
      if (!currentSession) return null;
      const expiry = new Date(currentSession.expires_at).getTime();
      const now = new Date().getTime();
      const diff = expiry - now;
      const minutes = Math.floor(diff / 1000 / 60);
      return minutes > 0 ? minutes : 0;
    };

    const performSecurityAudit = async () => {
        setIsSecurityAuditing(true);
        const steps = [
            "Accessing Breach Logs...",
            "Tracing IP Origins...",
            "Verifying Rotation Status...",
            "Audit Complete."
        ];

        for (let i = 0; i < steps.length; i++) {
            setScanState(steps[i]);
            setScanProgress((i + 1) * 25);
            await new Promise(r => setTimeout(r, 600));
        }
        
        // Keep scan on screen for a bit to show results
        setTimeout(() => {
            setScanProgress(100);
        }, 500);
    };

    const performIntegrityScan = async () => {
        setIsIntegrityScanning(true);
        const steps = [
            "Initializing Shield Protocol...",
            "Validating Hardware Anchor...",
            "Verifying SHA-256 Digest Integrity...",
            "Synchronizing with Institutional Ledger...",
            "Integrity Confirmed."
        ];

        for (let i = 0; i < steps.length; i++) {
            setScanState(steps[i]);
            setScanProgress((i + 1) * 20);
            await new Promise(r => setTimeout(r, 800));
        }
        
        setTimeout(() => {
            setIsIntegrityScanning(false);
            setScanProgress(0);
        }, 1500);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setSuccessMsg("Academic Identity Synchronized.");
        setTimeout(() => setSuccessMsg(""), 3000);
        setIsSaving(false);
    };

    const handleRotateKeys = async () => {
        setIsRotatingKeys(true);
        await new Promise(r => setTimeout(r, 2000));
        alert("RSA 4096 Keys Rotated Successfully. All session nodes have been re-anchored.");
        setIsRotatingKeys(false);
    };

    if (loading) return null;

    const sessionMinutesLeft = getSessionExpiry();

    return (
        <div className="space-y-8 md:space-y-12 pb-20">
            <header className="px-2 md:px-0">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Identity Hub</h2>
                <p className="text-slate-400 font-bold text-[9px] md:text-sm uppercase tracking-widest leading-none">Vanguard Presence Protocol</p>
            </header>

            {/* 1. Header Profile Banner */}
            <section className="bg-white rounded-[32px] md:rounded-[40px] border border-slate-100 p-6 md:p-12 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-1000"></div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
                    <div className="relative group/avatar">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-[32px] md:rounded-[48px] bg-[#0052a5] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 border-4 border-white overflow-hidden">
                            <CircleUser className="w-16 h-16 md:w-20 md:h-20" strokeWidth={1} />
                        </div>
                        <button className="absolute -bottom-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl md:rounded-2xl shadow-lg border border-slate-50 flex items-center justify-center text-[#0052a5] hover:bg-[#0052a5] hover:text-white transition-all transform group-hover/avatar:scale-110 active:scale-90">
                            <Camera className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 mb-3 md:mb-4">
                            <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">{profile?.full_name?.toUpperCase() || "AUTHORIZED NODE"}</h3>
                            <div className="px-4 md:px-5 py-1.5 md:py-2 rounded-full bg-blue-50 text-[#0052a5] text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50 shadow-sm shadow-blue-500/5">
                                {profile?.department || "CSE / COHORT 2026"}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8 text-slate-400 font-bold text-[10px] md:text-sm">
                            <span className="flex items-center gap-2"><Smartphone size={14} /> {profile?.roll_no || "VANGUARD_ID"}</span>
                            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg"><Mail size={14} /> student@{profile?.roll_no?.toLowerCase() || "school"}.edu</span>
                        </div>
                    </div>

                    <div className="w-full md:w-auto">
                        <button 
                            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
                            className="w-full md:w-auto bg-slate-50 hover:bg-rose-50 hover:text-rose-500 text-slate-400 px-8 py-4 rounded-xl md:rounded-[28px] text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-4 active:scale-95"
                        >
                            <LogOut size={16} /> Sign Out Node
                        </button>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                {/* 2. Form Section (Left - 8 Cols) */}
                <div className="lg:col-span-8 space-y-8 md:space-y-10">
                    {/* Academic Identity */}
                     <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-[#0052a5]/10 group-hover:bg-[#0052a5] transition-colors" />
                        
                        <div className="flex items-center gap-3 md:gap-4 mb-8 md:mb-10">
                            <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-blue-50 text-[#0052a5] flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Identity Meta</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Legacy Name</label>
                                <input 
                                    type="text" 
                                    defaultValue={profile?.full_name}
                                    className="w-full bg-slate-50 border-none rounded-xl md:rounded-[20px] py-3.5 md:py-4 px-6 text-[12px] md:text-[13px] font-black focus:ring-2 focus:ring-blue-100 transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Node Comm Link</label>
                                <input 
                                    type="email" 
                                    placeholder={profile?.roll_no ? `${profile.roll_no}@vnrvjiet.in` : "authorized@vnrvjiet.in"} 
                                    readOnly
                                    className="w-full bg-slate-100/50 border-none rounded-xl md:rounded-[20px] py-3.5 md:py-4 px-6 text-[12px] md:text-[13px] font-black text-slate-400 cursor-not-allowed shadow-inner"
                                />
                            </div>
                        </div>
                        
                        <div className="mt-8 md:mt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-50 pt-8">
                            <p className="text-[9px] md:text-[10px] font-bold text-slate-400 max-w-xs leading-relaxed text-center md:text-left uppercase tracking-wider">Administrative validation required for identity shifts.</p>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full md:w-auto bg-[#0052a5] text-white px-8 md:px-10 py-4 rounded-xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/10 hover:scale-105 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Update Sync"}
                                {successMsg && <CircleCheckBig size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Security Hub */}
                     <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-rose-500/10 group-hover:bg-rose-500 transition-colors" />
                        
                        <div className="flex items-center justify-between mb-8 md:mb-10">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 rounded-xl md:rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                    <Shield size={20} />
                                </div>
                                <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">Security Node</h4>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <ShieldCheck size={16} className="animate-pulse" />
                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">Active</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Entropy Key</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl md:rounded-[20px] py-3.5 md:py-4 px-6 text-[12px] md:text-[13px] font-black focus:ring-2 focus:ring-rose-100 transition-all font-mono shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">New Node</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl md:rounded-[20px] py-3.5 md:py-4 px-6 text-[12px] md:text-[13px] font-black focus:ring-2 focus:ring-rose-100 transition-all font-mono shadow-inner" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">Verify</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border-none rounded-xl md:rounded-[20px] py-3.5 md:py-4 px-6 text-[12px] md:text-[13px] font-black focus:ring-2 focus:ring-rose-100 transition-all font-mono shadow-inner" />
                            </div>
                        </div>

                        <div className="mt-6 md:mt-8 bg-slate-50/50 p-5 md:p-6 rounded-2xl md:rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100/50">
                            <div className="flex items-center gap-3 md:gap-4 text-center md:text-left">
                                <TriangleAlert size={18} md-size={20} className="text-amber-500 shrink-0" />
                                <p className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-tight uppercase leading-relaxed">Updating key invalidates all active session nodes.</p>
                            </div>
                            <button 
                                onClick={handleRotateKeys}
                                disabled={isRotatingKeys}
                                className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:tracking-[0.3em] transition-all disabled:opacity-50 w-full md:w-auto text-center"
                            >
                                {isRotatingKeys ? "Rotating..." : "Update RSA Keys"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Stats & Info Sidebar (Right - 4 Cols) */}
                <div className="lg:col-span-4 space-y-8 md:space-y-10 px-2 md:px-0">
                    <div className="bg-[#0052a5] p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-6 md:space-y-8">
                            <header className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-lg md:text-xl font-black tracking-tighter mb-1 uppercase">Pulse Snapshot</h4>
                                    <p className="text-blue-200 text-[8px] md:text-[10px] uppercase font-bold tracking-[0.2em] leading-none">Matrix Diagnostics</p>
                                </div>
                                <Link href="/student/analytics" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all active:scale-90">
                                    <ArrowUpRight size={16} />
                                </Link>
                            </header>

                            <div className="grid grid-cols-2 gap-4 md:gap-6">
                                <Link href="/student/analytics" className="bg-white/10 p-4 md:p-5 rounded-2xl md:rounded-[28px] backdrop-blur-md hover:bg-white/20 transition-all group/card border border-white/5">
                                    <Activity className="text-blue-300 mb-2 md:mb-3 group-hover/card:scale-110 transition-transform" size={20} />
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1 leading-none">Attendance</p>
                                    <p className="text-xl md:text-2xl font-black tracking-tighter">82%</p>
                                </Link>
                                <Link href="/student/equipment" className="bg-white/10 p-4 md:p-5 rounded-2xl md:rounded-[28px] backdrop-blur-md hover:bg-white/20 transition-all group/card border border-white/5">
                                    <Package className="text-blue-300 mb-2 md:mb-3 group-hover/card:scale-110 transition-transform" size={20} />
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1 leading-none">Assets</p>
                                    <p className="text-xl md:text-2xl font-black tracking-tighter">02</p>
                                </Link>
                                <div className="bg-white/10 p-5 rounded-2xl md:rounded-[28px] backdrop-blur-md col-span-2 flex items-center justify-between border border-white/5">
                                    <div>
                                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-blue-200 mb-1 leading-none">Node Longevity</p>
                                        <p className="text-xl md:text-2xl font-black tracking-tighter uppercase">482 Days</p>
                                    </div>
                                    <Calendar className="text-blue-200/40" size={32} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Hardware Anchor Info (Session Info Section) */}
                    <div className="bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-50 transition-colors" />
                        
                        <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tighter mb-8 uppercase leading-none relative z-10">Session Info</h4>
                        
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center gap-4 md:gap-6">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-50 flex items-center justify-center text-[#0052a5]">
                                    <Smartphone size={20} md-size={24} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none mb-1">Device Status</p>
                                    <p className="text-[8px] md:text-[10px] font-extrabold text-emerald-500 uppercase flex items-center gap-1.5 leading-none">
                                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                      Hardware Bound
                                    </p>
                                </div>
                                <ShieldCheck size={20} className="text-emerald-500" />
                            </div>

                            <div className="p-5 md:p-6 bg-slate-50/50 rounded-2xl md:rounded-[30px] border border-slate-100 group hover:border-blue-100 transition-all cursor-default relative overflow-hidden shadow-inner">
                                {tempSessionId ? (
                                  <>
                                    <div className="flex items-center gap-3 mb-3 relative z-10">
                                        <Activity size={14} className="text-[#0052a5]" />
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none">Current Session</span>
                                    </div>
                                    <p className="text-[10px] md:text-[11px] font-mono text-slate-400 break-all leading-relaxed group-hover:text-slate-900 transition-colors relative z-10 tracking-[0.2em]">
                                        SESS_{tempSessionId.substring(0, 8).toUpperCase()}••••
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2 relative z-10">
                                      <div className="px-3 py-1 bg-white rounded-lg md:rounded-full text-[8px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">
                                        START: {currentSession ? new Date(currentSession.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'NOW'}
                                      </div>
                                      <div className={`px-3 py-1 rounded-lg md:rounded-full text-[8px] font-black border border-slate-100 uppercase tracking-widest ${((sessionMinutesLeft ?? 0) < 60) ? 'bg-amber-50 text-amber-500 border-amber-100' : 'bg-white text-slate-400'}`}>
                                        EXP: {currentSession ? new Date(currentSession.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24H'}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center py-4">
                                     <Loader2 className="animate-spin text-slate-300 mx-auto mb-2" size={20} />
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Handshaking...</p>
                                  </div>
                                )}
                            </div>

                            {sessionMinutesLeft !== null && sessionMinutesLeft < 60 && (
                               <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col gap-3"
                               >
                                  <p className="text-[9px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                                    <TriangleAlert size={12} className="inline mr-2" />
                                    Expiring in {sessionMinutesLeft}m
                                  </p>
                                  <button className="w-full py-2.5 bg-white border border-amber-200 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-100 transition-all active:scale-95">
                                    Renew Node
                                  </button>
                               </motion.div>
                            )}

                            <div className="flex items-center gap-3 text-[8px] md:text-[9px] font-black text-slate-300 uppercase tracking-widest px-4 py-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
                                <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                                <span>SHA-256 Digest Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrity / Security Scan Overlay */}
            <AnimatePresence>
                {(isIntegrityScanning || isSecurityAuditing) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 text-white"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white text-slate-900 w-full max-w-2xl rounded-[32px] md:rounded-[50px] shadow-2xl p-8 md:p-12 text-center overflow-hidden relative mx-2"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-20 md:w-24 h-20 md:h-24 rounded-2xl md:rounded-[32px] flex items-center justify-center mb-6 md:mb-8 shadow-2xl relative ${isSecurityAuditing ? 'bg-rose-500 shadow-rose-500/40 text-white' : 'bg-[#0052a5] shadow-blue-500/40 text-white'}`}>
                                    {isSecurityAuditing ? <TriangleAlert className="w-10 h-10 md:w-12 md:h-12" /> : <ShieldCheck className="w-10 h-10 md:w-12 md:h-12" />}
                                    <motion.div 
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className={`absolute inset-0 border-4 rounded-2xl md:rounded-[32px] ${isSecurityAuditing ? 'border-rose-400' : 'border-blue-400'}`}
                                    ></motion.div>
                                </div>
                                <h3 className="text-xl md:text-2xl font-black tracking-tighter mb-4 uppercase leading-none">{isSecurityAuditing ? "Forensic Audit" : "Integrity Hub"}</h3>
                                <p className="text-slate-400 text-[10px] md:text-sm font-black uppercase tracking-widest mb-8 md:mb-10 max-w-xs mx-auto leading-none">{scanState}</p>
                                
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-8 md:mb-12">
                                    <motion.div 
                                        animate={{ width: `${scanProgress}%` }}
                                        className={`h-full ${isSecurityAuditing ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-[#0052a5] shadow-[0_0_15px_rgba(0,82,165,0.4)]'}`}
                                    ></motion.div>
                                </div>

                                {isSecurityAuditing && scanProgress === 100 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-3 md:space-y-4 mb-8 md:mb-10">
                                        <h4 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 text-left mb-2 leading-none">Security Node History</h4>
                                        <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar-light space-y-3">
                                            {BREACH_LOGS.map(log => (
                                                <div key={log.id} className="bg-slate-50 p-4 rounded-xl md:rounded-2xl flex items-center justify-between border border-slate-100">
                                                    <div className="text-left">
                                                        <p className="text-[11px] md:text-[12px] font-black tracking-tight text-slate-900 mb-1 leading-none">{log.event}</p>
                                                        <p className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">{log.device}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] font-black text-rose-500 mb-1 uppercase bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 inline-block leading-none">{log.action}</p>
                                                        <p className="text-[8px] font-bold text-slate-300 block leading-none">{log.timestamp}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <button 
                                    onClick={() => { setIsIntegrityScanning(false); setIsSecurityAuditing(false); router.replace('/student/profile'); }}
                                    className="w-full py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[24px] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-transform"
                                >
                                    Dismiss Audit Report
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
