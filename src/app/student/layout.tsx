"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Monitor, 
  Bell, 
  User, 
  LogOut,
  Settings,
  ShieldCheck,
  Search,
  Activity,
  CircleUser,
  ChartColumn,
  FlaskConical
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSecurity } from "@/context/SecurityContext";

interface SidebarLinkProps {
  href: string;
  icon: any;
  label: string;
  active: boolean;
}

function SidebarLink({ href, icon: Icon, label, active }: SidebarLinkProps) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-4 px-6 py-4 rounded-[24px] mb-2 transition-all duration-300 group ${
          active 
            ? "bg-[#0052a5] text-white shadow-xl shadow-blue-900/20" 
            : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
        }`}
      >
        <Icon size={20} strokeWidth={active ? 3 : 2} className={active ? "text-white" : "text-slate-300 group-hover:text-[#0052a5]"} />
        <span className={`text-[11px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}>
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { tempSessionId, fingerprintHash, clearSession } = useSecurity();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    let channel: any;

    async function initSession() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        // 1. Resolve Profile Cache
        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(student);
        setLoading(false);

        // 2. SET UP WATCHDOG - Monitor active session node
        if (tempSessionId) {
          channel = supabase
            .channel(`student_security_${user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessions',
                filter: `student_id=eq.${user.id}`
              },
              (payload) => {
                // If another session became active or this one was terminated
                if (payload.new.temp_session_id !== tempSessionId && payload.new.is_active === true) {
                  setSessionError(true);
                }
                if (payload.new.temp_session_id === tempSessionId && payload.new.is_active === false) {
                  setSessionError(true);
                }
              }
            )
            .subscribe();
        }

      } catch (err) {
        console.error("Identity Hub Failure:", err);
        router.push("/login");
      }
    }

    initSession();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [router, tempSessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Activity className="animate-pulse text-[#0052a5] mb-6" size={48} strokeWidth={3} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initializing Security Nodes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden w-full bg-[#f8fafc]">
      <AnimatePresence>
        {sessionError && (
          <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 inset-x-0 z-[100] bg-rose-600 text-white py-4 px-6 text-center font-bold text-sm shadow-2xl flex items-center justify-center gap-4"
          >
            <ShieldCheck size={20} />
            Security Alert: You have been signed in on another device. This session is now terminal.
            <button 
              onClick={() => {
                supabase.auth.signOut();
                router.push("/login");
              }}
              className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 0. Mobile Command Header (Top Nav for Mobile) */}
      <div className="xl:hidden h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between flex-shrink-0 z-50 shadow-sm relative">
          <div className="flex items-center gap-3">
             <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 cursor-pointer active:scale-95 transition-all">
                {mobileMenuOpen ? "✕" : "☰"}
             </div>
             <div className="w-8 h-8 bg-[#0052a5] rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                <Activity size={18} strokeWidth={3} />
             </div>
             <h1 className="text-sm font-black text-slate-900 tracking-tighter">PRISM</h1>
          </div>
          <div className="flex items-center gap-3">
             {installPrompt && (
                <button 
                   onClick={() => installPrompt.prompt()}
                   className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl animate-pulse"
                >
                   <Monitor size={18} />
                </button>
             )}
             <Link href="/student/profile">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0052a5] border border-slate-100">
                   <CircleUser size={24} />
                </div>
             </Link>
          </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative w-full">
        {/* Overlay for Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 xl:hidden"
            />
          )}
        </AnimatePresence>

        {/* 1. Sidebar - Institutional Navigation Node */}
        <aside 
          className={`fixed xl:relative top-0 left-0 bottom-0 h-full w-80 bg-white border-r border-[#f1f5f9] flex flex-col z-50 transition-transform duration-300 xl:translate-x-0 ${
            mobileMenuOpen ? "translate-x-0 shadow-2xl shadow-blue-900/40" : "-translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-4 py-8 space-y-12">
            <div className="flex items-center justify-between xl:justify-start gap-4 mb-4 pl-4 xl:pl-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#0052a5] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                  <Activity size={24} strokeWidth={3} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tighter leading-none mb-1">PRISM</h1>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Institutional</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="xl:hidden w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">✕</button>
            </div>

            <nav className="flex-1" onClick={() => setMobileMenuOpen(false)}>
              <SidebarLink href="/student" icon={LayoutDashboard} label="Dashboard" active={pathname === "/student"} />
              <SidebarLink href="/student/labs" icon={FlaskConical} label="Labs" active={pathname === "/student/labs"} />
              <SidebarLink href="/student/attendance" icon={CalendarCheck} label="Attendance" active={pathname === "/student/attendance"} />
              <SidebarLink href="/student/equipment" icon={Monitor} label="Equipment" active={pathname === "/student/equipment"} />
              <SidebarLink href="/student/analytics" icon={ChartColumn} label="Analytics" active={pathname === "/student/analytics"} />
            </nav>
          </div>

          <div className="p-6 space-y-4 bg-slate-50/50">
            <button 
              onClick={async () => {
                if (tempSessionId) {
                  await supabase.from('sessions').update({ is_active: false }).eq('temp_session_id', tempSessionId);
                }
                clearSession();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="flex items-center gap-4 px-6 py-4 w-full bg-white border border-slate-100 hover:border-rose-100 hover:text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
            >
              <LogOut size={18} /> Sign Out Node
            </button>
          </div>
        </aside>

        {/* 2. Main Content Board */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[#f8fafc] w-full min-w-0 relative flex flex-col">
          {/* Top Navbar (Visible ONLY on Desktop Devices) */}
          <header className="hidden xl:flex h-28 bg-white/60 backdrop-blur-xl border-b border-slate-100 flex-shrink-0 items-center justify-between px-12 sticky top-0 z-30">
            <div className="max-w-md w-full relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-slate-300">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="Query the Matrix..." 
                className="w-full bg-slate-100/50 border-none rounded-[20px] py-4 pl-16 pr-8 text-[12px] font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3 pr-8 border-r border-slate-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Node Secure</span>
              </div>

              <Link href="/student/notifications">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#0052a5] hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative group">
                  <Bell size={20} />
                  <div className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
                </div>
              </Link>

              <Link href="/student/profile">
                <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group/prof">
                  <div className="text-right">
                    <p className="text-[11px] font-black text-slate-900 leading-none mb-1 group-hover/prof:text-[#0052a5] transition-colors">{profile?.full_name || "Authorized Student"}</p>
                    <p className="text-[9px] font-bold text-[#0052a5] uppercase tracking-widest leading-none">{profile?.department || "CSE / IoT"}</p>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-[#0052a5] text-white flex items-center justify-center group-hover/prof:scale-105 transition-transform">
                    <CircleUser size={28} strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            </div>
          </header>

          {/* Page Children with Staggered Entry */}
          <div className="p-4 md:p-12 pb-32 max-w-[1600px] mx-auto w-full min-w-0 flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
