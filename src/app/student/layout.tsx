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
  FlaskConical,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSecurity } from "@/context/SecurityContext";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { tempSessionId, fingerprintHash, clearSession } = useSecurity();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

        const { data: student } = await supabase
          .from('students')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(student);
        setLoading(false);

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

  const navItems = [
    { href: "/student", icon: <LayoutDashboard size={20} />, name: "Dashboard" },
    { href: "/student/labs", icon: <FlaskConical size={20} />, name: "Labs" },
    { href: "/student/attendance", icon: <CalendarCheck size={20} />, name: "Attendance" },
    { href: "/student/equipment", icon: <Monitor size={20} />, name: "Equipment" },
    { href: "/student/analytics", icon: <ChartColumn size={20} />, name: "Analytics" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Activity className="animate-pulse text-[#0052a5] mb-6" size={48} strokeWidth={3} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Initializing Security Nodes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden w-full bg-[#f8fafc]">
        {/* Top Navbar - ALWAYS VISIBLE (exact faculty pattern) */}
        <header className="h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-40 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-[#0052a5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/10">
                  <Activity size={24} strokeWidth={3} />
               </div>
               <h1 className="font-black text-xl text-slate-900 tracking-tighter leading-none">
                  PRISM
               </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {installPrompt && (
              <button 
                onClick={() => installPrompt.prompt()}
                className="w-10 h-10 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 animate-pulse"
              >
                <Monitor size={20} />
              </button>
            )}

            <Link href="/student/notifications">
              <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all">
                <Bell size={22} strokeWidth={2.5} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </div>
            </Link>

            <Link href="/student/profile">
              <div className="w-10 h-10 rounded-2xl bg-[#0052a5] text-white flex items-center justify-center hover:scale-105 transition-transform">
                <CircleUser size={24} strokeWidth={1.5} />
              </div>
            </Link>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar Overlay (Mobile) */}
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
              />
            )}
          </AnimatePresence>

          <aside className={`
            fixed lg:relative top-0 left-0 bottom-0 w-72 bg-white border-r border-[#f1f5f9] flex flex-col justify-between h-full z-50 transition-transform duration-300 lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="flex-1 overflow-y-auto px-4 py-8 space-y-12">
               {/* Mobile Close Button */}
               <div className="lg:hidden absolute top-6 right-6">
                  <button onClick={() => setIsSidebarOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                    <X size={20} />
                  </button>
               </div>
               
               <div className="px-4 pb-8 border-b border-slate-50">
                 <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 relative overflow-hidden group">
                    <div className="relative z-10">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Institutional Role</p>
                       <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2 mb-1">
                          Student <ShieldCheck size={14} className="text-blue-500" />
                       </h4>
                       <p className="text-[10px] font-bold text-slate-500 leading-none">{profile?.full_name || "Authorized Student"}</p>
                    </div>
                 </div>
              </div>
              <nav className="space-y-2">
                {navItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={idx} 
                      href={item.href} 
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${isActive ? "bg-[#0052a5] text-white shadow-xl" : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"}`}
                    >
                      {item.icon}
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] pt-0.5">{item.name}</span>
                    </Link>
                  );
                })}
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

          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
               <motion.div
                 key={pathname}
                 initial={{ opacity: 0, scale: 0.98 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.98 }}
                 transition={{ duration: 0.4, ease: "circOut" }}
                 className="p-4 md:p-10 pb-32 max-w-[1600px] mx-auto"
               >
                 {children}
               </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Session Error Alert */}
        <AnimatePresence>
          {sessionError && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-0 inset-x-0 z-[100] bg-rose-600 text-white py-4 px-6 text-center font-bold text-sm shadow-2xl flex items-center justify-center gap-4"
            >
              <ShieldCheck size={20} />
              Security Alert: Session terminated.
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
    </div>
  );
}
