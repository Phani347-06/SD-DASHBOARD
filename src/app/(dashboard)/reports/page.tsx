import { 
  FileText, 
  Calendar, 
  Download,
  Users,
  FlaskConical,
  Box,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function ReportsPage() {
  const tableData = [
    {
       abbr: "CH",
       color: "text-[#0052a5] bg-[#eef4fb]",
       name: "Advanced Chemistry Lab A",
       prof: "Dr. Aris Thorne",
       score: "92/100",
       attendance: "98.4%",
       healthValue: "92%",
       healthColor: "bg-[#1e8e3e]",
       status: "OPTIMAL",
       statusColor: "text-[#1e8e3e] bg-[#e6f4ea]"
    },
    {
       abbr: "PH",
       color: "text-[#4a148c] bg-[#f3e5f5]",
       name: "Quantum Physics Core",
       prof: "Prof. Julian Vane",
       score: "88/100",
       attendance: "91.2%",
       healthValue: "88%",
       healthColor: "bg-[#0052a5]",
       status: "STABLE",
       statusColor: "text-[#0052a5] bg-[#eef4fb]"
    },
    {
       abbr: "BI",
       color: "text-[#b71c1c] bg-[#fbe9e7]",
       name: "Molecular Biology Lab",
       prof: "Dr. Sarah Chen",
       score: "76/100",
       attendance: "84.5%",
       healthValue: "76%",
       healthColor: "bg-[#8e4a3b]",
       status: "ATTENTION",
       statusColor: "text-[#c5221f] bg-[#fce8e6]"
    }
  ];

  return (
    <div className="flex flex-col h-full text-slate-900 pb-12 w-full max-w-[1400px] mx-auto">
      
      {/* Header Area */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[11px] font-bold text-[#0052a5] uppercase tracking-widest mb-2">Institutional Analytics</p>
          <h1 className="text-[34px] font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-sm">
            Laboratory Insights & Analytics
          </h1>
        </div>

        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors text-[13px] font-bold shadow-sm border border-slate-200/50">
            <Calendar size={16} /> Oct 01, 2023 - Dec 31, 2023
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors text-[13px] font-bold shadow-sm border border-slate-200/50">
            <FileText size={16} /> CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0052a5] hover:bg-[#00438a] text-white rounded-2xl transition-colors text-[13px] font-bold shadow-md shadow-blue-900/20">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Top Value Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         
         <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-[#eef4fb] text-[#0052a5] rounded-lg flex items-center justify-center">
                  <Users size={20} strokeWidth={2.5}/>
               </div>
               <span className="px-2 py-1 bg-[#e6f4ea] text-[#1e8e3e] text-[10px] font-bold rounded-md">+2.4%</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mb-1">Avg. Attendance Rate</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">94.2%</h2>
         </div>

         <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-[#f5f5ff] text-[#4f46e5] rounded-lg flex items-center justify-center">
                  <Calendar size={20} strokeWidth={2.5}/>
               </div>
               <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">Quarterly</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mb-1">Total Lab Sessions</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">124</h2>
         </div>

         <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-[#e0f2fe] text-[#0284c7] rounded-lg flex items-center justify-center">
                  <Box size={20} strokeWidth={2.5}/>
               </div>
               <span className="text-[10px] font-bold text-[#0ea5e9] flex items-center gap-1.5 uppercase tracking-wider">
                 <span className="w-1.5 h-1.5 bg-[#0ea5e9] rounded-full animate-pulse"></span> LIVE
               </span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mb-1">Kit Utilization</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">88%</h2>
         </div>

         <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
               <div className="w-10 h-10 bg-[#fef3c7] text-[#d97706] rounded-lg flex items-center justify-center">
                  <AlertTriangle size={20} strokeWidth={2.5}/>
               </div>
               <span className="text-[11px] font-bold text-[#b45309] underline decoration-2 underline-offset-4 cursor-pointer hover:text-[#92400e]">Review</span>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mb-1">Active Alerts</p>
            <h2 className="text-3xl font-extrabold text-[#92400e] tracking-tight">3</h2>
         </div>

      </div>

      {/* Middle Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         
         {/* Monthly Attendance Trends Chart (CSS based) */}
         <div className="lg:col-span-2 bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h3 className="text-lg font-bold text-slate-900">Monthly Attendance Trends</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Comparative analysis across core chemistry modules</p>
               </div>
               <select className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 outline-none">
                  <option>Academic Year 2023</option>
               </select>
            </div>

            <div className="flex-1 flex items-end justify-between px-4 pb-2 relative h-[250px]">
               {/* 5 CSS Bars */}
               {[
                 { month: "Sept", val: "88%" },
                 { month: "Oct", val: "94%" },
                 { month: "Nov", val: "82%" },
                 { month: "Dec", val: "96%" },
                 { month: "Jan", val: "72%" }
               ].map((bar, i) => (
                 <div key={i} className="flex flex-col items-center gap-3 w-1/6">
                   <div className="w-full bg-[#f1f5f9] rounded-t-xl h-[180px] relative overflow-hidden">
                      <div className="absolute bottom-0 w-full bg-[#0052a5] rounded-t-xl transition-all duration-1000 ease-out" style={{height: bar.val}}></div>
                   </div>
                   <span className="text-[10px] font-bold text-slate-500">{bar.month}</span>
                 </div>
               ))}
            </div>
         </div>

         {/* Kit Usage CSS Donut */}
         <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Kit Usage</h3>
            <p className="text-xs font-medium text-slate-500 mt-1 mb-10">Resource distribution by category</p>
            
            <div className="flex justify-center mb-10 relative">
               {/* CSS Donut Chart */}
               <div className="w-48 h-48 rounded-full flex items-center justify-center relative shadow-sm" style={{ background: 'conic-gradient(#0052a5 0% 45%, #93c5fd 45% 75%, #e2e8f0 75% 100%)' }}>
                  {/* Inner cutout */}
                  <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center absolute z-10 shadow-inner">
                     <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">12k</span>
                     <span className="text-[8px] uppercase font-extrabold tracking-widest text-slate-500 mb-2">Total Units</span>
                  </div>
               </div>
            </div>

            <div className="space-y-4 px-4 mt-auto">
               <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-800"><span className="w-2.5 h-2.5 rounded-full bg-[#0052a5]"></span> Glassware</div>
                  <span className="text-slate-600">45%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-800"><span className="w-2.5 h-2.5 rounded-full bg-[#93c5fd]"></span> Electronics</div>
                  <span className="text-slate-600">30%</span>
               </div>
               <div className="flex justify-between items-center text-xs font-bold">
                  <div className="flex items-center gap-2 text-slate-800"><span className="w-2.5 h-2.5 rounded-full bg-[#e2e8f0]"></span> Other</div>
                  <span className="text-slate-600">25%</span>
               </div>
            </div>
         </div>

      </div>

      {/* Bottom Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
          <div className="pt-8 px-8 pb-6 flex justify-between items-end border-b border-transparent">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Top Performing Labs</h2>
              <p className="text-[11px] font-medium text-slate-500 mt-1">Efficiency metrics for department sub-units</p>
            </div>
            <button className="text-[#0052a5] hover:text-[#00438a] font-bold text-xs flex items-center gap-1.5 transition-colors">
               View Detailed Log <ArrowRight size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8fafc] border-y border-slate-100">
                <tr className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">
                  <th className="px-8 py-4 w-[35%]">Laboratory Unit</th>
                  <th className="px-8 py-4">Avg. Score</th>
                  <th className="px-8 py-4">Attendance</th>
                  <th className="px-8 py-4">Equip. Health</th>
                  <th className="px-8 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] font-bold text-slate-800">
                {tableData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors h-[80px]">
                    <td className="px-8">
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${row.color}`}>
                             {row.abbr}
                          </div>
                          <div>
                             <p className="text-[13px] font-bold text-slate-900 leading-tight mb-0.5">{row.name}</p>
                             <p className="text-[10px] font-medium text-slate-500 leading-tight">{row.prof}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 font-extrabold text-[13px]">{row.score}</td>
                    <td className="px-8 font-medium text-slate-600 text-[12px]">{row.attendance}</td>
                    <td className="px-8">
                       <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${row.healthColor}`} style={{width: row.healthValue}}></div>
                       </div>
                    </td>
                    <td className="px-8 text-center">
                       <span className={`px-4 py-1.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${row.statusColor}`}>
                          {row.status}
                       </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>

    </div>
  );
}
