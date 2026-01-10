
import React, { useState, useEffect } from 'react';
import { School, UserRole, ClassEnrollment, StudentStats, FLNRecord, MonthlyFLN, CWSNData, CWSNStudent } from '../types';

interface StudentDataEntryProps {
  school: School;
  activeSection: 'enrollment' | 'student-stats' | 'cwsn' | 'fln';
  onUpdate: (updatedSchool: School) => void;
  userRole: UserRole;
}

const StudentDataEntry: React.FC<StudentDataEntryProps> = ({ school, activeSection, onUpdate, userRole }) => {
  const [editSchool, setEditSchool] = useState<School>(() => ({ ...school }));
  const [isSaving, setIsSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('જૂન-૨૦૨૫');
  
  const isReadOnly = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  const ACADEMIC_MONTHS = [
    'જૂન-૨૦૨૫', 'જુલાઈ-૨૦૨૫', 'ઓગસ્ટ-૨૦૨૫', 'સપ્ટેમ્બર-૨૦૨૫', 'ઓક્ટોબર-૨૦૨૫', 
    'નવેમ્બર-૨૦૨૫', 'ડિસેમ્બર-૨૦૨૫', 'જાન્યુઆરી-૨૦૨૬', 'ફેબ્રુઆરી-૨૦૨૬', 'માર્ચ-૨૦૨૬', 'એપ્રિલ-૨૦૨૬'
  ];

  const STANDARDS = editSchool.standards === '9-10' ? ['9', '10'] : 
                    editSchool.standards === '1-5' ? ['બાલવાટિકા', '1', '2', '3', '4', '5'] : 
                    ['બાલવાટિકા', '1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    setEditSchool({ ...school });
  }, [school]);

  const syncTotalsFromEnrollment = (updatedSchool: School) => {
    const newSchool = { ...updatedSchool };
    const enrollment = newSchool.enrollment || {};
    
    // Sync to Student Stats
    const stats = { ...(newSchool.studentStats || {}) };
    STANDARDS.forEach(std => {
      const e = enrollment[std] || { boys: 0, girls: 0 };
      const total = (Number(e.boys) || 0) + (Number(e.girls) || 0);
      stats[std] = { ...(stats[std] || { mbuCount: 0, aadhaarCount: 0, apaarCount: 0, scholarshipCount: 0 }), totalRegistered: total };
    });
    newSchool.studentStats = stats;

    // Sync to FLN (all existing months)
    const fln = [...(newSchool.flnData || [])];
    fln.forEach((monthData, mIdx) => {
      const records = [...monthData.records];
      STANDARDS.forEach(std => {
        const e = enrollment[std] || { boys: 0, girls: 0 };
        const total = (Number(e.boys) || 0) + (Number(e.girls) || 0);
        const rIdx = records.findIndex(r => r.standard === std);
        if (rIdx >= 0) {
          records[rIdx] = { ...records[rIdx], totalStudents: total };
        } else {
          records.push({ standard: std, totalStudents: total, weakStudents: 0 });
        }
      });
      fln[mIdx].records = records;
    });
    newSchool.flnData = fln;

    return newSchool;
  };

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    onUpdate(editSchool);
    setTimeout(() => {
      setIsSaving(false);
      alert("માહિતી સફળતાપૂર્વક સેવ થઈ ગઈ છે!");
    }, 500);
  };

  const updateNested = (category: string, field: string, value: any) => {
    if (isReadOnly) return;
    setEditSchool(prev => {
      const updated = {
        ...prev,
        [category]: {
          ...(prev as any)[category],
          [field]: value
        }
      };
      if (category === 'enrollment') {
        return syncTotalsFromEnrollment(updated);
      }
      return updated;
    });
  };

  const updateFLNRecord = (std: string, field: keyof FLNRecord, value: number) => {
    if (isReadOnly) return;
    const allFlnData = [...(editSchool.flnData || [])];
    let monthData = allFlnData.find(f => f.month === selectedMonth);
    
    if (!monthData) {
      monthData = { month: selectedMonth, records: [] };
      allFlnData.push(monthData);
    }
    
    const records = [...monthData.records];
    const index = records.findIndex(r => r.standard === std);
    
    if (index >= 0) {
      records[index] = { ...records[index], [field]: value };
    } else {
      const enrollmentTotal = (Number(editSchool.enrollment?.[std]?.boys)||0) + (Number(editSchool.enrollment?.[std]?.girls)||0);
      records.push({ 
        standard: std, 
        totalStudents: field === 'totalStudents' ? value : enrollmentTotal, 
        weakStudents: field === 'weakStudents' ? value : 0 
      });
    }
    
    monthData.records = records;
    setEditSchool({ ...editSchool, flnData: allFlnData });
  };

  // CWSN Entry Form Logic
  const cwsn: CWSNData = editSchool.cwsnData || { studentCount: '', certificateCount: '', hasCertificate: '', receivedAssistance: '', assistanceDetails: '', students: [] };
  
  const addCWSNStudent = () => {
    const updated = { ...cwsn, students: [...(cwsn.students || []), { name: '', standard: '1' }] };
    setEditSchool({ ...editSchool, cwsnData: updated });
  };

  const removeCWSNStudent = (idx: number) => {
    const updated = { ...cwsn, students: (cwsn.students || []).filter((_, i) => i !== idx) };
    setEditSchool({ ...editSchool, cwsnData: updated });
  };

  const updateCWSNStudent = (idx: number, field: keyof CWSNStudent, value: string) => {
    const newStudents = [...(cwsn.students || [])];
    newStudents[idx] = { ...newStudents[idx], [field]: value };
    setEditSchool({ ...editSchool, cwsnData: { ...cwsn, students: newStudents } });
  };

  const enrollmentSummary = STANDARDS.reduce((acc, std) => {
    const data = (editSchool.enrollment || {})[std] || { boys: 0, girls: 0 };
    acc.boys += Number(data.boys) || 0;
    acc.girls += Number(data.girls) || 0;
    return acc;
  }, { boys: 0, girls: 0 });

  const statsSummary = STANDARDS.reduce((acc, std) => {
    const data = (editSchool.studentStats || {})[std] || { totalRegistered: 0, mbuCount: 0, aadhaarCount: 0, apaarCount: 0, scholarshipCount: 0 };
    acc.totalRegistered += Number(data.totalRegistered) || 0;
    acc.mbuCount += Number(data.mbuCount) || 0;
    acc.aadhaarCount += Number(data.aadhaarCount) || 0;
    acc.apaarCount += Number(data.apaarCount) || 0;
    acc.scholarshipCount += Number(data.scholarshipCount) || 0;
    return acc;
  }, { totalRegistered: 0, mbuCount: 0, aadhaarCount: 0, apaarCount: 0, scholarshipCount: 0 });

  const currentFLN: MonthlyFLN = (editSchool.flnData || []).find(f => f.month === selectedMonth) || { month: selectedMonth, records: [] };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {activeSection === 'enrollment' && 'બાલવાટિકા તથા ધોરણ મુજબ સંખ્યા'}
              {activeSection === 'student-stats' && 'વિદ્યાર્થીઓની વિગત (AUTO GEN)'}
              {activeSection === 'cwsn' && 'દિવ્યાંગ બાળકોની વિગત'}
              {activeSection === 'fln' && 'FLN ડેટા એન્ટ્રી'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {isReadOnly ? 'VIEW ONLY' : 'SCHOOL DATA PORTAL'}
            </p>
          </div>
          {!isReadOnly && (
            <button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 transition-all">
              {isSaving ? 'સેવ થઈ રહ્યું છે...' : 'માહિતી સેવ કરો (SAVE)'}
            </button>
          )}
        </div>

        {activeSection === 'enrollment' && (
          <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ધોરણ મુજબ આડી હરોળમાં વિગત</h4>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="p-4 font-black uppercase whitespace-nowrap">કેટેગરી</th>
                       {STANDARDS.map(std => (
                         <th key={std} className="p-4 font-black uppercase text-center border-l border-slate-800 whitespace-nowrap">{std === 'બાલવાટિકા' ? std : `ધોરણ ${std}`}</th>
                       ))}
                       <th className="p-4 font-black uppercase text-center bg-emerald-800 border-l border-slate-800">કુલ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                       <td className="p-4 font-black text-blue-600 italic">કુમાર (BOYS)</td>
                       {STANDARDS.map(std => {
                         const data = (editSchool.enrollment || {})[std] || { boys: 0, girls: 0 };
                         return (
                           <td key={std} className="p-2">
                             <input type="number" disabled={isReadOnly} value={data.boys} onChange={e => {
                               const val = parseInt(e.target.value) || 0;
                               updateNested('enrollment', std, { ...data, boys: val });
                             }} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-black text-center text-blue-700 outline-none focus:bg-white"/>
                           </td>
                         );
                       })}
                       <td className="p-4 text-center font-black text-blue-800 bg-blue-50">{enrollmentSummary.boys}</td>
                    </tr>
                    <tr className="border-b border-slate-100">
                       <td className="p-4 font-black text-pink-600 italic">કન્યા (GIRLS)</td>
                       {STANDARDS.map(std => {
                         const data = (editSchool.enrollment || {})[std] || { boys: 0, girls: 0 };
                         return (
                           <td key={std} className="p-2">
                             <input type="number" disabled={isReadOnly} value={data.girls} onChange={e => {
                               const val = parseInt(e.target.value) || 0;
                               updateNested('enrollment', std, { ...data, girls: val });
                             }} className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg font-black text-center text-pink-700 outline-none focus:bg-white"/>
                           </td>
                         );
                       })}
                       <td className="p-4 text-center font-black text-pink-800 bg-pink-50">{enrollmentSummary.girls}</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-emerald-50">
                    <tr className="font-black">
                       <td className="p-4 uppercase text-emerald-800">કુલ (TOTAL)</td>
                       {STANDARDS.map(std => {
                         const data = (editSchool.enrollment || {})[std] || { boys: 0, girls: 0 };
                         return (
                           <td key={std} className="p-4 text-center text-emerald-900 border-l border-emerald-100">{(Number(data.boys)||0) + (Number(data.girls)||0)}</td>
                         );
                       })}
                       <td className="p-4 text-center text-emerald-900 text-lg bg-emerald-200">{enrollmentSummary.boys + enrollmentSummary.girls}</td>
                    </tr>
                  </tfoot>
               </table>
            </div>
          </div>
        )}

        {activeSection === 'student-stats' && (
          <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-indigo-500 pl-3 italic">* 'કુલ રજીસ્ટર્ડ' સંખ્યા વિદ્યાર્થી સંખ્યા ટેબમાંથી આપોઆપ આવશે.</h4>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="p-5 font-black uppercase">ધોરણ</th>
                       <th className="p-5 font-black uppercase text-center bg-slate-800">કુલ રજીસ્ટર્ડ</th>
                       <th className="p-5 font-black uppercase text-center bg-indigo-900">MBU</th>
                       <th className="p-5 font-black uppercase text-center bg-blue-900">આધારકાર્ડ</th>
                       <th className="p-5 font-black uppercase text-center bg-purple-900">APAAR ID</th>
                       <th className="p-5 font-black uppercase text-center bg-emerald-800">શિષ્યવૃત્તિ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STANDARDS.map(std => {
                      const data = (editSchool.studentStats || {})[std] || { totalRegistered: 0, mbuCount: 0, aadhaarCount: 0, apaarCount: 0, scholarshipCount: 0 };
                      return (
                        <tr key={std} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                           <td className="p-5 font-black text-slate-700 italic">{std === 'બાલવાટિકા' ? std : `ધોરણ ${std}`}</td>
                           <td className="p-3 bg-slate-50 text-center font-black text-slate-400 italic">{data.totalRegistered}</td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.mbuCount} onChange={e => updateNested('studentStats', std, {...data, mbuCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-center text-indigo-700"/></td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.aadhaarCount} onChange={e => updateNested('studentStats', std, {...data, aadhaarCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-center text-blue-700"/></td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.apaarCount} onChange={e => updateNested('studentStats', std, {...data, apaarCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-center text-purple-700"/></td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.scholarshipCount || 0} onChange={e => updateNested('studentStats', std, {...data, scholarshipCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-center text-emerald-700"/></td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white">
                    <tr className="font-black">
                       <td className="p-5 uppercase tracking-widest text-emerald-400">કુલ (TOTAL)</td>
                       <td className="p-5 text-center bg-slate-800 text-sm italic">{statsSummary.totalRegistered}</td>
                       <td className="p-5 text-center bg-indigo-950 text-sm">{statsSummary.mbuCount}</td>
                       <td className="p-5 text-center bg-blue-950 text-sm">{statsSummary.aadhaarCount}</td>
                       <td className="p-5 text-center bg-purple-950 text-sm">{statsSummary.apaarCount}</td>
                       <td className="p-5 text-center bg-emerald-950 text-sm">{statsSummary.scholarshipCount}</td>
                    </tr>
                  </tfoot>
               </table>
            </div>
          </div>
        )}

        {activeSection === 'fln' && (
           <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">FLN ડેટા એન્ટ્રી (માસવાર)</h4>
                   <p className="text-[9px] text-indigo-500 font-bold mt-1 uppercase italic">* કુલ સંખ્યા આપોઆપ રિફ્લેક્ટ થશે.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">માસ પસંદ કરો:</span>
                  <select 
                    value={selectedMonth} 
                    onChange={e => setSelectedMonth(e.target.value)} 
                    className="bg-slate-50 border-none px-4 py-1.5 rounded-xl text-xs font-black outline-none cursor-pointer"
                  >
                    {ACADEMIC_MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden shadow-sm">
                   <thead>
                      <tr className="bg-indigo-600 text-white">
                         <th className="p-5 font-black uppercase">ધોરણ</th>
                         <th className="p-5 font-black uppercase text-center bg-indigo-500">કુલ સંખ્યા</th>
                         <th className="p-5 font-black uppercase text-center bg-indigo-700">કચાશ ધરાવતા</th>
                         <th className="p-5 font-black uppercase text-center">પ્રગતિ (%)</th>
                      </tr>
                   </thead>
                   <tbody>
                      {STANDARDS.map(std => {
                        const rec = currentFLN.records.find(r => r.standard === std) || { totalStudents: 0, weakStudents: 0 };
                        const enrollmentTotal = (Number(editSchool.enrollment?.[std]?.boys)||0) + (Number(editSchool.enrollment?.[std]?.girls)||0);
                        const effectiveTotal = rec.totalStudents || enrollmentTotal;
                        const perc = effectiveTotal ? Math.round(((Number(effectiveTotal) - Number(rec.weakStudents)) / Number(effectiveTotal)) * 100) : 0;
                        
                        return (
                          <tr key={std} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                              <td className="p-5 font-black text-slate-700 italic">{std === 'બાલવાટિકા' ? std : `ધોરણ ${std}`}</td>
                              <td className="p-3 text-center font-black text-indigo-300 bg-slate-50/50 italic">{effectiveTotal}</td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  disabled={isReadOnly} 
                                  value={rec.weakStudents}
                                  onChange={e => updateFLNRecord(std, 'weakStudents', parseInt(e.target.value)||0)}
                                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-center text-red-600 outline-none focus:bg-white focus:ring-1 focus:ring-red-200" 
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3 text-center font-black text-indigo-600 italic">
                                {perc} %
                              </td>
                          </tr>
                        );
                      })}
                   </tbody>
                </table>
             </div>
           </div>
        )}

        {activeSection === 'cwsn' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-indigo-50 p-8 rounded-[2.5rem] border border-indigo-100 space-y-6 shadow-sm">
                   <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">સામાન્ય વિગત (General Info)</h4>
                   <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કુલ બાળકો</label>
                         <input type="number" disabled={isReadOnly} value={cwsn.studentCount} onChange={e => updateNested('cwsnData', 'studentCount', parseInt(e.target.value)||0)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black text-slate-700"/>
                      </div>
                      <div>
                         <label className="text-[9px] font-black text-slate-500 uppercase ml-1">પ્રમાણપત્ર ધરાવતા</label>
                         <input type="number" disabled={isReadOnly} value={cwsn.certificateCount} onChange={e => updateNested('cwsnData', 'certificateCount', parseInt(e.target.value)||0)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black text-slate-700"/>
                      </div>
                      <div className="col-span-2">
                         <label className="text-[9px] font-black text-slate-500 uppercase ml-1">સહાય મળેલ છે?</label>
                         <select disabled={isReadOnly} value={cwsn.receivedAssistance} onChange={e => updateNested('cwsnData', 'receivedAssistance', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black text-slate-700">
                            <option value="">-- પસંદ કરો --</option>
                            <option value="હા">હા (YES)</option>
                            <option value="ના">ના (NO)</option>
                         </select>
                      </div>
                      {cwsn.receivedAssistance === 'હા' && (
                         <div className="col-span-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[9px] font-black text-indigo-500 uppercase ml-1">સહાયની વિગત (EX: TRANSPORT ALLOWANCE)</label>
                            <input type="text" disabled={isReadOnly} value={cwsn.assistanceDetails} onChange={e => updateNested('cwsnData', 'assistanceDetails', e.target.value.toUpperCase())} className="w-full bg-white border border-indigo-200 p-4 rounded-2xl font-black text-indigo-700" placeholder="સહાયની વિગત લખો..."/>
                         </div>
                      )}
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm flex flex-col">
                   <div className="flex justify-between items-center mb-2">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-slate-500 pl-3">બાળકોના નામની યાદી</h4>
                      {!isReadOnly && <button onClick={addCWSNStudent} className="bg-indigo-600 text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">+ ઉમેરો</button>}
                   </div>
                   <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar max-h-[350px]">
                      {(cwsn.students || []).map((s, idx) => (
                         <div key={idx} className="flex gap-2 items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm group">
                            <span className="text-[10px] font-black text-slate-300 w-4">{idx + 1}</span>
                            <input type="text" disabled={isReadOnly} value={s.name} onChange={e => updateCWSNStudent(idx, 'name', e.target.value.toUpperCase())} className="flex-grow bg-slate-50 border-none p-2 rounded-lg text-xs font-bold" placeholder="બાળકનું નામ"/>
                            <select disabled={isReadOnly} value={s.standard} onChange={e => updateCWSNStudent(idx, 'standard', e.target.value)} className="bg-slate-50 border-none p-2 rounded-lg text-xs font-bold w-24">
                               {STANDARDS.map(std => <option key={std} value={std}>{std === 'બાલવાટિકા' ? 'બાલ' : `ધો. ${std}`}</option>)}
                            </select>
                            {!isReadOnly && <button onClick={() => removeCWSNStudent(idx)} className="text-red-400 p-2 hover:bg-red-50 rounded-lg transition-colors">✕</button>}
                         </div>
                      ))}
                      {(!cwsn.students || cwsn.students.length === 0) && (
                        <div className="text-center py-20 opacity-30">
                           <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v2m0 0v2m0-2h2m-2 0h-2"/></svg>
                           <p className="text-[10px] font-black uppercase">કોઈ એન્ટ્રી નથી</p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDataEntry;
