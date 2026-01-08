
import React, { useState, useRef, useEffect } from 'react';
import { School, Teacher, UserRole, PhysicalFacilities } from '../types';

interface SchoolManagementProps {
  school: School;
  onUpdate: (updatedSchool: School) => void;
  userRole: UserRole;
  activeSubTabFromProps?: string;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({ school, onUpdate, userRole, activeSubTabFromProps }) => {
  const [activeTab, setActiveTab] = useState(activeSubTabFromProps || 'teachers');
  const [editSchool, setEditSchool] = useState<School>(() => ({ ...school }));
  const [isSaving, setIsSaving] = useState(false);
  const [saveComplete, setSaveComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isReadOnly = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  const subTabs = [
    { id: 'teachers', label: 'શિક્ષકો', icon: '👨‍🏫' },
    { id: 'enrollment', label: 'સંખ્યા', icon: '📝' },
    { id: 'students', label: 'વિદ્યાર્થી ડેટા', icon: '👤' },
    { id: 'fln', label: 'FLN', icon: '📈' },
    { id: 'facilities', label: 'સુવિધાઓ', icon: '🛠️' },
    { id: 'gallery', label: 'ગેલેરી', icon: '🖼️' }
  ];

  const primaryClasses = ["બાલવાટિકા", "ધોરણ ૧", "ધોરણ ૨", "ધોરણ ૩", "ધોરણ ૪", "ધોરણ ૫", "ધોરણ ૬", "ધોરણ ૭", "ધોરણ ૮"];
  const highSchoolClasses = ["ધોરણ ૯", "ધોરણ ૧૦"];
  
  const classesToDisplay = (editSchool.standards === '9-10') 
    ? highSchoolClasses 
    : (editSchool.standards === '1-8' ? primaryClasses : primaryClasses.slice(0, 6));

  useEffect(() => {
    if (activeSubTabFromProps) {
      setActiveTab(activeSubTabFromProps);
    }
  }, [activeSubTabFromProps]);

  useEffect(() => {
    setEditSchool(prev => {
      if (prev.id !== school.id) return { ...school };
      return prev;
    });
  }, [school.id]);

  const handleSave = async () => {
    if (isReadOnly) return;
    setIsSaving(true);
    setSaveComplete(false);
    
    // Simulate real-time upload to cloud
    await new Promise(resolve => setTimeout(resolve, 1500));
    onUpdate(editSchool);
    
    setIsSaving(false);
    setSaveComplete(true);
    
    // Reset success state after 3 seconds
    setTimeout(() => setSaveComplete(false), 3000);
  };

  const updateTeacher = (id: string, field: keyof Teacher, value: string) => {
    if (isReadOnly) return;
    const updated = (editSchool.teachers || []).map(t => t.id === id ? { ...t, [field]: value } : t);
    setEditSchool({ ...editSchool, teachers: updated });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onloadend = () => setEditSchool(prev => ({ ...prev, gallery: [...(prev.gallery || []), reader.result as string] }));
    reader.readAsDataURL(files[0]);
  };

  const enrollmentTotals = classesToDisplay.reduce((acc, cls) => {
    const d = editSchool.enrollment?.[cls] || { boys: 0, girls: 0 };
    acc.boys += Number(d.boys) || 0;
    acc.girls += Number(d.girls) || 0;
    return acc;
  }, { boys: 0, girls: 0 });

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden relative">
      {/* Real-time Sub-navigation Bar */}
      <div className="bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <div className="flex p-2 gap-2 min-w-max">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100 scale-105' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Success Overlay */}
      {saveComplete && (
        <div className="absolute top-20 right-8 z-50 animate-in slide-in-from-right-4">
           <div className="bg-emerald-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-400/20">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <p className="text-xs font-black uppercase tracking-widest">રીઅલ-ટાઇમમાં અપલોડ થયું!</p>
           </div>
        </div>
      )}

      <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight uppercase">
              {subTabs.find(t => t.id === activeTab)?.label} - વ્યવસ્થાપન
            </h2>
            <div className="flex items-center gap-2 mt-1">
               <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded-lg inline-block">
                 {editSchool.name}
               </p>
               <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-lg uppercase">Cloud ID: {school.diseCode}</span>
            </div>
          </div>
          {!isReadOnly && (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`px-6 py-3.5 rounded-2xl font-black shadow-xl transition-all flex items-center gap-2 text-xs relative ${
                isSaving ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 active:scale-95'
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              )}
              {isSaving ? 'સર્વર પર અપલોડ...' : 'માહિતી સાચવો'}
            </button>
          )}
        </div>

        {/* Dynamic Content Rendering */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-[11px] uppercase text-slate-400 tracking-widest border-l-4 border-emerald-500 pl-3">સ્ટાફ વિગત</h3>
                 {!isReadOnly && (
                   <button 
                     onClick={() => setEditSchool(p => ({...p, teachers: [...(p.teachers||[]), {id:Date.now().toString(), name:'', gender:'', designation:'', dob:'', mobile:'', aadhaar:'', joiningServiceDate:'', joiningSchoolDate:'', section:''}]}))} 
                     className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-[10px] font-black hover:bg-black transition-all shadow-lg active:scale-95"
                   >
                     + નવો શિક્ષક
                   </button>
                 )}
              </div>
              <div className="grid grid-cols-1 gap-6">
                {(editSchool.teachers || []).map(t => (
                  <div key={t.id} className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200 relative group transition-all hover:bg-white hover:shadow-xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">નામ</label>
                        <input value={t.name} disabled={isReadOnly} onChange={e => updateTeacher(t.id, 'name', e.target.value.toUpperCase())} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-emerald-500 outline-none"/>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">હોદ્દો</label>
                        <select value={t.designation} disabled={isReadOnly} onChange={e => updateTeacher(t.id, 'designation', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-emerald-500 outline-none">
                          <option value="">-- પસંદ કરો --</option>
                          <option value="આચાર્ય">આચાર્ય</option>
                          <option value="મદદનીશ શિક્ષક">મદદનીશ શિક્ષક</option>
                          <option value="જ્ઞાન સહાયક">જ્ઞાન સહાયક</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">મોબાઈલ</label>
                        <input value={t.mobile} disabled={isReadOnly} onChange={e => updateTeacher(t.id, 'mobile', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm focus:border-emerald-500 outline-none"/>
                      </div>
                    </div>
                    {!isReadOnly && (
                      <button onClick={() => setEditSchool(p => ({...p, teachers: (p.teachers||[]).filter(x => x.id !== t.id)}))} className="absolute -top-2 -right-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">×</button>
                    )}
                  </div>
                ))}
                {(editSchool.teachers || []).length === 0 && <p className="text-center py-10 text-slate-300 font-bold italic">કોઈ શિક્ષક માહિતી નથી.</p>}
              </div>
            </div>
          )}

          {activeTab === 'enrollment' && (
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-200">
               <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase border-b bg-slate-50">
                      <th className="py-4 text-left px-4">ધોરણ</th>
                      <th className="py-4 text-center">કુમાર</th>
                      <th className="py-4 text-center">કન્યા</th>
                      <th className="py-4 text-center bg-slate-100 rounded-t-xl">કુલ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classesToDisplay.map(cls => {
                      const d = editSchool.enrollment?.[cls] || { boys: 0, girls: 0 };
                      return (
                        <tr key={cls} className="border-b border-slate-100">
                          <td className="py-4 px-4 font-black text-slate-800 text-sm">{cls}</td>
                          <td className="py-4 text-center">
                            <input type="number" disabled={isReadOnly} value={d.boys} onChange={e => setEditSchool({...editSchool, enrollment: {...editSchool.enrollment, [cls]: {...d, boys: parseInt(e.target.value)||0}}})} className="w-20 text-center border rounded-xl p-2 text-sm font-black text-emerald-700 focus:border-emerald-500 outline-none"/>
                          </td>
                          <td className="py-4 text-center">
                            <input type="number" disabled={isReadOnly} value={d.girls} onChange={e => setEditSchool({...editSchool, enrollment: {...editSchool.enrollment, [cls]: {...d, girls: parseInt(e.target.value)||0}}})} className="w-20 text-center border rounded-xl p-2 text-sm font-black text-pink-700 focus:border-pink-500 outline-none"/>
                          </td>
                          <td className="py-4 text-center font-black bg-slate-50 text-slate-900">{Number(d.boys) + Number(d.girls)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-900 text-white">
                      <td className="py-4 px-4 font-black rounded-bl-[2.5rem]">કુલ</td>
                      <td className="py-4 text-center font-black">{enrollmentTotals.boys}</td>
                      <td className="py-4 text-center font-black">{enrollmentTotals.girls}</td>
                      <td className="py-4 text-center font-black bg-slate-800 rounded-br-[2.5rem] text-emerald-400">{enrollmentTotals.boys + enrollmentTotals.girls}</td>
                    </tr>
                  </tfoot>
               </table>
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-[11px] uppercase text-slate-400 tracking-widest pl-3 border-l-4 border-pink-500">ગેલેરી અપલોડ</h3>
                 {!isReadOnly && (editSchool.gallery?.length || 0) < 10 && (
                   <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black shadow-lg active:scale-95">અપલોડ ફોટો</button>
                 )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(editSchool.gallery || []).map((img, idx) => (
                  <div key={idx} className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-slate-100 shadow-md">
                    <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    {!isReadOnly && <button onClick={() => setEditSchool({...editSchool, gallery: editSchool.gallery?.filter((_, i) => i !== idx)})} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center font-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">×</button>}
                  </div>
                ))}
                {(editSchool.gallery || []).length === 0 && <p className="col-span-full py-12 text-center text-slate-300 font-bold italic text-xs">કોઈ ફોટો ઉપલબ્ધ નથી.</p>}
              </div>
            </div>
          )}
          
          {['students', 'fln', 'facilities'].includes(activeTab) && (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
               <p className="text-slate-400 font-black text-sm uppercase tracking-widest">{activeTab} વિભાગ ટૂંક સમયમાં શરૂ થશે...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement;
