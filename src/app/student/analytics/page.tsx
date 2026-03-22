"use client";

import { motion } from "framer-motion";
import { 
    Activity, 
    Calendar, 
    ChartColumn, 
    ChartSpline, 
    ArrowUpRight,
    ArrowDownRight,
    Info,
    CalendarCheck,
    Clock,
    Zap,
    Scale,
    Download
} from "lucide-react";

const ANALYTICS_STATS = [
    { label: "Overall Attendance", value: "88.4%", change: "+2.5%", trend: "up", color: "emerald", bg: "bg-emerald-50 text-emerald-600" },
    { label: "Lab Synchronicity", value: "94.2%", change: "-0.8%", trend: "down", color: "amber", bg: "bg-rose-50 text-rose-600" },
    { label: "Equipment Handshake", value: "100%", change: "Stable", trend: "stable", color: "blue", bg: "bg-blue-50 text-[#0052a5]" },
    { label: "Academic Pulse", value: "Elite", change: "Top 5%", trend: "up", color: "rose", bg: "bg-emerald-50 text-emerald-600" }
];

const SUBJECT_PERFORMANCE = [
    { name: "DBMS Lab", attendance: 92, target: 85, sessions: "12/13" },
    { name: "OS Lab", attendance: 78, target: 80, sessions: "10/13" },
    { name: "CN Lab", attendance: 95, target: 85, sessions: "13/14" },
    { name: "IoT Lab", attendance: 88, target: 85, sessions: "11/12" },
    { name: "Math Lab", attendance: 84, target: 75, sessions: "09/11" }
];

export default function AnalyticsPage() {
    const handleDownloadLog = () => {
        alert("Downloading cryptographically signed audit ledger for Semester 04. Check your institutional security folder.");
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 font-display">Institutional Analytics Matrix</h2>
                    <p className="text-slate-400 font-medium text-xs md:text-sm leading-relaxed">Synchronized Academic Performance Pulse & Trend Analytics.</p>
                </div>
                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white border border-slate-100 rounded-full flex items-center gap-3 shadow-sm group hover:shadow-lg transition-all cursor-default">
                        <Calendar size={16} className="text-[#0052a5]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Semester 04 Hub</span>
                    </div>
                </div>
            </header>

            {/* 1. High Velocity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {ANALYTICS_STATS.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-[#0052a5]/5 transition-all h-full"
                    >
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:scale-110 group-hover:bg-[#0052a5] group-hover:text-white transition-all duration-500">
                                {stat.label.includes("Overall") && <ChartColumn size={24} />}
                                {stat.label.includes("Synchronicity") && <Zap size={24} />}
                                {stat.label.includes("Handshake") && <Scale size={24} />}
                                {stat.label.includes("Pulse") && <Activity size={24} />}
                            </div>
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest ${stat.bg}`}>
                                {stat.trend === 'up' && <ArrowUpRight size={12} />}
                                {stat.trend === 'down' && <ArrowDownRight size={12} />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 2. Main Analytics Command Board */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Horizontal Performance Grid (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm relative group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-1">Laboratory Performance Breakdown</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#0052a5]">Institutional Ledger Synchronization</p>
                        </div>
                        <ChartSpline size={20} className="text-slate-200 group-hover:text-[#0052a5] transition-colors" />
                    </div>

                    <div className="space-y-10">
                        {SUBJECT_PERFORMANCE.map((sub, i) => (
                            <div key={i} className="group">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-2 h-2 rounded-full bg-[#0052a5] animate-pulse"></div>
                                        <h4 className="text-[13px] md:text-[14px] font-black text-slate-900 tracking-tight group-hover:text-[#0052a5] transition-colors">{sub.name}</h4>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-6 md:gap-8 bg-slate-50/50 md:bg-transparent p-3 md:p-0 rounded-2xl">
                                        <div className="text-left md:text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Handshakes</p>
                                            <p className="text-[11px] md:text-[12px] font-black text-slate-900">{sub.sessions}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Integrity</p>
                                            <p className={`text-[11px] md:text-[12px] font-black ${sub.attendance >= sub.target ? "text-emerald-500" : "text-rose-500"}`}>{sub.attendance}%</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-4 bg-slate-50 rounded-full overflow-hidden relative border border-slate-100/50">
                                    <div className="absolute top-0 bottom-0 w-px bg-slate-200 z-10" style={{ left: `${sub.target}%` }}></div>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${sub.attendance}%` }} transition={{ delay: 0.8 + (i * 0.1), duration: 1 }} className={`h-full rounded-full relative ${sub.attendance >= sub.target ? "bg-[#0052a5]" : "bg-rose-500"}`}></motion.div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <Info size={20} className="text-[#0052a5]" />
                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">
                            Your performance is calculated using high-fidelity cryptographic signatures from BLE beacons. Maintaining academic synchronicity above 85% is recommended for elite protocol standing.
                        </p>
                    </div>
                </div>

                {/* Vertical Trend Hub (4 Cols) */}
                <div className="lg:col-span-4 space-y-8 md:space-y-10">
                    <div className="bg-[#0052a5] p-6 md:p-10 rounded-[32px] md:rounded-[40px] text-white shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            <h4 className="text-xl font-black tracking-tighter leading-none">Weekly Trend Cycle</h4>
                            <div className="flex items-end gap-2 md:gap-3 h-24 md:h-32">
                                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 1.2 + (i * 0.1) }} className="flex-1 bg-white/20 rounded-t-md md:rounded-t-lg hover:bg-white/40 transition-colors"></motion.div>
                                ))}
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-200">
                                <span>Mon</span>
                                <span>Sun</span>
                            </div>
                            <button 
                                onClick={handleDownloadLog}
                                className="w-full py-4 bg-white/10 hover:bg-white text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10 hover:text-[#0052a5] flex items-center justify-center gap-3 rounded-[20px]"
                            >
                                <Download size={14} /> Download Audit Log
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm group">
                        <h4 className="text-lg font-black text-slate-900 tracking-tighter mb-8 capitalize">Institutional Milestones</h4>
                        <div className="space-y-6 md:space-y-8">
                            {[
                                { label: "Perfect Week", date: "Mar 15", icon: CalendarCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
                                { label: "Elite Attendance", date: "Feb 28", icon: Clock, color: "text-[#0052a5]", bg: "bg-blue-50" },
                                { label: "Protocol Compliance", date: "Jan 12", icon: Scale, color: "text-amber-500", bg: "bg-amber-50" }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-4 md:gap-6 group/milestone cursor-default hover:scale-105 transition-transform origin-left">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl ${badge.bg} ${badge.color} flex items-center justify-center`}>
                                        <badge.icon className="w-5 h-5 md:w-6 md:h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] md:text-[12px] font-black text-slate-900 leading-none mb-1">{badge.label}</p>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{badge.date} Sync</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
