"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Monitor, 
    History as HistoryIcon, 
    ArrowUpRight, 
    Clock, 
    Package, 
    QrCode, 
    CheckCircle2,
    Calendar,
    ArrowLeftRight,
    Search,
    ChevronRight,
    Info,
    X,
    Loader2
} from "lucide-react";

const ACTIVE_EQUIPMENT = [
    { name: "Multimeter Rig v2", tag: "TAG_M0922", location: "IoT Lab A", status: "Due Soon", color: "amber", countdown: "6 Hours Remaining", checkOut: "Mar 21, 10:45 AM" },
    { name: "Soldering Kit", tag: "TAG_S9102", location: "Main Workshop", status: "On Time", color: "green", countdown: "2 Days Remaining", checkOut: "Mar 20, 02:22 PM" }
];

const HISTORY = [
    { item: "ESP32 Dev Module", tag: "TAG_E001", mode: "RETURNED", date: "Mar 18, 2026", duration: "3 Days", status: "SUCCESS" },
    { item: "Power Supply 30V", tag: "TAG_P088", mode: "RETURNED", date: "Mar 15, 2026", duration: "1 Hour", status: "SUCCESS" },
    { item: "Jumper Wire Set", tag: "TAG_W991", mode: "LOST/PAID", date: "Mar 12, 2026", duration: "N/A", status: "FAILED" },
    { item: "Breadboard Large", tag: "TAG_B112", mode: "RETURNED", date: "Mar 10, 2026", duration: "5 Hours", status: "SUCCESS" }
];

export default function EquipmentPage() {
    const [isScanning, setIsScanning] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredHistory = HISTORY.filter(item => 
        item.item.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleExport = () => {
        alert("Inventory Ledger Export Initiated. Check your secure institutional node for the encrypted PDF.");
    };

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2 md:px-0">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase">Asset Node</h2>
                    <p className="text-slate-400 font-bold text-[10px] md:text-sm uppercase tracking-widest leading-none">Vanguard Inventory Protocol</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsScanning(true)}
                        className="w-full md:w-auto bg-white border border-slate-100 px-6 py-4 rounded-xl md:rounded-full text-[10px] font-black uppercase tracking-widest text-[#0052a5] flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all active:scale-95"
                    >
                        <QrCode size={16} /> Quick Checkout
                    </button>
                </div>
            </header>

            {/* 1. Currently Checked Out Row */}
            <section className="space-y-6">
                <div className="flex items-center gap-4 pl-4">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Active Assets</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-4">
                    {ACTIVE_EQUIPMENT.map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white rounded-[40px] border border-slate-100 p-10 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-[#0052a5]/5 transition-all"
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="p-5 rounded-3xl bg-slate-50 text-slate-400 group-hover:bg-[#0052a5] group-hover:text-white transition-all transform group-hover:rotate-6">
                                    <Monitor size={32} strokeWidth={2.5} />
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${
                                    item.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                                }`}>
                                    {item.status}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter leading-none mb-2">{item.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0052a5]">{item.tag}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Source Node</p>
                                        <p className="text-[13px] font-bold text-slate-700">{item.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-1">Timestamp</p>
                                        <p className="text-[13px] font-bold text-slate-700">{item.checkOut}</p>
                                    </div>
                                </div>

                                <div className={`mt-6 p-6 rounded-[30px] flex items-center justify-between ${
                                    item.color === 'amber' ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-[#0052a5] text-white shadow-xl shadow-blue-500/20'
                                }`}>
                                    <div className="flex items-center gap-4">
                                        <Clock size={20} />
                                        <span className="text-[13px] font-black tracking-tight">{item.countdown}</span>
                                    </div>
                                    <button className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all">
                                        <ArrowUpRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div 
                        onClick={() => setIsScanning(true)}
                        className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] md:rounded-[40px] flex flex-col items-center justify-center p-8 md:p-10 group cursor-pointer hover:border-[#0052a5] hover:bg-white transition-all min-h-[300px] md:min-h-[400px]"
                    >
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 group-hover:scale-110 group-hover:text-[#0052a5] transition-all shadow-sm">
                            <ArrowLeftRight size={24} />
                        </div>
                        <p className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors">Checkout New Asset</p>
                    </div>
                </div>
            </section>

            {/* 2. Full Asset History Table */}
            <section className="bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-4">
                        <HistoryIcon size={24} className="text-[#0052a5]" />
                        <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter uppercase">Inventory Ledger</h3>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <button 
                            onClick={handleExport}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0052a5] transition-colors text-left"
                        >
                            Export Node Data
                        </button>
                        <div className="hidden md:block h-4 w-px bg-slate-100"></div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Audit logs..." 
                                className="w-full bg-slate-50 border-none rounded-xl md:rounded-full py-3.5 pl-12 pr-6 text-[11px] font-black tracking-widest focus:ring-2 focus:ring-blue-100 transition-all" 
                            />
                        </div>
                    </div>
                </div>

                 <div className="overflow-x-auto custom-scrollbar -mx-4 md:mx-0 pr-4 md:pr-0">
                    <div className="min-w-[600px] md:min-w-0">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                <th className="text-left pb-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Node Asset</th>
                                <th className="text-left pb-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Inventory Mode</th>
                                <th className="text-left pb-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Session Date</th>
                                <th className="text-left pb-6 text-[10px] uppercase font-black tracking-[0.2em] text-slate-400">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.map((log, i) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors cursor-default">
                                    <td className="py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#0052a5] group-hover:text-white transition-all transform group-hover:rotate-6">
                                                <Package size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[14px] font-black text-slate-900 tracking-tight leading-none mb-1 capitalize transition-colors">{log.item}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[#0052a5]">{log.tag}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${
                                            log.mode === 'RETURNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${log.mode === 'RETURNED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                            {log.mode}
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                            <Calendar size={14} />
                                            <span className="text-[12px] font-bold">{log.date}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                            <Clock size={14} />
                                            <span className="text-[12px] font-bold">{log.duration}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>

                <div className="mt-12 p-8 bg-slate-50 rounded-[40px] flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0052a5] shadow-sm">
                            <Info size={24} />
                        </div>
                        <div>
                            <p className="text-[14px] font-black tracking-tight text-slate-900">Total Asset Liability: 02 Active Items</p>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Calculated by Institutional Audit Node</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => alert("Redirecting to Institutional Asset Policy Node...")}
                        className="text-[11px] font-black uppercase tracking-widest text-[#0052a5] hover:tracking-[0.2em] transition-all"
                    >
                        Audit Policies <ChevronRight size={14} className="inline ml-1" />
                    </button>
                </div>
            </section>

            {/* Quick Checkout Modal Overlay */}
            <AnimatePresence>
                {isScanning && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 relative overflow-hidden"
                        >
                            <button 
                                onClick={() => setIsScanning(false)}
                                className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-[#0052a5]/5 text-[#0052a5] rounded-[32px] flex items-center justify-center mb-8">
                                    <QrCode size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-4">Initialize Checkout</h3>
                                <p className="text-slate-400 text-sm font-medium mb-8">Point your device at the asset's digital identity node (QR) or NFC anchor to verify physical possession.</p>
                                
                                <div className="w-full aspect-square bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-300 mb-8">
                                    <Loader2 size={40} className="animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Identity Handshake...</p>
                                </div>

                                <button 
                                    onClick={() => setIsScanning(false)}
                                    className="w-full py-5 bg-[#0052a5] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20"
                                >
                                    Cancel Authentication
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
