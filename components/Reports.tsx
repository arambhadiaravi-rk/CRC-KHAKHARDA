
import React from 'react';
import { School, DataRecord, ClassEnrollment, UserRole } from '../types';

interface ReportsProps {
  schools: School[];
  records: DataRecord[];
  onRestoreData: (schools: School[], restoredRecords: DataRecord[]) => void;
  userRole: UserRole;
  activeSubTabFromProps?: 'overview' | 'teachers' | 'facilities' | 'students' | 'fln';
}

const Reports: React.FC<ReportsProps> = ({ schools, userRole, activeSubTabFromProps }) => {
  const activeReportTab = activeSubTabFromProps || 'overview';
  const isFullAdmin = userRole === 'crc_admin';

  const exportSourceFiles = () => {
    const fullSourceData = {
      project: "CRC KHAKHARDA FINAL APP",
      timestamp: new Date().toISOString(),
      developer: "AI Senior Engineer",
      appData: schools
    };
    
    const blob = new Blob([JSON.stringify(fullSourceData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crc_khakharda_final_package.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert("ફાઈનલ સોર્સ પેકેજ ડાઉનલોડ થઈ રહ્યું છે.");
  };

  const allTeachers = schools.flatMap(s => (s.teachers || []).map(t => ({ ...t, schoolName: s.name })));
  
  const clusterEnrollment = schools.reduce((acc, school) => {
    (Object.values(school.enrollment || {}) as ClassEnrollment[]).forEach(data => {
      acc.boys += (Number(data.boys) || 0);
      acc.girls += (Number(data.girls) || 0);
    });
    return acc;
  }, { boys: 0, girls: 0 });

  return (
    <div className="p-4 md:p-10 space-y-10 animate-in fade-in duration-500 overflow-y-auto max-h-[85vh] custom-scrollbar pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-10">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight uppercase tracking-tight">ક્લસ્ટર એનાલિસિસ</h2>
          <p className="text-emerald-600 text-[10px] font-black mt-2 uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-lg"></span>
            સી.આર.સી. ખાખરડા - લાઈવ સ્ટેટસ
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
           {isFullAdmin && (
             <button 
               onClick={exportSourceFiles}
               className="bg-slate-900 text-white px-8 py-4 rounded-2xl text-[11px] font-black shadow-2xl transition-all flex items-center gap-3 active:scale-95 group"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:translate-y-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                SOURCE PACKAGE
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[4rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-100 transition-all">
           <div className="bg-slate-50 w-12 h-12 rounded-3xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-emerald-50 group-hover:text-emerald-600">🏫</div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શાળાઓ</p>
           <p className="text-4xl font-black text-slate-900">{schools.length}</p>
        </div>
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[4rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-100 transition-all">
           <div className="bg-slate-50 w-12 h-12 rounded-3xl flex items-center justify-center text-slate-400 mb-4 group-hover:bg-blue-50 group-hover:text-blue-600">👨‍🏫</div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શિક્ષકો</p>
           <p className="text-4xl font-black text-blue-600">{allTeachers.length}</p>
        </div>
        <div className="bg-emerald-50 border-2 border-emerald-50 p-8 rounded-[4rem] shadow-sm flex flex-col items-center justify-center text-center group">
           <div className="bg-white w-12 h-12 rounded-3xl flex items-center justify-center text-emerald-600 mb-4 shadow-sm">👦</div>
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">કુલ કુમાર</p>
           <p className="text-4xl font-black text-emerald-900">{clusterEnrollment.boys}</p>
        </div>
        <div className="bg-pink-50 border-2 border-pink-50 p-8 rounded-[4rem] shadow-sm flex flex-col items-center justify-center text-center group">
           <div className="bg-white w-12 h-12 rounded-3xl flex items-center justify-center text-pink-600 mb-4 shadow-sm">👧</div>
           <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-1">કુલ કન્યા</p>
           <p className="text-4xl font-black text-pink-900">{clusterEnrollment.girls}</p>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[4rem] shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-10">
           {activeReportTab === 'overview' && (
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm min-w-[700px]">
                   <thead>
                      <tr className="border-b text-[11px] font-black text-slate-400 uppercase bg-slate-50/50">
                         <th className="py-7 px-10">શાળાનું નામ</th>
                         <th className="py-7 px-6 text-center">શિક્ષકો</th>
                         <th className="py-7 px-6 text-center">કુમાર</th>
                         <th className="py-7 px-6 text-center">કન્યા</th>
                         <th className="py-7 px-6 text-center bg-slate-100/50 font-black">કુલ સંખ્યા</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {schools.map(s => {
                         const boys = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.boys)||0), 0);
                         const girls = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.girls)||0), 0);
                         return (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="py-8 px-10">
                                  <span className="font-black text-slate-800 uppercase text-xs block">{s.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1 block">DISE: {s.diseCode}</span>
                               </td>
                               <td className="py-8 px-6 text-center font-bold text-slate-700">{s.teachers?.length || 0}</td>
                               <td className="py-8 px-6 text-center font-black text-emerald-700">{boys}</td>
                               <td className="py-8 px-6 text-center font-black text-pink-700">{girls}</td>
                               <td className="py-8 px-6 text-center font-black bg-slate-50/50 group-hover:bg-slate-900 group-hover:text-white transition-all"><span className="bg-slate-100 group-hover:bg-transparent px-4 py-2 rounded-2xl text-xs">{boys + girls}</span></td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
           )}
           
           {activeReportTab === 'teachers' && (
             <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm min-w-[800px]">
                   <thead>
                      <tr className="border-b text-[11px] font-black text-slate-400 uppercase bg-slate-50/50">
                         <th className="py-7 px-10">શિક્ષકનું નામ</th>
                         <th className="py-7 px-6">શાળા</th>
                         <th className="py-7 px-6">હોદ્દો</th>
                         <th className="py-7 px-6 text-center">મોબાઈલ</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {allTeachers.map((t, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-8 px-10 font-black text-slate-800 text-xs uppercase">{t.name}</td>
                            <td className="py-8 px-6 text-[10px] font-bold text-slate-400 uppercase">{t.schoolName}</td>
                            <td className="py-8 px-6"><span className="text-[10px] font-black bg-blue-50 text-blue-700 px-4 py-2 rounded-xl uppercase">{t.designation}</span></td>
                            <td className="py-8 px-6 text-center font-black text-slate-700 text-xs">{t.mobile || '-'}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
