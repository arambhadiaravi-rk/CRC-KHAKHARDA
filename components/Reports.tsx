
import React, { useState } from 'react';
import { School, DataRecord, ClassEnrollment, UserRole, Teacher, StudentStats } from '../types';

interface ReportsProps {
  schools: School[];
  records: DataRecord[];
  onRestoreData: (schools: School[], restoredRecords: DataRecord[]) => void;
  userRole: UserRole;
  activeSubTabFromProps?: string;
}

type ReportTab = 'overview' | 'enrollment' | 'student-details' | 'teachers' | 'facilities' | 'cwsn' | 'fln' | 'library' | 'smc';

// Explicit accumulator interface for stats to solve TypeScript errors
interface StatsAccumulator {
  mbu: number;
  aadhaar: number;
  apaar: number;
  scholarship: number;
}

const Reports: React.FC<ReportsProps> = ({ schools, userRole }) => {
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('overview');
  const [selectedMonth, setSelectedMonth] = useState('જૂન-૨૦૨૫');
  
  const isAuthority = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer' || userRole === 'crc_admin';

  const ACADEMIC_MONTHS = [
    'જૂન-૨૦૨૫', 'જુલાઈ-૨૦૨૫', 'ઓગસ્ટ-૨૦૨૫', 'સપ્ટેમ્બર-૨૦૨૫', 'ઓક્ટોબર-૨૦૨૫', 
    'નવેમ્બર-૨૦૨૫', 'ડિસેમ્બર-૨૦૨૫', 'જાન્યુઆરી-૨૦૨૬', 'ફેબ્રુઆરી-૨૦૨૬', 'માર્ચ-૨૦૨૬', 'એપ્રિલ-૨૦૨૬'
  ];

  const downloadCSV = (data: any[], fileName: string, headers: string[]) => {
    const BOM = '\uFEFF';
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] === undefined || row[header] === null ? '' : row[header];
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

  const exportData = (type: ReportTab) => {
    let data: any[] = [];
    let headers: string[] = [];
    let name = type.toUpperCase();

    switch(type) {
      case 'enrollment':
        headers = ['SCHOOL_NAME', 'TOTAL_BOYS', 'TOTAL_GIRLS', 'GRAND_TOTAL'];
        data = schools.map(s => {
          const b = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((acc: number, curr) => acc + (Number(curr.boys) || 0), 0);
          const g = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((acc: number, curr) => acc + (Number(curr.girls) || 0), 0);
          return { SCHOOL_NAME: s.name, TOTAL_BOYS: b, TOTAL_GIRLS: g, GRAND_TOTAL: b + g };
        });
        break;
      case 'student-details':
        headers = ['SCHOOL_NAME', 'MBU', 'AADHAAR', 'APAAR', 'SCHOLARSHIP'];
        data = schools.map(s => {
          const stats = (Object.values(s.studentStats || {}) as StudentStats[]).reduce((acc: StatsAccumulator, curr) => {
            acc.mbu += (Number(curr.mbuCount) || 0);
            acc.aadhaar += (Number(curr.aadhaarCount) || 0);
            acc.apaar += (Number(curr.apaarCount) || 0);
            acc.scholarship += (Number(curr.scholarshipCount) || 0);
            return acc;
          }, { mbu: 0, aadhaar: 0, apaar: 0, scholarship: 0 });
          return { SCHOOL_NAME: s.name, MBU: stats.mbu, AADHAAR: stats.aadhaar, APAAR: stats.apaar, SCHOLARSHIP: stats.scholarship };
        });
        break;
      case 'library':
        headers = ['SCHOOL_NAME', 'TOTAL_BOOKS', 'TEACHER_READ', 'STUDENT_READ'];
        data = schools.map(s => {
          const monthRec = s.libraryData?.monthlyRecords.find(r => r.month === selectedMonth);
          return { 
            SCHOOL_NAME: s.name, 
            TOTAL_BOOKS: s.libraryData?.totalBooks || 0,
            TEACHER_READ: monthRec?.teacherBooks || 0,
            STUDENT_READ: monthRec?.studentBooks || 0
          };
        });
        break;
      case 'teachers':
        headers = ['SCHOOL', 'NAME', 'DESIGNATION', 'MOBILE', 'DOB', 'JOINING_SCHOOL'];
        data = schools.flatMap(s => (s.teachers || []).map(t => ({
          SCHOOL: s.name, NAME: t.name, DESIGNATION: t.designation, MOBILE: t.mobile, DOB: t.dob, JOINING_SCHOOL: t.joiningSchoolDate
        })));
        break;
      case 'facilities':
        headers = ['SCHOOL', 'ROOMS', 'BOYS_TOILET', 'GIRLS_TOILET', 'BOYS_URINAL', 'GIRLS_URINAL', 'COMPUTERS', 'WATER', 'RO', 'INTERNET', 'VENDING', 'INCINERATOR', 'CWSN_TOILET', 'LABS'];
        data = schools.map(s => ({
          SCHOOL: s.name, 
          ROOMS: s.facilities?.roomsCount || 0, 
          BOYS_TOILET: s.facilities?.boysToilets || 0, 
          GIRLS_TOILET: s.facilities?.girlsToilets || 0, 
          BOYS_URINAL: s.facilities?.boysUrinals || 0,
          GIRLS_URINAL: s.facilities?.girlsUrinals || 0,
          COMPUTERS: s.facilities?.computerCount || 0,
          WATER: s.facilities?.hasDrinkingWater || 'ના',
          RO: s.facilities?.hasRO || 'ના',
          INTERNET: s.facilities?.hasInternet || 'ના',
          VENDING: s.facilities?.hasVendingMachine || 'ના',
          INCINERATOR: s.facilities?.hasIncinerator || 'ના',
          CWSN_TOILET: s.facilities?.hasCWSNToilet || 'ના',
          LABS: (s.facilities?.hasComputerLab === 'હા' ? 'COM' : '') + (s.facilities?.hasLBDLab === 'હા' ? '/LBD' : '')
        }));
        break;
      case 'cwsn':
        headers = ['SCHOOL', 'TOTAL_STUDENTS', 'CERTIFICATE', 'ASSISTANCE'];
        data = schools.map(s => ({
          SCHOOL: s.name, TOTAL_STUDENTS: s.cwsnData?.studentCount || 0, CERTIFICATE: s.cwsnData?.hasCertificate || 'ના', ASSISTANCE: s.cwsnData?.receivedAssistance || 'ના'
        }));
        break;
      case 'fln':
        headers = ['SCHOOL', 'TOTAL_STUDENTS', 'WEAK_STUDENTS', 'PROGRESS_PERCENTAGE'];
        data = schools.map(s => {
          const monthData = s.flnData?.find(f => f.month === selectedMonth);
          const totals = (monthData?.records || []).reduce((acc, curr) => {
            acc.total += (Number(curr.totalStudents) || 0);
            acc.weak += (Number(curr.weakStudents) || 0);
            return acc;
          }, { total: 0, weak: 0 });
          const perc = totals.total ? Math.round(((totals.total - totals.weak) / totals.total) * 100) : 0;
          return { SCHOOL: s.name, TOTAL_STUDENTS: totals.total, WEAK_STUDENTS: totals.weak, PROGRESS_PERCENTAGE: perc + '%' };
        });
        break;
      case 'smc':
        headers = ['SCHOOL', 'TOTAL_MEETINGS', 'AVG_ATTENDANCE'];
        data = schools.map(s => {
          const meetings = s.smcMeetings || [];
          const avg = meetings.length ? Math.round(meetings.reduce((acc, curr) => acc + (Number(curr.membersCount) || 0), 0) / meetings.length) : 0;
          return { SCHOOL: s.name, TOTAL_MEETINGS: meetings.length, AVG_ATTENDANCE: avg };
        });
        break;
    }
    downloadCSV(data, `${name}_REPORT`, headers);
  };

  const tabs: { id: ReportTab, label: string, icon: string }[] = [
    { id: 'overview', label: 'સારાંશ', icon: '📊' },
    { id: 'enrollment', label: 'સંખ્યા', icon: '📝' },
    { id: 'student-details', label: 'વિદ્યાર્થી', icon: '🆔' },
    { id: 'teachers', label: 'શિક્ષકો', icon: '👨‍🏫' },
    { id: 'facilities', label: 'સુવિધા', icon: '🛠️' },
    { id: 'cwsn', label: 'દિવ્યાંગ', icon: '♿' },
    { id: 'fln', label: 'FLN', icon: '📚' },
    { id: 'library', label: 'પુસ્તકાલય', icon: '📖' },
    { id: 'smc', label: 'SMC', icon: '🤝' },
  ];

  const standardsList = ['બાલવાટિકા', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b border-slate-200 p-3 overflow-x-auto no-scrollbar flex-shrink-0">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveReportTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap ${
                activeReportTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 shadow-sm border border-slate-100'
              }`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
              {tabs.find(t => t.id === activeReportTab)?.label} રીપોર્ટ (CLUSTER ANALYSIS)
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
             {(activeReportTab === 'fln' || activeReportTab === 'library') && (
               <select 
                value={selectedMonth} 
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-white border border-slate-200 p-3 rounded-xl text-[10px] font-black outline-none shadow-sm focus:ring-1 focus:ring-indigo-500"
               >
                 {ACADEMIC_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
               </select>
             )}
             <button 
                onClick={() => exportData(activeReportTab)}
                className="bg-emerald-600 text-white px-6 py-3.5 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2"
             >
                ડાઉનલોડ (EXCEL)
             </button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden min-h-[500px]">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px]">
                 {activeReportTab === 'overview' && (
                    <>
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-6 px-8 font-black uppercase tracking-widest">શાળાનું નામ</th>
                          <th className="py-6 px-4 text-center font-black uppercase tracking-widest bg-slate-800">શિક્ષકો</th>
                          <th className="py-6 px-4 text-center font-black uppercase tracking-widest bg-emerald-800">કુલ કુમાર</th>
                          <th className="py-6 px-4 text-center font-black uppercase tracking-widest bg-pink-800">કુલ કન્યા</th>
                          <th className="py-6 px-4 text-center font-black uppercase tracking-widest bg-indigo-900">GRAND TOTAL</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schools.map(s => {
                          const b = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((acc: number, curr) => acc + (Number(curr.boys) || 0), 0);
                          const g = (Object.values(s.enrollment || {}) as ClassEnrollment[]).reduce((acc: number, curr) => acc + (Number(curr.girls) || 0), 0);
                          return (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-5 px-8 font-black text-slate-700">{s.name}</td>
                              <td className="py-5 px-4 text-center font-bold text-slate-500">{s.teachers?.length || 0}</td>
                              <td className="py-5 px-4 text-center font-black text-emerald-600 italic">{b}</td>
                              <td className="py-5 px-4 text-center font-black text-pink-600 italic">{g}</td>
                              <td className="py-5 px-4 text-center font-black text-indigo-700 bg-indigo-50/30">{b + g}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                 )}

                 {activeReportTab === 'student-details' && (
                    <>
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-6 px-8 font-black uppercase">શાળાનું નામ</th>
                          <th className="py-6 px-4 text-center font-black bg-indigo-800">MBU</th>
                          <th className="py-6 px-4 text-center font-black bg-blue-800">આધારકાર્ડ</th>
                          <th className="py-6 px-4 text-center font-black bg-purple-800">APAAR</th>
                          <th className="py-6 px-4 text-center font-black bg-emerald-800">શિષ્યવૃત્તિ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {schools.map(s => {
                          const stats = (Object.values(s.studentStats || {}) as StudentStats[]).reduce((acc: StatsAccumulator, curr) => {
                            acc.mbu += (Number(curr.mbuCount) || 0);
                            acc.aadhaar += (Number(curr.aadhaarCount) || 0);
                            acc.apaar += (Number(curr.apaarCount) || 0);
                            acc.scholarship += (Number(curr.scholarshipCount) || 0);
                            return acc;
                          }, { mbu: 0, aadhaar: 0, apaar: 0, scholarship: 0 });
                          return (
                            <tr key={s.id} className="hover:bg-slate-50">
                              <td className="py-5 px-8 font-black text-slate-700">{s.name}</td>
                              <td className="py-5 px-4 text-center font-black text-indigo-600 italic">{stats.mbu}</td>
                              <td className="py-5 px-4 text-center font-black text-blue-600 italic">{stats.aadhaar}</td>
                              <td className="py-5 px-4 text-center font-black text-purple-600 italic">{stats.apaar}</td>
                              <td className="py-5 px-4 text-center font-black text-emerald-600 italic">{stats.scholarship}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </>
                 )}
              </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
