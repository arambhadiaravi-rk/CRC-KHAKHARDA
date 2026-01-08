
import React, { useState } from 'react';
import { School, DataRecord, ClassEnrollment, UserRole, Teacher } from '../types';

interface ReportsProps {
  schools: School[];
  records: DataRecord[];
  onRestoreData: (schools: School[], restoredRecords: DataRecord[]) => void;
  userRole: UserRole;
  activeSubTabFromProps?: 'overview' | 'teachers' | 'facilities' | 'students' | 'fln';
}

const Reports: React.FC<ReportsProps> = ({ schools, userRole, activeSubTabFromProps }) => {
  const [activeReportTab, setActiveReportTab] = useState<'overview' | 'teachers' | 'facilities'>(activeSubTabFromProps as any || 'overview');
  const isFullAdmin = userRole === 'crc_admin';
  const isAuthority = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  // Helper function to convert data to CSV and download
  const downloadCSV = (data: any[], fileName: string, headers: string[]) => {
    // Add BOM for Gujarati characters support in Excel
    const BOM = '\uFEFF';
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] || '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = BOM + csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${fileName}_${new Date().toLocaleDateString('gu-IN')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTeachersExcel = () => {
    const headers = ['SCHOOL_NAME', 'TEACHER_NAME', 'GENDER', 'DESIGNATION', 'MOBILE', 'DOB', 'AADHAAR', 'JOINING_SERVICE', 'JOINING_SCHOOL', 'SECTION', 'SUBJECT'];
    const data = schools.flatMap(s => (s.teachers || []).map(t => ({
      SCHOOL_NAME: s.name,
      TEACHER_NAME: t.name,
      GENDER: t.gender,
      DESIGNATION: t.designation,
      MOBILE: t.mobile,
      DOB: t.dob,
      AADHAAR: t.aadhaar,
      JOINING_SERVICE: t.joiningServiceDate,
      JOINING_SCHOOL: t.joiningSchoolDate,
      SECTION: t.section,
      SUBJECT: t.subject
    })));
    downloadCSV(data, 'TEACHERS_REPORT', headers);
  };

  const exportEnrollmentExcel = () => {
    const headers = ['SCHOOL_NAME', 'DISE_CODE', 'TOTAL_BOYS', 'TOTAL_GIRLS', 'GRAND_TOTAL'];
    const data = schools.map(s => {
      const boys = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.boys)||0), 0);
      const girls = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.girls)||0), 0);
      return {
        SCHOOL_NAME: s.name,
        DISE_CODE: s.diseCode,
        TOTAL_BOYS: boys,
        TOTAL_GIRLS: girls,
        GRAND_TOTAL: boys + girls
      };
    });
    downloadCSV(data, 'ENROLLMENT_SUMMARY', headers);
  };

  const exportFacilitiesExcel = () => {
    const headers = ['SCHOOL_NAME', 'ROOMS', 'BOYS_URINAL', 'GIRLS_URINAL', 'COMPUTER_LAB', 'COMP_COUNT', 'DRINKING_WATER', 'RO_SYSTEM'];
    const data = schools.map(s => ({
      SCHOOL_NAME: s.name,
      ROOMS: s.facilities?.roomsCount || 0,
      BOYS_URINAL: s.facilities?.boysUrinals || 0,
      GIRLS_URINAL: s.facilities?.girlsUrinals || 0,
      COMPUTER_LAB: s.facilities?.hasComputerLab || 'ના',
      COMP_COUNT: s.facilities?.computerCount || 0,
      DRINKING_WATER: s.facilities?.hasDrinkingWater || 'ના',
      RO_SYSTEM: s.facilities?.hasRO || 'ના'
    }));
    downloadCSV(data, 'FACILITIES_REPORT', headers);
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
          <div className="flex items-center gap-3 mt-2">
             <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isAuthority ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
               {isAuthority ? '● VIEW ONLY MODE' : '● FULL ADMIN ACCESS'}
             </span>
             <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
               {userRole?.toUpperCase().replace('_', ' ')}
             </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
           <button 
             onClick={exportTeachersExcel}
             className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black shadow-xl shadow-emerald-50 transition-all flex items-center gap-2 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"/></svg>
              શિક્ષકો (Excel)
           </button>
           <button 
             onClick={exportEnrollmentExcel}
             className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black shadow-xl shadow-blue-50 transition-all flex items-center gap-2 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"/></svg>
              સંખ્યા (Excel)
           </button>
           <button 
             onClick={exportFacilitiesExcel}
             className="bg-slate-900 hover:bg-black text-white px-6 py-4 rounded-2xl text-[10px] font-black shadow-xl shadow-slate-200 transition-all flex items-center gap-2 active:scale-95"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"/></svg>
              સુવિધા (Excel)
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-100 transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શાળાઓ</p>
           <p className="text-4xl font-black text-slate-900">{schools.length}</p>
        </div>
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-blue-100 transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ શિક્ષકો</p>
           <p className="text-4xl font-black text-blue-600">{allTeachers.length}</p>
        </div>
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-emerald-100 transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ સંખ્યા</p>
           <p className="text-4xl font-black text-emerald-600">{clusterEnrollment.boys + clusterEnrollment.girls}</p>
        </div>
        <div className="bg-white border-2 border-slate-50 p-8 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center group hover:border-pink-100 transition-all">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">કુલ કન્યાઓ</p>
           <p className="text-4xl font-black text-pink-600">{clusterEnrollment.girls}</p>
        </div>
      </div>

      <div className="bg-slate-100/50 p-2 rounded-[2.5rem] flex gap-2">
        <button onClick={() => setActiveReportTab('overview')} className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase transition-all ${activeReportTab === 'overview' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>સંખ્યા સારાંશ</button>
        <button onClick={() => setActiveReportTab('teachers')} className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase transition-all ${activeReportTab === 'teachers' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>શિક્ષકોની યાદી</button>
        <button onClick={() => setActiveReportTab('facilities')} className={`flex-1 py-4 rounded-3xl font-black text-[10px] uppercase transition-all ${activeReportTab === 'facilities' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>સુવિધાઓનો રિપોર્ટ</button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3rem] shadow-2xl overflow-hidden min-h-[500px]">
        <div className="p-8">
           {activeReportTab === 'overview' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase bg-slate-50/50">
                         <th className="py-6 px-8">શાળાનું નામ</th>
                         <th className="py-6 px-4 text-center">શિક્ષકો</th>
                         <th className="py-6 px-4 text-center text-emerald-600">કુમાર</th>
                         <th className="py-6 px-4 text-center text-pink-600">કન્યા</th>
                         <th className="py-6 px-4 text-center bg-slate-100/50">કુલ</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {schools.map(s => {
                         const boys = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.boys)||0), 0);
                         const girls = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((sum, d) => sum + (Number(d.girls)||0), 0);
                         return (
                            <tr key={s.id} className="hover:bg-slate-50 transition-all group">
                               <td className="py-6 px-8 font-black text-slate-800 uppercase text-xs">{s.name}</td>
                               <td className="py-6 px-4 text-center font-bold">{s.teachers?.length || 0}</td>
                               <td className="py-6 px-4 text-center font-black text-emerald-700">{boys}</td>
                               <td className="py-6 px-4 text-center font-black text-pink-700">{girls}</td>
                               <td className="py-6 px-4 text-center font-black bg-slate-50/30">{boys + girls}</td>
                            </tr>
                         );
                      })}
                   </tbody>
                </table>
             </div>
           )}

           {activeReportTab === 'teachers' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase bg-slate-50/50">
                         <th className="py-6 px-8">શિક્ષકનું નામ</th>
                         <th className="py-6 px-4">શાળા</th>
                         <th className="py-6 px-4">હોદ્દો</th>
                         <th className="py-6 px-4 text-center">મોબાઈલ</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {allTeachers.map((t, i) => (
                         <tr key={i} className="hover:bg-slate-50 transition-all">
                            <td className="py-6 px-8 font-black text-slate-800 text-xs uppercase">{t.name}</td>
                            <td className="py-6 px-4 text-[9px] font-bold text-slate-400 uppercase">{t.schoolName}</td>
                            <td className="py-6 px-4"><span className="text-[9px] font-black bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg uppercase">{t.designation}</span></td>
                            <td className="py-6 px-4 text-center font-black text-slate-700 text-xs">{t.mobile || '-'}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
           )}

           {activeReportTab === 'facilities' && (
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                   <thead>
                      <tr className="border-b text-[10px] font-black text-slate-400 uppercase bg-slate-50/50">
                         <th className="py-6 px-8">શાળાનું નામ</th>
                         <th className="py-6 px-4 text-center">ઓરડા</th>
                         <th className="py-6 px-4 text-center">કમ્પ્યુટર</th>
                         <th className="py-6 px-4 text-center">R.O.</th>
                         <th className="py-6 px-4 text-center">પીવાનું પાણી</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {schools.map(s => (
                         <tr key={s.id} className="hover:bg-slate-50 transition-all">
                            <td className="py-6 px-8 font-black text-slate-800 uppercase text-xs">{s.name}</td>
                            <td className="py-6 px-4 text-center font-bold">{s.facilities?.roomsCount || 0}</td>
                            <td className="py-6 px-4 text-center font-bold">{s.facilities?.computerCount || 0}</td>
                            <td className="py-6 px-4 text-center"><span className={`px-3 py-1 rounded-full text-[9px] font-black ${s.facilities?.hasRO === 'હા' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{s.facilities?.hasRO || 'ના'}</span></td>
                            <td className="py-6 px-4 text-center"><span className={`px-3 py-1 rounded-full text-[9px] font-black ${s.facilities?.hasDrinkingWater === 'હા' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>{s.facilities?.hasDrinkingWater || 'ના'}</span></td>
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
