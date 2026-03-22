"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Box, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowRightLeft, 
  HardDrive, 
  ShieldCheck, 
  X,
  Loader2,
  Tag,
  Activity,
  History,
  Cpu,
  MonitorCheck,
  Zap
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface InventoryItem {
  id: string;
  name: string;
  tag_id: string;
  category: string;
  status: "IN LAB" | "USING" | "MISSING";
  student?: string;
  last_seen: string;
  overdue?: boolean;
}

interface RFIDEvent {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  type: "checkout" | "return" | "missing";
}

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  
  // LIVE DATA
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [events, setEvents] = useState<RFIDEvent[]>([]);

  // FORM STATES
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Electronics");
  const [newItemTag, setNewItemTag] = useState("");

  useEffect(() => {
    fetchInitialData();

    // ⚡ REAL-TIME SUBSCRIPTION FOR AGENTIC OVERSIGHT
    const invChannel = supabase
      .channel('inventory_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
         console.log("Real-time Update:", payload);
         handleRealTimeUpdate(payload);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rfid_events' }, fetchEvents)
      .subscribe();

    return () => {
      supabase.removeChannel(invChannel);
    };
  }, []);

  const handleRealTimeUpdate = (payload: any) => {
     if (payload.eventType === 'INSERT') {
        const newItem = payload.new;
        setInventory(prev => [{
           id: newItem.id,
           name: newItem.name,
           tag_id: newItem.tag_id,
           category: newItem.category,
           status: newItem.status,
           last_seen: "Just Now",
           overdue: newItem.overdue
        }, ...prev]);
     } else if (payload.eventType === 'UPDATE') {
        setInventory(prev => prev.map(item => 
           item.id === payload.new.id ? { ...item, status: payload.new.status, last_seen: "Just Now", overdue: payload.new.overdue } : item
        ));
     } else if (payload.eventType === 'DELETE') {
        setInventory(prev => prev.filter(item => item.id !== payload.old.id));
     }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchInventory(), fetchEvents()]);
    setLoading(false);
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select(`*, students(full_name)`);
    if (data) {
       setInventory(data.map((item: any) => ({
         id: item.id,
         name: item.name,
         tag_id: item.tag_id,
         category: item.category,
         status: item.status,
         student: item.students?.full_name || null,
         last_seen: new Date(item.last_seen).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
         overdue: item.overdue
       })));
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from('rfid_events').select(`*, inventory(name)`).order('timestamp', { ascending: false }).limit(5);
    if (data) {
       setEvents(data.map((ev: any) => ({
         id: ev.id,
         title: `${ev.inventory?.name || "Unit"} ${ev.type === 'checkout' ? 'Assigned' : ev.type === 'return' ? 'Returned' : 'Signal Lost'}`,
         subtitle: ev.details || "Telemetry Handshake Verified",
         timestamp: new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
         type: ev.type as any
       })));
    }
  };

  const simulateHardwareScan = async (id: string, dir: 'OUT' | 'IN') => {
     const item = inventory.find(i => i.id === id);
     if (!item) return;

     try {
        await fetch('/api/rfid/event', {
           method: 'POST',
           body: JSON.stringify({ tag_id: item.tag_id, direction: dir })
        });
        // Real-time listener handles the UI update
     } catch (err) {
        console.error("Simulation Node Error:", err);
     }
  };

  const handleUpdateStatus = async (id: string, newStatus: InventoryItem["status"]) => {
    try {
      await supabase.from('inventory').update({ status: newStatus, last_seen: new Date().toISOString() }).eq('id', id);
      setConfirmingId(null);
    } catch (err) { console.error("Sync Error:", err); }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.tag_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "All" || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 relative">
      
      {/* 1. Page Header with Glass Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/50 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-white/50 shadow-sm sticky top-0 z-20 mx-2 md:mx-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">Institutional Inventory</h1>
          <p className="text-[11px] md:text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             Node: <span className="text-[#0052a5]">Matrix R&D North</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
           <button 
             onClick={() => setShowSimulator(!showSimulator)} 
             className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl md:rounded-2xl border text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all ${
               showSimulator ? 'bg-amber-500 text-white border-amber-600 shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50 shadow-sm'
             }`}>
              <Cpu size={14} md-size={16} /> Hardware Terminal
           </button>
           <button 
             onClick={() => setShowAddDrawer(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0052a5] hover:bg-[#00438a] text-white rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-extrabold uppercase tracking-widest shadow-lg shadow-blue-900/10 transition-all active:scale-95 group"
           >
             <Plus size={16} md-size={18} className="group-hover:rotate-90 transition-transform" />
             Initialize Asset
           </button>
        </div>
      </div>

      {/* 2. Advanced Stats with Framer Motion */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
         {[
           { label: "Matrix Inventory", value: inventory.length, sub: "Synchronized", icon: HardDrive, color: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "" },
           { label: "Active Checkouts", value: inventory.filter(i => i.status === "USING").length, sub: "Security Verified", icon: ArrowRightLeft, color: "amber", bg: "bg-amber-50", text: "text-amber-600", border: "" },
           { label: "Signal Alerts", value: inventory.filter(i => i.status === "MISSING").length, sub: "Critical Escallation", icon: ShieldCheck, color: "rose", bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
           { label: "Health Score", value: `${((inventory.filter(i => i.status === "IN LAB").length / Math.max(inventory.length, 1)) * 100).toFixed(0)}%`, sub: "Operational Status", icon: MonitorCheck, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", border: "" }
         ].map((stat, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ delay: i * 0.1 }}
             className={`bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-900/5 transition-all ${stat.border}`}
           >
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                 <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">{stat.value}</h3>
                 <p className={`text-[10px] font-black uppercase tracking-widest ${stat.text} flex items-center gap-1.5`}>
                    <Zap size={10} fill="currentColor" /> {stat.sub}
                 </p>
              </div>
              <div className={`absolute -right-6 -bottom-6 w-24 h-24 ${stat.bg} rounded-full flex items-center justify-center opacity-40 group-hover:scale-125 transition-transform duration-700`}>
                 <stat.icon size={44} className={stat.text} />
              </div>
           </motion.div>
         ))}
      </motion.div>

      {/* 3. Main Data Core */}
      <div className="grid grid-cols-12 gap-6 md:gap-8">
         <div className="col-span-12 lg:col-span-8 bg-white rounded-3xl md:rounded-[40px] border border-slate-100 shadow-sm relative overflow-hidden flex flex-col min-h-[500px] md:min-h-[600px]">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 px-6 md:px-10 pt-8 md:pt-10 pb-8 border-b border-slate-50">
               <div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight uppercase">Inventory Matrix</h4>
                  <p className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time Telemetry Oversight</p>
               </div>
               
               <div className="flex flex-wrap bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100">
                  {["All", "IN LAB", "USING"].map((status) => (
                     <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? "bg-[#0052a5] text-white shadow-lg" : "text-slate-400 hover:text-slate-700"}`}
                     >
                        {status}
                     </button>
                  ))}
               </div>
            </div>

            <div className="overflow-x-auto px-2 md:px-4 custom-scrollbar">
               <table className="w-full text-left min-w-[700px]">
                  <thead>
                     <tr className="border-b border-slate-50/50">
                        <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Unit</th>
                        <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status Check</th>
                        <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Roster Anchor</th>
                        <th className="px-6 py-6 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     <AnimatePresence>
                        {filteredInventory.map((item) => (
                           <motion.tr 
                             key={item.id} 
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             exit={{ opacity: 0, scale: 0.9 }}
                             className="group hover:bg-slate-50/40 transition-all duration-300 relative"
                           >
                              <td className="px-6 py-8">
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:border-[#0052a5] group-hover:text-[#0052a5] shadow-sm transition-all duration-500">
                                       <Box size={22} />
                                    </div>
                                    <div>
                                       <p className="font-extrabold text-slate-900 text-[15px] leading-tight mb-1">{item.name}</p>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">{item.tag_id}</span>
                                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{item.category}</span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-8">
                                 <div className="flex flex-col gap-2">
                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 w-fit transition-all duration-500 ${
                                       item.status === 'IN LAB' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                                       item.status === 'USING' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 
                                       'bg-rose-50 text-rose-600 border border-rose-100 shadow-[0_0_15px_rgba(225,29,72,0.1)]'
                                    }`}>
                                       <div className={`w-2 h-2 rounded-full ${item.status === 'IN LAB' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : item.status === 'USING' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-rose-500 animate-ping shadow-[0_0_15px_#f43f5e]'}`}></div>
                                       {item.status}
                                    </span>
                                    {item.overdue && item.status === "USING" && (
                                       <div className="flex items-center gap-1.5 text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">
                                          <ShieldCheck size={10} /> Session Threshold Exceeded
                                       </div>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-8">
                                 {item.student ? (
                                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-100 w-fit group-hover:border-[#0052a5]/30 transition-all">
                                       <img src={`https://i.pravatar.cc/100?u=${item.student}`} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                                       <span className="font-black text-slate-700 text-[11px] uppercase tracking-wider">{item.student}</span>
                                    </div>
                                 ) : (
                                    <span className="text-slate-300 font-bold italic text-[11px] ml-4">Stationed Unit</span>
                                 )}
                              </td>
                              <td className="px-6 py-8 text-right">
                                 {confirmingId === item.id ? (
                                    <div className="flex items-center justify-end gap-2 animate-in slide-in-from-right-2">
                                       <button onClick={() => setConfirmingId(null)} className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
                                       <button onClick={() => handleUpdateStatus(item.id, "MISSING")} className="px-4 py-2 bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-900/20">Confirm Signal Lost</button>
                                    </div>
                                 ) : (
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                       {item.status !== "IN LAB" && (
                                          <button 
                                            onClick={() => handleUpdateStatus(item.id, "IN LAB")}
                                            className="px-4 py-2.5 bg-[#0052a5] text-white text-[10px] font-black uppercase tracking-widest rounded-1.5xl hover:bg-[#00438a] transition-all shadow-xl shadow-blue-900/10"
                                          >
                                             Recover Unit
                                          </button>
                                       )}
                                       {item.status !== "MISSING" && (
                                          <button 
                                            onClick={() => setConfirmingId(item.id)}
                                            className="w-11 h-11 bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 rounded-2xl transition-all"
                                          >
                                             <ShieldCheck size={20} />
                                          </button>
                                       )}
                                    </div>
                                 )}
                              </td>
                           </motion.tr>
                        ))}
                     </AnimatePresence>
                  </tbody>
               </table>
            </div>
         </div>

         {/* 4. RFID Activity Ticker with Custom Scroll */}
         <div className="col-span-12 lg:col-span-4 space-y-6 md:space-y-8">
            <div className="bg-[#0052a5] rounded-3xl md:rounded-[40px] p-6 md:p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6 md:mb-8">
                     <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-blue-100 ring-1 ring-white/20">
                        <Zap size={20} fill="currentColor" />
                     </div>
                     <div>
                        <h4 className="text-lg font-black tracking-tight leading-none uppercase">RFID Pulse</h4>
                        <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest mt-1">Live Telemetry Stream</p>
                     </div>
                  </div>

                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                     {events.map((event) => (
                        <motion.div 
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-md border border-white/10 p-5 rounded-[24px] hover:bg-white/15 transition-all group"
                        >
                           <div className="flex justify-between items-start mb-3">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                                 event.type === 'checkout' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-900'
                              }`}>
                                 {event.type}
                              </span>
                              <span className="text-[10px] font-bold text-white/40">{event.timestamp}</span>
                           </div>
                           <h5 className="text-[13px] font-black text-white group-hover:text-amber-200 transition-colors uppercase tracking-tight leading-none mb-1">{event.title}</h5>
                           <p className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{event.subtitle}</p>
                        </motion.div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="bg-[#fcfdff] rounded-[40px] p-8 border border-slate-100 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-[#0052a5]">
                     <MonitorCheck size={16} />
                  </div>
                  <h4 className="text-md font-black text-slate-800 tracking-tight">System Status</h4>
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">RFID Node Sync</span>
                     <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-emerald-100">Synchronized</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100">
                     <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Database Latency</span>
                     <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-tighter border border-blue-100">12ms</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 5. Floating Hardware Hub (Simulator) */}
      <AnimatePresence>
         {showSimulator && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-10 inset-x-0 mx-auto w-fit z-50 rounded-[32px] bg-slate-900/90 backdrop-blur-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10"
            >
               <div className="flex items-center gap-6 px-4">
                  <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                     <Cpu className="text-blue-400" size={24} />
                     <div>
                        <p className="text-[9px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">Hardware Terminal</p>
                        <p className="text-[11px] font-bold text-white/50 tracking-tight">Select Unit to Mock Scan</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3 max-w-sm overflow-x-auto py-2 pr-4 custom-scrollbar">
                     {inventory.slice(0, 5).map(item => (
                        <button 
                          key={item.id}
                          onClick={() => simulateHardwareScan(item.id, item.status === 'IN LAB' ? 'OUT' : 'IN')}
                          className="flex-shrink-0 px-4 py-2 bg-white/5 hover:bg-[#0052a5] text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all active:scale-90"
                        >
                           {item.name.split(' ')[0]} {item.status === 'IN LAB' ? 'OUT' : 'IN'}
                        </button>
                     ))}
                  </div>
                  <button onClick={() => setShowSimulator(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* 6. Add Item Drawer */}
      <AnimatePresence>
         {showAddDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-[#000d1a]/60 backdrop-blur-md"
                 onClick={() => setShowAddDrawer(false)}
               ></motion.div>
               <motion.div 
                 initial={{ x: "100%" }}
                 animate={{ x: 0 }}
                 exit={{ x: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 120 }}
                 className="relative w-full max-w-lg bg-white h-full shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col"
               >
                  <div className="bg-[#0052a5] p-12 text-white relative flex-shrink-0 overflow-hidden">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-40 -mt-40"></div>
                     <button onClick={() => setShowAddDrawer(false)} className="absolute top-10 right-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all active:scale-90"><X size={24} /></button>
                     <Zap size={48} className="mb-8 opacity-20" fill="currentColor" />
                     <h3 className="text-4xl font-black tracking-tighter mb-4">Initialize Unit</h3>
                     <p className="text-[12px] font-bold text-blue-100 uppercase tracking-[0.2em] opacity-80">Provisioning Institutional Asset into Matrix R&D</p>
                  </div>
                  <form className="flex-1 overflow-y-auto p-12 space-y-10" onSubmit={(e) => {
                     e.preventDefault();
                     handleUpdateStatus("mock", "IN LAB"); // Close drawer
                     setShowAddDrawer(false);
                  }}>
                     <div className="space-y-8">
                        <div className="group">
                           <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3 group-hover:text-[#0052a5] transition-colors">Unit Identifier Label</label>
                           <input type="text" placeholder="e.g., Tektronix Logic Analyzer #4" className="w-full px-8 py-5 border border-slate-100 rounded-[24px] text-[15px] font-extrabold bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0052a5] transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Hardware Class</label>
                              <select className="w-full px-6 py-5 border border-slate-100 rounded-[24px] text-[13px] font-black bg-slate-50 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                                 <option>Electronics</option>
                                 <option>Diagnostics</option>
                                 <option>Precision Hardware</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Lab Node Target</label>
                              <select className="w-full px-6 py-5 border border-slate-100 rounded-[24px] text-[13px] font-black bg-slate-50 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500/10">
                                 <option>R&D North</option>
                                 <option>Assembly B</option>
                              </select>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">RFID Anchor (Tag ID)</label>
                           <div className="flex gap-4">
                              <input type="text" placeholder="RFID-000" className="flex-1 px-8 py-5 border border-slate-100 rounded-[24px] text-[16px] font-black tracking-[0.3em] bg-[#fdfdff] focus:outline-none focus:border-[#0052a5]" />
                              <button type="button" className="w-[72px] h-[72px] bg-white border border-slate-100 hover:border-[#0052a5] rounded-3xl flex items-center justify-center text-[#0052a5] transition-all shadow-sm hover:shadow-xl hover:shadow-blue-500/10"><Activity size={24} /></button>
                           </div>
                        </div>
                     </div>
                     <button className="w-full py-6 bg-[#0052a5] hover:bg-[#00438a] text-white text-[14px] font-black uppercase tracking-[0.2em] rounded-[32px] shadow-2xl shadow-blue-900/30 transition-all hover:translate-y-[-2px] active:scale-95 flex items-center justify-center gap-3">
                        Initialize Provisioning <ChevronRight size={20} />
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
         }
         .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
         }
         .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
         }
         .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
         }
      `}</style>

    </div>
  );
}
