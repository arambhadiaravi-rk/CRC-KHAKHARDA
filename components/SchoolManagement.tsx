
import React, { useState, useEffect } from 'react';
import { School, Teacher, UserRole } from '../types';

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
  
  // CRC Admin is the only authority that can edit.
  // Principals can also edit their own school.
  const isReadOnly = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  const subTabs = [
    { id: 'teachers', label: 'શિક્ષકો (11 વિગતો)', icon: '👨‍🏫' },
    { id: 'enrollment', label: 'સંખ્યા', icon: '📝' },
    { id: 'facilities', label: 'સુવિધાઓ', icon: '🛠️' },
    { id: 'gallery', label: 'ગેલેરી', icon: '🖼️' }
  ];

  useEffect(() => {
    setEditSchool({ ...school });
  }, [school]);

  const handleSave = async () => {
    if (isReadOnly) {
      alert("તમને ડેટા ફેરફાર કરવાની પરવાનગી નથી. (View Only Mode)");
      return;
    }
    setIsSaving(true);
    await onUpdate(editSchool);
    setIsSaving(false);
    alert("ડેટા ક્લાઉડ સર્વર પર સફળતાપૂર્વક અપડેટ થયો છે!");
  };

  const updateTeacher = (id: string, field: keyof Teacher, value: string) => {
    if (isReadOnly) return;
    const updated = (editSchool.teachers || []).map(t => t.id === id ? { ...t, [field]: value } : t);
    setEditSchool({ ...editSchool, teachers: updated });
  };

  const addNewTeacher = () => {
    if (isReadOnly) return;
    const newT: Teacher = {
      id: Date.now().toString(),
      name: '',
      gender: '',
      designation: '',
      dob: '',
      mobile: '',
      aadhaar: '',
      joiningServiceDate: '',
      joiningSchoolDate: '',
      section: '',
      subject: ''
    };
    setEditSchool({ ...editSchool, teachers: [...(editSchool.teachers || []), newT] });
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-white text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 md:p-10 custom-scrollbar pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{subTabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${isReadOnly ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                 {isReadOnly ? 'Mode: View Only' : 'Mode: Editor'}
               </span>
               {isSaving && <span className="text-[10px] font-black text-blue-600 animate-pulse uppercase">Syncing...</span>}
            </div>
          </div>
          {!isReadOnly && (
            <button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black shadow-2xl active:scale-95 flex items-center gap-3">
              {isSaving ? 'સિંક થઈ રહ્યું છે...' : 'ક્લાઉડ સેવ (SAVE)'}
            </button>
          )}
        </div>

        {activeTab === 'teachers' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.2em] border-l-4 border-emerald-500 pl-4">સ્ટાફ ડાયરેક્ટરી</h3>
              {!isReadOnly && <button onClick={addNewTeacher} className="bg-emerald-100 text-emerald-700 px-6 py-3 rounded-xl font-black text-[10px] hover:bg-emerald-200 uppercase">+ નવો શિક્ષક</button>}
            </div>

            <div className="space-y-8">
              {(editSchool.teachers || []).map((t, idx) => (
                <div key={t.id} className={`bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 relative transition-all ${!isReadOnly ? 'hover:border-emerald-200 hover:bg-white' : ''}`}>
                  <div className="absolute top-10 left-10 bg-slate-900 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black">{idx + 1}</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    <div className="space-y-1 col-span-1 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૧. શિક્ષકનું પૂરેપૂરું નામ</label>
                      <input disabled={isReadOnly} value={t.name} onChange={e => updateTeacher(t.id, 'name', e.target.value.toUpperCase())} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100/50"/>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૨. જાતિ</label>
                      <select disabled={isReadOnly} value={t.gender} onChange={e => updateTeacher(t.id, 'gender', e.target.value as any)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50">
                        <option value="">-- પસંદ કરો --</option>
                        <option value="પુરુષ">પુરુષ</option>
                        <option value="સ્ત્રી">સ્ત્રી</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૩. હોદ્દો</label>
                      <input disabled={isReadOnly} value={t.designation} onChange={e => updateTeacher(t.id, 'designation', e.target.value.toUpperCase())} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૪. જન્મ તારીખ</label>
                      <input disabled={isReadOnly} type="date" value={t.dob} onChange={e => updateTeacher(t.id, 'dob', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૫. મોબાઈલ નંબર</label>
                      <input disabled={isReadOnly} value={t.mobile} onChange={e => updateTeacher(t.id, 'mobile', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૬. આધાર નંબર</label>
                      <input disabled={isReadOnly} value={t.aadhaar} onChange={e => updateTeacher(t.id, 'aadhaar', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૭. પ્રથમ નિમણૂક તારીખ</label>
                      <input disabled={isReadOnly} type="date" value={t.joiningServiceDate} onChange={e => updateTeacher(t.id, 'joiningServiceDate', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૮. હાજર થયા તારીખ</label>
                      <input disabled={isReadOnly} type="date" value={t.joiningSchoolDate} onChange={e => updateTeacher(t.id, 'joiningSchoolDate', e.target.value)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50"/>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૯. વિભાગ</label>
                      <select disabled={isReadOnly} value={t.section} onChange={e => updateTeacher(t.id, 'section', e.target.value as any)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50">
                        <option value="">-- પસંદ કરો --</option>
                        <option value="પ્રાથમિક">પ્રાથમિક</option>
                        <option value="ઉચ્ચ પ્રાથમિક">ઉચ્ચ પ્રાથમિક</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૧૦. વિષય</label>
                      <select disabled={isReadOnly} value={t.subject} onChange={e => updateTeacher(t.id, 'subject', e.target.value as any)} className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-black outline-none disabled:bg-slate-100/50">
                        <option value="">-- પસંદ કરો --</option>
                        <option value="ભાષા">ભાષા</option>
                        <option value="ગણિત-વિજ્ઞાન">ગણિત-વિજ્ઞાન</option>
                        <option value="સામાજિક વિજ્ઞાન">સામાજિક વિજ્ઞાન</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-2">૧૧. ક્રમ (ID)</label>
                      <input value={t.id} disabled className="w-full bg-slate-100 border border-slate-200 p-4 rounded-2xl font-black outline-none text-slate-400"/>
                    </div>
                  </div>

                  {!isReadOnly && (
                    <button onClick={() => setEditSchool({...editSchool, teachers: (editSchool.teachers||[]).filter(x => x.id !== t.id)})} className="absolute top-10 right-10 text-red-400 hover:text-red-600 font-black text-[10px] uppercase underline">કાઢી નાખો</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolManagement;
