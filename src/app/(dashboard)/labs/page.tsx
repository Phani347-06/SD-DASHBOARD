"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  FlaskConical, 
  Plus, 
  Search, 
  ChevronRight, 
  Trash2, 
  PlusCircle, 
  Loader2, 
  ShieldCheck, 
  QrCode,
  UserPlus,
  Link as LinkIcon,
  Copy,
  CheckCircle2
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Lab {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Student {
  id: string;
  full_name: string;
  roll_no: string;
  department: string;
}

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [labStudents, setLabStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  
  // Create Lab State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLabName, setNewLabName] = useState("");
  const [newLabDesc, setNewLabDesc] = useState("");
  
  // Add Student State
  const [rollNoSearch, setRollNoSearch] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchLabs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('labs')
      .select('*')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) setLabs(data);
    setLoading(false);
  };

  const fetchLabStudents = async (labId: string) => {
    const { data, error } = await supabase
      .from('lab_students')
      .select(`
        student_id,
        students (
          id,
          full_name,
          roll_no,
          department
        )
      `)
      .eq('lab_id', labId);

    if (!error && data) {
      setLabStudents(data.map((item: any) => item.students));
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateLab = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setAddLoading(true);
    const { data, error } = await supabase
      .from('labs')
      .insert({
        name: newLabName,
        description: newLabDesc,
        created_by: user.id
      })
      .select()
      .single();

    if (!error && data) {
      setLabs([data, ...labs]);
      setShowCreateModal(false);
      setNewLabName("");
      setNewLabDesc("");
    }
    setAddLoading(false);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLab || !rollNoSearch) return;

    setAddLoading(true);
    setErrorMsg("");

    try {
      // 1. Find student by roll_no
      const { data: student, error: sError } = await supabase
        .from('students')
        .select('*')
        .eq('roll_no', rollNoSearch.toUpperCase())
        .single();

      if (sError || !student) {
        setErrorMsg("Institutional record not found for this Roll Number.");
        return;
      }

      // 2. Add to junction table
      const { error: jError } = await supabase
        .from('lab_students')
        .insert({
          lab_id: selectedLab.id,
          student_id: student.id
        });

      if (jError) {
        if (jError.code === '23505') setErrorMsg("This student is already whitelisted in this Lab group.");
        else throw jError;
        return;
      }

      // 3. Update local state
      setLabStudents([...labStudents, student]);
      setRollNoSearch("");
    } catch (err: any) {
      setErrorMsg("Whitelist Error: " + (err.message || "Protocol interrupted."));
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedLab) return;
    
    const { error } = await supabase
      .from('lab_students')
      .delete()
      .eq('lab_id', selectedLab.id)
      .eq('student_id', studentId);

    if (!error) {
      setLabStudents(labStudents.filter(s => s.id !== studentId));
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Page Header */}
      {/* 1. Page Header with Glass Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/50 backdrop-blur-xl p-6 md:p-8 rounded-2xl md:rounded-[32px] border border-white/50 shadow-sm sticky top-0 z-20 mx-1 md:mx-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 uppercase">Laboratory Roster</h1>
          <p className="text-[11px] md:text-[13px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-[#0052a5] animate-pulse"></div>
             Node Infrastructure: <span className="text-[#0052a5]">VNR Vignana Jyothi</span>
          </p>
        </div>
        <div className="flex w-full md:w-auto items-center gap-3">
           <button 
             onClick={() => setShowCreateModal(true)}
             className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-[#0052a5] hover:bg-[#00438a] text-white rounded-xl md:rounded-2xl text-[11px] md:text-[12px] font-extrabold uppercase tracking-widest shadow-lg shadow-blue-900/10 transition-all active:scale-95 group"
           >
             <PlusCircle size={16} md-size={18} className="group-hover:rotate-90 transition-transform" />
             Create Lab Node
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Lab Roster Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
             <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Current Laboratory List</h3>
             
             {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                   <Loader2 size={24} className="text-[#0052a5] animate-spin" />
                   <p className="text-[10px] font-bold text-slate-400">Synchronizing Matrix...</p>
                </div>
             ) : labs.length === 0 ? (
                <div className="py-12 text-center">
                   <FlaskConical size={32} className="text-slate-200 mx-auto mb-4" />
                   <p className="text-[11px] font-medium text-slate-500">No labs initialized. Use the &apos;Initialize&apos; portal to start.</p>
                </div>
             ) : (
                <div className="space-y-3">
                   {labs.map((lab) => (
                      <button 
                        key={lab.id}
                        onClick={() => { setSelectedLab(lab); fetchLabStudents(lab.id); }}
                        className={`w-full group text-left p-4 rounded-2xl transition-all border ${selectedLab?.id === lab.id ? 'bg-[#f0f7ff] border-blue-200 shadow-sm ring-1 ring-blue-500/10' : 'bg-[#fcfdff] border-slate-50 hover:border-blue-100 hover:bg-slate-50/50'}`}
                      >
                         <div className="flex justify-between items-center">
                            <span className={`text-[13px] font-black ${selectedLab?.id === lab.id ? 'text-[#0052a5]' : 'text-slate-700'}`}>{lab.name}</span>
                            <ChevronRight size={16} className={`${selectedLab?.id === lab.id ? 'text-[#0052a5] translate-x-1' : 'text-slate-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'} transition-all`} />
                         </div>
                         <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest truncate">{lab.description || "Experimental Node"}</p>
                      </button>
                   ))}
                </div>
             )}
           </div>
        </div>

        {/* Student Enrollment Control */}
        <div className="col-span-12 lg:col-span-8">
           {selectedLab ? (
              <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                 {/* Lab Details & Add Form */}
                 <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none opacity-50"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-slate-50">
                       <div>
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedLab.name}</h2>
                          <p className="text-[12px] font-bold text-slate-500 mt-1 uppercase tracking-[0.15em] mb-4">{selectedLab.description}</p>
                          
                          {/* Join Link Component */}
                          <div className="flex items-center gap-3">
                             <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl flex items-center gap-3 w-fit group">
                                <LinkIcon size={14} className="text-[#0052a5]" />
                                <span className="text-[11px] font-black text-slate-500 tracking-widest uppercase truncate max-w-[200px]">
                                   {typeof window !== 'undefined' ? `${window.location.origin}/join/${selectedLab.id}` : "Generating protocol link..."}
                                </span>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${window.location.origin}/join/${selectedLab.id}`);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                  }}
                                  className="text-slate-300 hover:text-[#0052a5] transition-colors p-1"
                                >
                                   {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                             </div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:block">Broadcast this link to your cohort</p>
                          </div>
                       </div>
                       
                       <form onSubmit={handleAddStudent} className="flex gap-2 w-full md:w-auto">
                          <div className="relative flex-1 md:w-64">
                             <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <QrCode size={16} />
                             </div>
                             <input 
                                type="text"
                                required
                                value={rollNoSearch}
                                onChange={(e) => setRollNoSearch(e.target.value)}
                                placeholder="Student Roll No (e.g. 21B8...)"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-[13px] font-bold uppercase tracking-wider bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0052a5] transition-all placeholder:font-bold placeholder:text-slate-300" 
                             />
                          </div>
                          <button 
                            disabled={addLoading}
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl shadow-lg shadow-emerald-900/10 hover:shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                             {addLoading ? <Loader2 size={20} className="animate-spin" /> : <UserPlus size={20} />}
                          </button>
                       </form>
                    </div>

                    {errorMsg && (
                      <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 animate-in fade-in zoom-in-95">
                         <ShieldCheck size={18} className="text-red-500" />
                         <p className="text-[11px] font-bold text-red-800 uppercase tracking-widest">{errorMsg}</p>
                      </div>
                    )}

                    {/* Student List View */}
                    <div>
                       <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Enrolled Institutional Identities</h4>
                          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black">{labStudents.length} Students</span>
                       </div>

                       {labStudents.length === 0 ? (
                          <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-100">
                             <Users size={32} className="text-slate-200 mx-auto mb-4" />
                             <p className="text-[11px] font-medium text-slate-500">Awaiting roster enrollment. Enter a Roll Number above to whitelist.</p>
                          </div>
                       ) : (
                          <div className="overflow-hidden bg-[#fcfdff] rounded-2xl border border-slate-50">
                             <table className="w-full text-left">
                                <thead>
                                   <tr className="bg-slate-50/80 border-b border-slate-100">
                                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Roll No</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Full Identity</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Department</th>
                                      <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] text-center">Protocol</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                   {labStudents.map((student) => (
                                      <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                         <td className="px-6 py-4 font-black text-slate-900 text-[12px] uppercase tracking-wider">{student.roll_no}</td>
                                         <td className="px-6 py-4 font-bold text-slate-600 text-[12px]">{student.full_name}</td>
                                         <td className="px-6 py-4 font-medium text-slate-500 text-[11px] uppercase tracking-wider">{student.department}</td>
                                         <td className="px-6 py-4 text-center">
                                            <button 
                                              onClick={() => handleRemoveStudent(student.id)}
                                              className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                               <Trash2 size={16} />
                                            </button>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-full flex flex-col items-center justify-center py-40 border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/30">
                 <div className="bg-white p-8 rounded-full shadow-2xl shadow-blue-500/5 mb-8 relative">
                    <FlaskConical size={60} className="text-slate-100" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Search size={24} className="text-[#0052a5] opacity-20" />
                    </div>
                 </div>
                 <h2 className="text-xl font-black text-slate-400 tracking-tight mb-2">Laboratory Standby</h2>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] max-w-xs text-center leading-relaxed">Select a laboratory from the roster to access management protocols.</p>
              </div>
           )}
        </div>
      </div>

      {/* Initialize Lab Modal - Futuristic Overlay */}
      {showCreateModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-[#001529]/40 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-12 duration-500 border border-white/20">
               <div className="bg-[#0052a5] p-10 text-white relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <FlaskConical size={32} className="mb-6 opacity-30" />
                  <h3 className="text-2xl font-black tracking-tight mb-2">Initialize New Lab</h3>
                  <p className="text-[11px] font-bold text-blue-100 uppercase tracking-widest opacity-70">Curating a New Laboratory Ecosystem</p>
               </div>
               
               <form onSubmit={handleCreateLab} className="p-10 space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Unit Designation (Lab Name)</label>
                    <input 
                      type="text" 
                      required
                      value={newLabName}
                      onChange={(e) => setNewLabName(e.target.value)}
                      placeholder="e.g. Microbiology Section A" 
                      className="w-full px-6 py-4 border border-slate-100 rounded-2xl text-[14px] font-bold bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0052a5] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1 mb-3">Deployment Metadata (Description)</label>
                    <textarea 
                      value={newLabDesc}
                      onChange={(e) => setNewLabDesc(e.target.value)}
                      placeholder="Enter laboratory intent or parameters..." 
                      className="w-full px-6 py-4 border border-slate-100 rounded-2xl text-[14px] font-bold bg-slate-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#0052a5] transition-all min-h-[120px]"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 py-4 text-slate-500 text-[12px] font-black uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all"
                    >
                      Abort
                    </button>
                    <button 
                      type="submit"
                      disabled={addLoading}
                      className="flex-1 py-4 bg-[#0052a5] hover:bg-[#00438a] text-white text-[12px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-900/10 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {addLoading ? <Loader2 size={18} className="animate-spin" /> : <>Activate Lab <ChevronRight size={18} /></>}
                    </button>
                  </div>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}
