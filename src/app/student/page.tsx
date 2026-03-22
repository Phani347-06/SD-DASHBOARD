"use client";

import { motion } from "framer-motion";
import { 
    Activity, 
    Calendar, 
    MonitorCheck, 
    AlarmClock, 
    ArrowUpRight, 
    History,
    Info
} from "lucide-react";
import Link from "next/link";

const STATS = [
    { label: "Attendance Status", value: "82%", sub: "High Performance", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10", href: "/student/analytics" },
    { label: "Lab Presence", value: "18/22", sub: "Sessions Attended", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10", href: "/student/attendance" },
    { label: "Checked Out", value: "02", sub: "Active Equipment", icon: MonitorCheck, color: "text-[#0052a5]", bg: "bg-blue-500/10", href: "/student/equipment" },
    { label: "Pending Returns", value: "01", sub: "Due in 6 Hours", icon: AlarmClock, color: "text-rose-500", bg: "bg-rose-500/10", href: "/student/equipment" }
];

const SUBJECTS = [
    { name: "DBMS", percentage: 85, color: "bg-emerald-500" },
    { name: "OS", percentage: 70, color: "bg-amber-500" },
    { name: "CN", percentage: 92, color: "bg-emerald-500" },
    { name: "IoT", percentage: 60, color: "bg-rose-500" },
    { name: "Math", percentage: 80, color: "bg-emerald-500" }
];

const ACTIVITIES = [
    { type: "ATTENDANCE", title: "DBMS Lab Attended", time: "2 Hours Ago", status: "VERIFIED", color: "blue" },
    { type: "EQUIPMENT", title: "Multimeter Checked Out", time: "Yesterday, 4 PM", status: "ACTIVE", color: "amber" },
    { type: "EQUIPMENT", title: "ESP32 Board Returned", time: "Mar 18, 11 AM", status: "COMPLETED", color: "green" },
    { type: "ATTENDANCE", title: "OS Lab Missed", time: "Mar 17, 2 PM", status: "ABSENT", color: "red" }
];

export default function Dashboard() {
    return (
        <div className="space-y-12">
            {/* Header Section */}
            <header className="px-4 md:px-0">
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase leading-tight font-display">Matrix Command</h2>
                <p className="text-slate-400 font-bold text-[9px] md:text-sm uppercase tracking-widest leading-none">Institutional Synchronization Node: <span className="text-[#0052a5]">AUTH_NOD_881</span></p>
            </header>

            {/* 1. Hero Stats Board - Matching Faculty Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {STATS.map((stat, i) => (
                    <Link href={stat.href} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#0052a5]/5 transition-all group h-full cursor-pointer"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                    <stat.icon size={24} strokeWidth={2.5} />
                                </div>
                                <ArrowUpRight size={18} className="text-slate-200 group-hover:text-[#0052a5]" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</p>
                            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
                            <p className={`text-[11px] font-bold ${stat.color} uppercase tracking-widest`}>{stat.sub}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* 2. Main Panels Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Attendance Analytics Matrix (8 Cols) */}
                <div className="lg:col-span-8 bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm overflow-hidden relative group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-1">Attendance Analytics Matrix</h3>
                            <p className="text-[10px] uppercase font-black tracking-widest text-[#0052a5]">Real-time Academic Synchronicity</p>
                        </div>
                        <Link href="/student/analytics" className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-full border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                            <History size={16} className="text-[#0052a5]" />
                            <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Sem 04 History</span>
                        </Link>
                    </div>

                    <div className="overflow-x-auto pb-4 -mx-2 md:mx-0 custom-scrollbar">
                        <div className="flex items-end justify-between gap-2 md:gap-8 h-[200px] md:h-[240px] mb-4 md:pr-4 px-2">
                             {SUBJECTS.map((subject, i) => (
                                <div key={i} className="flex-1 min-w-[60px] md:min-w-0 flex flex-col justify-end items-center h-full group/bar relative">

                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: `${subject.percentage}%` }}
                                        transition={{ delay: 0.5 + (i * 0.1), duration: 1, ease: [0.33, 1, 0.68, 1] }}
                                        className={`w-full ${subject.color} rounded-t-[12px] md:rounded-t-[20px] relative shadow-lg shadow-slate-200/50`}
                                    >
                                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-2 px-3 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all pointer-events-none scale-90 group-hover/bar:scale-100 shadow-2xl z-20 whitespace-nowrap">
                                            {subject.percentage}% SYNCED
                                        </div>
                                    </motion.div>
                                    <div className="mt-4 text-center">
                                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-900 line-clamp-1">{subject.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Overlay for the Chart Area */}
                    <div className="absolute inset-x-10 bottom-24 h-px bg-slate-100"></div>
                </div>

                {/* Recent Activity Sync (4 Cols) */}
                <div className="lg:col-span-4 bg-white rounded-[32px] md:rounded-[40px] p-6 md:p-10 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter">Activity Sync</h3>
                        <Activity size={20} className="text-[#0052a5]" />
                    </div>

                    <div className="space-y-6 relative ml-2">
                        {/* Timeline Path */}
                        <div className="absolute top-0 bottom-0 -left-6 w-px bg-slate-100"></div>

                        {ACTIVITIES.map((activity, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 + (i * 0.1) }}
                                className="relative group cursor-default"
                            >
                                {/* Activity Node Anchor */}
                                <div className={`absolute top-2.5 -left-8 w-4 h-4 rounded-full border-4 border-white shadow-md z-10 transition-transform group-hover:scale-125 ${
                                    activity.color === 'blue' ? 'bg-[#0052a5]' : 
                                    activity.color === 'amber' ? 'bg-amber-500' : 
                                    activity.color === 'green' ? 'bg-emerald-500' : 'bg-rose-500'
                                }`}></div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{activity.type}</p>
                                        <div className={`px-2 py-0.5 rounded-full text-[8px] font-black tracking-widest ${
                                            activity.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-600' : 
                                            activity.status === 'ACTIVE' ? 'bg-amber-50 text-amber-600' : 
                                            activity.status === 'ABSENT' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                                        }`}>
                                            {activity.status}
                                        </div>
                                    </div>
                                    <h4 className="text-[13px] font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-[#0052a5] transition-colors">
                                        {activity.title}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400">{activity.time}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <Link href="/student/analytics">
                        <button className="w-full mt-10 py-4 bg-slate-50 rounded-[24px] text-[10px] font-black text-[#0052a5] uppercase tracking-[0.2em] hover:bg-[#0052a5] hover:text-white transition-all duration-300 group">
                            Unlock Full Audit <ArrowUpRight size={14} className="inline ml-2 group-hover:rotate-45 transition-transform" />
                        </button>
                    </Link>
                </div>

            </div>

            {/* Bottom Alert Strip */}
            <div className="bg-[#0052a5] text-white p-6 md:p-8 rounded-[32px] md:rounded-[40px] flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-2xl shadow-blue-900/40 relative overflow-hidden group border border-blue-400/20">
                <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
                    <div className="w-14 md:w-16 h-14 md:h-16 bg-white/10 rounded-2xl md:rounded-3xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                        <Info size={28} />
                    </div>
                    <div>
                        <h4 className="text-lg md:text-xl font-black tracking-tighter leading-none mb-2 capitalize">Secure Lab Access Optimized</h4>
                        <p className="text-white/60 text-xs md:text-sm font-medium leading-relaxed max-w-sm">Your hardware fingerprint is actively anchoring this login node. Handshake confirmed.</p>
                    </div>
                </div>
                <div className="bg-white/20 px-6 md:px-8 py-3 rounded-full text-[10px] md:text-[12px] font-black uppercase tracking-widest backdrop-blur-md relative z-10 border border-white/10 text-center">
                    Symmetrically Encrypted
                </div>
                
                {/* Abstract Visual Elements */}
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-400/10 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute left-1/2 top-0 w-px h-full bg-blue-400/10 -rotate-45"></div>
            </div>
        </div>
    );
}
