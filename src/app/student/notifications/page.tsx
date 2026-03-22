"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Bell, 
    Monitor, 
    AlertCircle, 
    CircleCheckBig, 
    Info, 
    X,
    Clock,
    ArrowUpRight,
    CircleDashed,
    Wifi,
    ShieldCheck,
    Loader2,
    TriangleAlert
} from "lucide-react";
import Link from "next/link";

type LogType = 'ATTENDANCE' | 'EQUIPMENT' | 'GENERAL' | 'SECURITY';

const NOTIF_DATA = [
    { id: 1, type: 'ATTENDANCE' as LogType, title: "Attendance Window Activated", desc: "The institutional beacon is now broadcasting for IoT Lab. Presence validation required in the next 10 minutes.", time: "2 Mins Ago", color: "blue", unread: true, href: "/student/attendance" },
    { id: 2, type: 'SECURITY' as LogType, title: "Successful Handshake", desc: "Your hardware fingerprint has been cryptographically anchored to this session token.", time: "18 Mins Ago", color: "green", unread: false, href: "/student/profile" },
    { id: 3, type: 'EQUIPMENT' as LogType, title: "Return Due Reminder", desc: "Multimeter Rig v2 is due for inventory check in 2 hours. Move to IoT Lab A for return handshake.", time: "1 Hour Ago", color: "amber", unread: true, href: "/student/equipment" },
    { id: 4, type: 'ATTENDANCE' as LogType, title: "Attendance Warning", desc: "Current attendance in CN Lab has dropped to 68%. You are at risk of institutional lock.", time: "Yesterday, 3 PM", color: "red", unread: true, href: "/student/analytics" },
    { id: 5, type: 'EQUIPMENT' as LogType, title: "Overdue Item: Soldering Kit", desc: "Your asset liability is high. Return immediately to prevent account suspension.", time: "Mar 18, 11 AM", color: "red", unread: false, href: "/student/equipment" },
    { id: 6, type: 'GENERAL' as LogType, title: "Institutional Update", desc: "Lab hours extended for mid-term project submissions. Nodes active until 10 PM.", time: "Mar 17, 9 AM", color: "gray", unread: false, href: "/student" }
];

const TABS = ["All Logs", "Attendance", "Equipment", "Security", "Institutional"];

export default function NotificationsPage() {
    const [selectedTab, setSelectedTab] = useState("All Logs");
    const [notifications, setNotifications] = useState(NOTIF_DATA);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSecurityAuditing, setIsSecurityAuditing] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanState, setScanState] = useState("");

    const BREACH_LOGS = [
        { id: 1, event: "Unauthorized Fingerprint Shift", device: "Android Node 10.x", timestamp: "Mar 20, 02:22 PM", action: "AUTO_ROTATE_KEYS" },
        { id: 2, event: "IP Geolocation Mismatch", device: "Browser Hub 4.0", timestamp: "Mar 18, 11:15 AM", action: "TERMINATED_SESSION" }
    ];

    const dismissNotification = (id: number) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsRefreshing(false);
        alert("Matrix Notification Hub Synchronized with Institutional Ledger.");
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
    };

    const filteredNotifications = notifications.filter(notif => {
        if (selectedTab === "All Logs") return true;
        if (selectedTab === "Attendance") return notif.type === 'ATTENDANCE';
        if (selectedTab === "Equipment") return notif.type === 'EQUIPMENT';
        if (selectedTab === "Security") return notif.type === 'SECURITY';
        if (selectedTab === "Institutional") return notif.type === 'GENERAL';
        return true;
    });

    return (
        <div className="space-y-12 pb-20">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Notification Matrix</h2>
                    <p className="text-slate-400 font-medium text-sm capitalize">Real-time synchronized institutional alerts and activity logs.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => { if(confirm("Clear all active notification nodes?")) setNotifications([]); }}
                        className="bg-white border border-slate-100 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 shadow-sm hover:text-slate-900 transition-all active:scale-95"
                    >
                        <CircleCheckBig size={16} /> Clear All
                    </button>
                    <div className="w-12 h-12 rounded-full bg-[#0052a5] text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group">
                        <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                    </div>
                </div>
            </header>

            {/* Filter Hub */}
            <div className="flex items-center gap-4 bg-white p-3 rounded-[32px] border border-slate-100 shadow-sm w-fit overflow-x-auto max-w-full">
                {TABS.map((tab, i) => (
                    <button 
                        key={i}
                        onClick={() => setSelectedTab(tab)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                            selectedTab === tab 
                                ? "bg-[#0052a5] text-white shadow-xl shadow-blue-500/10 scale-105" 
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Notifications Matrix */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {filteredNotifications.map((notif, i) => (
                            <motion.div 
                                key={notif.id}
                                layout
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.05 }}
                                className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm relative group hover:shadow-xl hover:shadow-[#0052a5]/5 transition-all overflow-hidden"
                            >
                                <div className="absolute top-8 right-16 text-[8px] font-black text-slate-100 tracking-widest">NODE_ID_AX_{notif.id}932</div>

                                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-2 h-16 rounded-r-full group-hover:h-32 transition-all duration-500 ${
                                    notif.color === 'blue' ? 'bg-[#0052a5]' : 
                                    notif.color === 'green' ? 'bg-emerald-500' : 
                                    notif.color === 'amber' ? 'bg-amber-500' : 
                                    notif.color === 'red' ? 'bg-rose-500' : 'bg-slate-200'
                                }`}></div>

                                <div className="flex gap-8">
                                    <div className={`w-16 h-16 rounded-[24px] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${
                                        notif.color === 'blue' ? 'bg-blue-50 text-blue-500' : 
                                        notif.color === 'green' ? 'bg-emerald-50 text-emerald-600' : 
                                        notif.color === 'amber' ? 'bg-amber-50 text-amber-500' : 
                                        notif.color === 'red' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                        {notif.type === 'ATTENDANCE' && <Wifi size={32} />}
                                        {notif.type === 'SECURITY' && <ShieldCheck size={32} />}
                                        {notif.type === 'EQUIPMENT' && <Monitor size={32} />}
                                        {notif.type === 'GENERAL' && <Info size={32} />}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <h3 className="text-xl font-black text-slate-900 tracking-tighter capitalize group-hover:text-[#0052a5] transition-colors">{notif.title}</h3>
                                                {notif.unread && (
                                                    <span className="w-2 h-2 bg-[#0052a5] rounded-full animate-pulse shadow-[0_0_8px_#0052a5]"></span>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => dismissNotification(notif.id)}
                                                className="w-10 h-10 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl mb-6">{notif.desc}</p>
                                        
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                <Clock size={12} className="text-[#0052a5]" />
                                                {notif.time}
                                            </div>
                                            <div className="h-px w-8 bg-slate-100"></div>
                                            <Link href={notif.href}>
                                                <button className="text-[10px] font-black uppercase tracking-widest text-[#0052a5] hover:tracking-[0.2em] transition-all flex items-center gap-2 group/link">
                                                    View Source <ArrowUpRight size={12} className="group-hover/link:rotate-45 transition-transform" />
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Sidebar Summary */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-[#0052a5] p-10 rounded-[40px] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <h4 className="text-xl font-black tracking-tighter leading-none mb-2">Matrix Insights</h4>
                            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-10">Historical Node Activity</p>
                            
                            <div className="space-y-6">
                                {[
                                    { label: "Attendance Pulse", val: "High", color: "text-emerald-400" },
                                    { label: "Asset Liability", val: "02 Items", color: "text-amber-400" },
                                    { label: "Security Handshake", val: "SECURE", color: "text-white" }
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-white/50">{stat.label}</span>
                                        <span className={`text-[12px] font-black tracking-widest ${stat.color}`}>{stat.val}</span>
                                    </div>
                                ))}
                            </div>

                            <button 
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="w-full py-4 bg-white text-[#0052a5] rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isRefreshing ? <Loader2 className="animate-spin" size={16} /> : "Refresh Audit Hub"}
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <AlertCircle size={24} className="text-rose-500" />
                            <h4 className="text-lg font-black text-slate-900 tracking-tighter leading-none capitalize">Security Protocol Alert</h4>
                        </div>
                        <p className="text-slate-400 text-sm font-medium mb-8">Unauthorized hardware fingerprint change detected during last cycle attempt. Encryption keys auto-rotated for your protection.</p>
                        <button 
                            onClick={performSecurityAudit}
                            className="w-full py-4 border border-rose-100 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-50 transition-all"
                        >
                            Review Breach Logs
                        </button>
                    </div>
                </div>
            </div>

            {/* Security Audit Overlay */}
            <AnimatePresence>
                {isSecurityAuditing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-white"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white text-slate-900 w-full max-w-2xl rounded-[50px] shadow-2xl p-12 text-center overflow-hidden relative"
                        >
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 bg-rose-500 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/40 relative">
                                    <TriangleAlert size={48} />
                                    <motion.div 
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 border-4 border-rose-400 rounded-[32px]"
                                    ></motion.div>
                                </div>
                                <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase text-rose-600">Forensic Security Audit</h3>
                                <p className="text-slate-400 text-sm font-medium mb-10 max-w-xs mx-auto">{scanState}</p>
                                
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-12">
                                    <motion.div 
                                        animate={{ width: `${scanProgress}%` }}
                                        className="h-full bg-rose-500"
                                    ></motion.div>
                                </div>

                                {scanProgress === 100 && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-4 mb-10">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-left mb-4">Forensic Log History</h4>
                                        {BREACH_LOGS.map(log => (
                                            <div key={log.id} className="bg-slate-50 p-6 rounded-3xl flex items-center justify-between border border-slate-100">
                                                <div className="text-left">
                                                    <p className="text-[13px] font-black tracking-tight text-slate-900 mb-1">{log.event}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{log.device}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-rose-500 mb-1">{log.action}</p>
                                                    <p className="text-[10px] font-bold text-slate-400">{log.timestamp}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}

                                <button 
                                    onClick={() => setIsSecurityAuditing(false)}
                                    className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em]"
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
