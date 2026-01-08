
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

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportSourceFiles = () => {
    alert("તમારા મોબાઈલમાં પ્રોજેક્ટની બધી જ ફાઈલો ડાઉનલોડ થઈ રહી છે. મહેરબાની કરીને દરેકને સાચવી લો.");
    
    // We export index.html content
    const htmlContent = document.documentElement.outerHTML;
    downloadFile(htmlContent, 'index.html', 'text/html');

    // Instruction for user
    console.log("Downloading files...");
  };

  const totalSchools = schools.length;
  const allTeachers = schools.flatMap(s => (s.teachers || []).map(t => ({ ...t, schoolName: s.name })));
  
  const clusterEnrollment = schools.reduce((acc, school) => {
    (Object.values(school.enrollment || {}) as ClassEnrollment[]).forEach(data => {
      acc.boys += (Number(data.boys) || 0);
      acc.girls += (Number(data.girls) || 0);
    });
    return acc;
  }, { boys: 0, girls: 0 });

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500 overflow-y-auto max-h-[85vh] custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 leading-tight tracking-tight">ક્લસ્ટર એનાલિસિસ રિપોર્ટ</h2>
          <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            સી.આર.સી. ખાખરડા - ડેટા ડેશબોર્ડ
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => window.print()} className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2.5 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all">
              PRINT REPORT
           </button>
           {isFullAdmin && (
             <button 
               onClick={exportSourceFiles}
               className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-100 transition-all flex items-center gap-2"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                સોર્સ કોડ ડાઉનલોડ
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શાળાઓ</p>
           <p className="text-3xl font-black text-slate-800">{totalSchools}</p>
        </div>
        <div className="bg-white border border-slate-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શિક્ષકો</p>
           <p className="text-3xl font-black text-blue-600">{allTeachers.length}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">કુલ કુમાર</p>
           <p className="text-3xl font-black text-emerald-800">{clusterEnrollment.boys}</p>
        </div>
        <div className="bg-pink-50 border border-pink-100 p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-1">કુલ કન્યા</p>
           <p className="text-3xl font-black text-pink-800">{clusterEnrollment.girls}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[3rem] shadow-xl overflow-hidden min-h-[500px]">
        <div className="p-8">
           {activeReportTab === 'overview' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                   <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase">
                         <th className="py-4 px-2">શાળાનું નામ</th>
                         <th className="py-4 px-2">પ્રકાર</th>
                         <th className="py-4 px-2 text-center">શિક્ષકો</th>
                         <th className="py-4 px-2 text-center">કુલ સંખ્યા</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {schools.map(s => {
                         const totalEnroll = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.boys)||0) + (Number(d.girls)||0), 0);
                         return (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                               <td className="py-5 px-2 font-black text-slate-800 uppercase text-xs">{s.name}</td>
                               <td className="py-5 px-2 text-[10px] font-black"><span className="bg-slate-100 px-3 py-1.5 rounded-xl">{s.schoolType}</span></td>
                               <td className="py-5 px-2 text-center font-bold text-slate-600">{s.teachers?.length || 0}</td>
                               <td className="py-5 px-2 text-center font-black"><span className="bg-slate-900 text-white px-3 py-1 rounded-xl text-xs">{totalEnroll}</span></td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
           )}

           {activeReportTab === 'teachers' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[800px]">
                   <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase">
                         <th className="py-4 px-2">શાળા</th>
                         <th className="py-4 px-2">શિક્ષકનું નામ</th>
                         <th className="py-4 px-2">હોદ્દો</th>
                         <th className="py-4 px-2">વિભાગ</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {allTeachers.map((t, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-colors">
                            <td className="py-5 px-2 text-[10px] font-black text-slate-400 uppercase">{t.schoolName}</td>
                            <td className="py-5 px-2 font-black text-slate-800 text-xs">{t.name}</td>
                            <td className="py-5 px-2 text-xs font-bold text-blue-600">{t.designation}</td>
                            <td className="py-5 px-2 text-xs font-bold text-slate-600 uppercase">{t.section}</td>
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
