
import React, { useState, useEffect } from 'react';
import { School, UserRole, ClassEnrollment, StudentStats, FLNRecord, MonthlyFLN } from '../types';

interface StudentDataEntryProps {
  school: School;
  activeSection: 'enrollment' | 'student-stats' | 'cwsn' | 'fln';
  onUpdate: (updatedSchool: School) => void;
  userRole: UserRole;
}

const StudentDataEntry: React.FC<StudentDataEntryProps> = ({ school, activeSection, onUpdate, userRole }) => {
  const [editSchool, setEditSchool] = useState<School>(() => ({ ...school }));
  const [isSaving, setIsSaving] = useState(false);
  
  const isReadOnly = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  useEffect(() => {
    setEditSchool({ ...school });
  }, [school]);

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
    setEditSchool(prev => ({
      ...prev,
      [category]: {
        ...(prev as any)[category],
        [field]: value
      }
    }));
  };

  const STANDARDS = editSchool.standards === '9-10' ? ['9', '10'] : 
                    editSchool.standards === '1-5' ? ['1', '2', '3', '4', '5'] : 
                    ['1', '2', '3', '4', '5', '6', '7', '8'];

  const grandTotal = (Object.values(editSchool.enrollment || {}) as ClassEnrollment[]).reduce((acc, curr) => acc + (Number(curr.boys) || 0) + (Number(curr.girls) || 0), 0);

  // FLN Helpers
  const currentFLN: MonthlyFLN = editSchool.flnData?.[0] || { month: 'માર્ચ-૨૦૨૫', records: [] };
  
  const updateFLNRecord = (std: string, field: keyof FLNRecord, value: number) => {
    if (isReadOnly) return;
    const records = [...currentFLN.records];
    const index = records.findIndex(r => r.standard === std);
    if (index >= 0) {
      records[index] = { ...records[index], [field]: value };
    } else {
      records.push({ standard: std, totalStudents: field === 'totalStudents' ? value : 0, weakStudents: field === 'weakStudents' ? value : 0 });
    }
    setEditSchool({ ...editSchool, flnData: [{ ...currentFLN, records }] });
  };

  const flnTotals = currentFLN.records.reduce((acc, curr) => {
    if (STANDARDS.includes(curr.standard)) {
      acc.total += Number(curr.totalStudents) || 0;
      acc.weak += Number(curr.weakStudents) || 0;
    }
    return acc;
  }, { total: 0, weak: 0 });

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase">
              {activeSection === 'enrollment' && 'ધોરણ મુજબ સંખ્યા'}
              {activeSection === 'student-stats' && 'વિદ્યાર્થી કાર્ડ સ્ટેટસ'}
              {activeSection === 'cwsn' && 'દિવ્યાંગ બાળકોની વિગત'}
              {activeSection === 'fln' && 'FLN ડેટા એન્ટ્રી'}
            </h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {isReadOnly ? 'VIEW ONLY' : 'SCHOOL DATA EDITOR'}
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
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">ધોરણ મુજબ સંખ્યા</h4>
               <div className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-xs font-black">શાળાનો ગ્રાન્ડ ટોટલ: {grandTotal}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {STANDARDS.map(std => {
                const data = (editSchool.enrollment || {})[std] || { boys: 0, girls: 0 };
                const total = (Number(data.boys)||0) + (Number(data.girls)||0);
                return (
                  <div key={std} className="bg-white p-5 rounded-3xl border border-slate-200/50 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="font-black text-emerald-600">ધોરણ: {std}</span>
                       <span className="text-[10px] font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-full uppercase">ટોટલ: {total}</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[9px] font-black text-blue-400 uppercase ml-1">કુમાર (Boys)</label>
                        <input type="number" disabled={isReadOnly} value={data.boys} onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          updateNested('enrollment', std, { ...data, boys: val });
                        }} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-blue-700 outline-none focus:bg-white"/>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-pink-400 uppercase ml-1">કન્યા (Girls)</label>
                        <input type="number" disabled={isReadOnly} value={data.girls} onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          updateNested('enrollment', std, { ...data, girls: val });
                        }} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-black text-pink-700 outline-none focus:bg-white"/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeSection === 'student-stats' && (
          <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-indigo-500 pl-3">વિદ્યાર્થી આઈડી અને રજીસ્ટ્રેશન સ્ટેટસ</h4>
            <div className="overflow-x-auto">
               <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="p-5 font-black uppercase">ધોરણ</th>
                       <th className="p-5 font-black uppercase text-center bg-emerald-800">કુલ રજીસ્ટર્ડ</th>
                       <th className="p-5 font-black uppercase text-center">MBU કાર્ડ</th>
                       <th className="p-5 font-black uppercase text-center">આધાર એન્ટ્રી</th>
                       <th className="p-5 font-black uppercase text-center bg-indigo-900/50">APAAR ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {STANDARDS.map(std => {
                      const data = (editSchool.studentStats || {})[std] || { totalRegistered: 0, mbuCount: 0, aadhaarCount: 0, apaarCount: 0 };
                      return (
                        <tr key={std} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                           <td className="p-5 font-black text-slate-700 italic">ધોરણ {std}</td>
                           <td className="p-3 bg-emerald-50/50"><input type="number" disabled={isReadOnly} value={data.totalRegistered} onChange={e => updateNested('studentStats', std, {...data, totalRegistered: parseInt(e.target.value)||0})} className="w-full bg-white border border-emerald-100 p-3 rounded-xl font-bold text-center text-emerald-700"/></td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.mbuCount} onChange={e => updateNested('studentStats', std, {...data, mbuCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-center"/></td>
                           <td className="p-3"><input type="number" disabled={isReadOnly} value={data.aadhaarCount} onChange={e => updateNested('studentStats', std, {...data, aadhaarCount: parseInt(e.target.value)||0})} className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-center"/></td>
                           <td className="p-3 bg-indigo-50/50"><input type="number" disabled={isReadOnly} value={data.apaarCount} onChange={e => updateNested('studentStats', std, {...data, apaarCount: parseInt(e.target.value)||0})} className="w-full bg-white border border-indigo-100 p-3 rounded-xl font-bold text-center text-blue-600"/></td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {activeSection === 'cwsn' && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 shadow-sm">
               <div className="col-span-full"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">દિવ્યાંગ બાળકોનો સારાંશ</h4></div>
               <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કુલ દિવ્યાંગ બાળકો</label>
                  <input type="number" disabled={isReadOnly} value={editSchool.cwsnData?.studentCount || ''} onChange={e => updateNested('cwsnData', 'studentCount', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
               </div>
               <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">પ્રમાણપત્ર છે?</label>
                  <select disabled={isReadOnly} value={editSchool.cwsnData?.hasCertificate || ''} onChange={e => updateNested('cwsnData', 'hasCertificate', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                     <option value="">-- પસંદ કરો --</option>
                     <option value="હા">હા</option>
                     <option value="ના">ના</option>
                  </select>
               </div>
               {editSchool.cwsnData?.hasCertificate === 'હા' && (
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">પ્રમાણપત્ર ધરાવતા બાળકોની સંખ્યા</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.cwsnData?.certificateCount || ''} onChange={e => updateNested('cwsnData', 'certificateCount', parseInt(e.target.value))} className="w-full bg-white border border-emerald-200 p-3 rounded-xl font-bold text-emerald-700"/>
                  </div>
               )}
               <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase ml-1">સહાય મળેલ છે?</label>
                  <select disabled={isReadOnly} value={editSchool.cwsnData?.receivedAssistance || ''} onChange={e => updateNested('cwsnData', 'receivedAssistance', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                     <option value="">-- પસંદ કરો --</option>
                     <option value="હા">હા</option>
                     <option value="ના">ના</option>
                  </select>
               </div>
               {editSchool.cwsnData?.receivedAssistance === 'હા' && (
                 <div className="md:col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">સહાયની વિગત</label>
                    <input disabled={isReadOnly} value={editSchool.cwsnData?.assistanceDetails || ''} onChange={e => updateNested('cwsnData', 'assistanceDetails', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none focus:ring-1 focus:ring-emerald-500" placeholder="કઈ સહાય મળી તે લખો..."/>
                 </div>
               )}
            </div>
            
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">દિવ્યાંગ બાળકોની યાદી (Student List)</h4>
                  {!isReadOnly && <button onClick={() => {
                    const newList = [...(editSchool.cwsnData?.students || []), { name: '', standard: '' }];
                    updateNested('cwsnData', 'students', newList);
                  }} className="text-indigo-600 text-[10px] font-black uppercase hover:underline">+ નવું બાળક ઉમેરો</button>}
               </div>
               <div className="space-y-4">
                  {(editSchool.cwsnData?.students || []).map((s, idx) => (
                    <div key={idx} className="flex gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                       <input disabled={isReadOnly} value={s.name} onChange={e => {
                         const newList = [...(editSchool.cwsnData?.students || [])];
                         newList[idx] = {...newList[idx], name: e.target.value.toUpperCase()};
                         updateNested('cwsnData', 'students', newList);
                       }} placeholder="બાળકનું નામ" className="flex-grow bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none focus:bg-white transition-all"/>
                       <select disabled={isReadOnly} value={s.standard} onChange={e => {
                         const newList = [...(editSchool.cwsnData?.students || [])];
                         newList[idx] = {...newList[idx], standard: e.target.value};
                         updateNested('cwsnData', 'students', newList);
                       }} className="w-24 bg-slate-50 p-3 rounded-xl font-black text-[10px] uppercase">
                          <option value="">ધોરણ</option>
                          {STANDARDS.map(st => <option key={st} value={st}>{st}</option>)}
                       </select>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeSection === 'fln' && (
           <div className="bg-slate-50 p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-8">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">FLN (Foundational Literacy and Numeracy) ડેટા</h4>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">માસ પસંદ કરો:</span>
                  <select className="bg-white border border-slate-200 p-2 rounded-xl text-xs font-black outline-none">
                    <option>માર્ચ-૨૦૨૫</option>
                    <option>ફેબ્રુઆરી-૨૦૨૫</option>
                  </select>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden shadow-sm">
                   <thead>
                      <tr className="bg-indigo-600 text-white">
                         <th className="p-5 font-black uppercase">ધોરણ</th>
                         <th className="p-5 font-black uppercase text-center">કુલ સંખ્યા</th>
                         <th className="p-5 font-black uppercase text-center bg-indigo-700">કચાશ ધરાવતા વિદ્યાર્થીઓ</th>
                         <th className="p-5 font-black uppercase text-center">પ્રગતિ (%)</th>
                      </tr>
                   </thead>
                   <tbody>
                      {STANDARDS.map(std => {
                        const rec = currentFLN.records.find(r => r.standard === std) || { totalStudents: 0, weakStudents: 0 };
                        const perc = rec.totalStudents ? Math.round(((Number(rec.totalStudents) - Number(rec.weakStudents)) / Number(rec.totalStudents)) * 100) : 0;
                        
                        return (
                          <tr key={std} className="border-b border-slate-100 hover:bg-indigo-50/30">
                              <td className="p-5 font-black text-slate-700 italic">ધોરણ {std}</td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  disabled={isReadOnly} 
                                  value={rec.totalStudents}
                                  onChange={e => updateFLNRecord(std, 'totalStudents', parseInt(e.target.value)||0)}
                                  className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl font-bold text-center outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200" 
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3 bg-indigo-50/20">
                                <input 
                                  type="number" 
                                  disabled={isReadOnly} 
                                  value={rec.weakStudents}
                                  onChange={e => updateFLNRecord(std, 'weakStudents', parseInt(e.target.value)||0)}
                                  className="w-full bg-white border border-indigo-100 p-3 rounded-xl font-bold text-center text-red-600 outline-none focus:ring-1 focus:ring-red-200" 
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
                   <tfoot className="bg-indigo-50/50">
                      <tr className="border-t-2 border-indigo-100">
                         <td className="p-5 font-black text-indigo-900 text-sm uppercase">કુલ (TOTAL)</td>
                         <td className="p-5 text-center font-black text-indigo-900 text-lg">
                           {flnTotals.total}
                         </td>
                         <td className="p-5 text-center font-black text-red-600 text-lg bg-red-50/30">
                           {flnTotals.weak}
                         </td>
                         <td className="p-5 text-center font-black text-indigo-900 text-lg">
                           {flnTotals.total ? Math.round(((flnTotals.total - flnTotals.weak) / flnTotals.total) * 100) : 0} %
                         </td>
                      </tr>
                   </tfoot>
                </table>
             </div>
             <p className="mt-6 text-[9px] font-bold text-slate-400 uppercase italic">* પ્રગતિની ગણતરી (કુલ સંખ્યા - કચાશ) / કુલ સંખ્યા ના આધારે કરવામાં આવે છે.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default StudentDataEntry;
