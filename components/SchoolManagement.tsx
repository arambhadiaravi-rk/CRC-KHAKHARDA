
import React, { useState, useEffect, useRef } from 'react';
import { School, Teacher, UserRole, PhysicalFacilities, SMCMeeting } from '../types';

interface SchoolManagementProps {
  school: School;
  onUpdate: (updatedSchool: School) => void;
  userRole: UserRole;
}

const SchoolManagement: React.FC<SchoolManagementProps> = ({ school, onUpdate, userRole }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [editSchool, setEditSchool] = useState<School>(() => ({ ...school }));
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isReadOnly = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  const subTabs = [
    { id: 'profile', label: 'પ્રોફાઇલ', icon: '🆔' },
    { id: 'teachers', label: 'શિક્ષકો', icon: '👨‍🏫' },
    { id: 'facilities', label: 'સુવિધાઓ', icon: '🛠️' },
    { id: 'smc', label: 'SMC બેઠક', icon: '🤝' },
    { id: 'gallery', label: 'ગેલેરી', icon: '🖼️' }
  ];

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

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500 overflow-hidden">
      {/* Sub Navigation */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-2">
          {subTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-100 shadow-sm'
              }`}
            >
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-6 md:p-8 custom-scrollbar pb-32">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-slate-800 uppercase">{subTabs.find(t => t.id === activeTab)?.label} મેનેજમેન્ટ</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
              {isReadOnly ? 'VIEW ONLY MODE' : 'EDITOR MODE - LOCAL STORAGE SYNC'}
            </p>
          </div>
          {!isReadOnly && (activeTab !== 'gallery') && (
            <button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-xl active:scale-95 flex items-center gap-2 transition-all">
              {isSaving ? 'સેવ થઈ રહ્યું છે...' : 'માહિતી સેવ કરો (SAVE ALL)'}
            </button>
          )}
        </div>

        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
             <div className="col-span-full mb-2"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">શાળાની મૂળભૂત વિગતો</h4></div>
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">શાળાનો પ્રકાર</label>
                <select disabled={isReadOnly} value={editSchool.schoolType} onChange={e => setEditSchool({...editSchool, schoolType: e.target.value as any})} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                   <option value="">-- પસંદ કરો --</option>
                   <option value="SOE">SOE (School of Excellence)</option>
                   <option value="NON SOE">NON SOE</option>
                   <option value="PM SHREE GOG">PM SHREE GOG</option>
                   <option value="PM SHREE GOI">PM SHREE GOI</option>
                </select>
             </div>
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">ચાલતા ધોરણો</label>
                <select disabled={isReadOnly} value={editSchool.standards} onChange={e => setEditSchool({...editSchool, standards: e.target.value as any})} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                   <option value="">-- પસંદ કરો --</option>
                   <option value="1-5">1 થી 5</option>
                   <option value="1-8">1 થી 8</option>
                   <option value="9-10">9 થી 10</option>
                </select>
             </div>
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">આચાર્યનું નામ</label>
                <input disabled={isReadOnly} value={editSchool.principal} onChange={e => setEditSchool({...editSchool, principal: e.target.value.toUpperCase()})} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none focus:ring-1 focus:ring-emerald-500"/>
             </div>
             <div>
                <label className="text-[9px] font-black text-slate-500 uppercase ml-1">સંપર્ક નંબર (Contact)</label>
                <input disabled={isReadOnly} value={editSchool.contact} onChange={e => setEditSchool({...editSchool, contact: e.target.value})} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold outline-none focus:ring-1 focus:ring-emerald-500"/>
             </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">સ્ટાફ ડાયરેક્ટરી</h4>
               {!isReadOnly && (
                 <button 
                  onClick={() => {
                    const newT: Teacher = { id: Date.now().toString(), name: '', gender: '', designation: '', dob: '', mobile: '', aadhaar: '', joiningServiceDate: '', joiningSchoolDate: '', section: '', subject: '' };
                    setEditSchool({...editSchool, teachers: [...(editSchool.teachers || []), newT]});
                  }}
                  className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all hover:bg-emerald-200"
                 >+ નવો શિક્ષક ઉમેરો</button>
               )}
            </div>
            {(editSchool.teachers || []).map((t, idx) => (
              <div key={t.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative grid grid-cols-1 md:grid-cols-4 gap-4 shadow-sm">
                <div className="md:col-span-4 flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                   <span className="bg-slate-900 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs">{idx + 1}</span>
                   {!isReadOnly && <button onClick={() => setEditSchool({...editSchool, teachers: (editSchool.teachers || []).filter(x => x.id !== t.id)})} className="text-red-500 text-[10px] font-black uppercase hover:underline">કાઢી નાખો</button>}
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">શિક્ષકનું નામ</label>
                  <input disabled={isReadOnly} value={t.name} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, name: e.target.value.toUpperCase()} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">જન્મતારીખ (DOB)</label>
                  <input type="date" disabled={isReadOnly} value={t.dob} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, dob: e.target.value} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">મોબાઈલ</label>
                  <input disabled={isReadOnly} value={t.mobile} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, mobile: e.target.value} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">હોદ્દો (Designation)</label>
                  <input disabled={isReadOnly} value={t.designation} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, designation: e.target.value.toUpperCase()} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">ખાતામાં દાખલ તારીખ</label>
                  <input type="date" disabled={isReadOnly} value={t.joiningServiceDate} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, joiningServiceDate: e.target.value} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">શાળામાં દાખલ તારીખ</label>
                  <input type="date" disabled={isReadOnly} value={t.joiningSchoolDate} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, joiningSchoolDate: e.target.value} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:ring-1 focus:ring-emerald-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">વિભાગ (Section)</label>
                  <select disabled={isReadOnly} value={t.section} onChange={e => {
                    const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, section: e.target.value as any, subject: e.target.value === 'પ્રાથમિક' ? '' : item.subject} : item);
                    setEditSchool({...editSchool, teachers: updated});
                  }} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm">
                    <option value="">-- પસંદ કરો --</option>
                    <option value="પ્રાથમિક">પ્રાથમિક (1-5)</option>
                    <option value="ઉચ્ચ પ્રાથમિક">ઉચ્ચ પ્રાથમિક (6-8)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">વિષય (Subject)</label>
                  <select 
                    disabled={isReadOnly || t.section !== 'ઉચ્ચ પ્રાથમિક'} 
                    value={t.subject} 
                    onChange={e => {
                      const updated = (editSchool.teachers || []).map(item => item.id === t.id ? {...item, subject: e.target.value as any} : item);
                      setEditSchool({...editSchool, teachers: updated});
                    }} 
                    className={`w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-sm ${t.section !== 'ઉચ્ચ પ્રાથમિક' ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    <option value="">-- પસંદ કરો --</option>
                    <option value="ભાષા">ભાષા</option>
                    <option value="ગણિત-વિજ્ઞાન">ગણિત-વિજ્ઞાન</option>
                    <option value="સામાજિક વિજ્ઞાન">સામાજિક વિજ્ઞાન</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-l-4 border-blue-500 pl-3">ઓરડા અને શૌચાલય</h4>
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">શાળાના કુલ ઓરડા</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.roomsCount || ''} onChange={e => updateNested('facilities', 'roomsCount', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કુમાર યુરિનલ</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.boysUrinals || ''} onChange={e => updateNested('facilities', 'boysUrinals', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કન્યા યુરિનલ</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.girlsUrinals || ''} onChange={e => updateNested('facilities', 'girlsUrinals', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કુમાર શૌચાલય (Toilet)</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.boysToilets || ''} onChange={e => updateNested('facilities', 'boysToilets', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કન્યા શૌચાલય (Toilet)</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.girlsToilets || ''} onChange={e => updateNested('facilities', 'girlsToilets', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">CWSN ટોયલેટ સુવિધા?</label>
                    <select disabled={isReadOnly} value={editSchool.facilities?.hasCWSNToilet || ''} onChange={e => updateNested('facilities', 'hasCWSNToilet', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                       <option value="">-- પસંદ કરો --</option>
                       <option value="હા">હા (Yes)</option>
                       <option value="ના">ના (No)</option>
                    </select>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 border-l-4 border-emerald-500 pl-3">લેબ, પાણી અને અન્ય</h4>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કમ્પ્યુટર લેબ છે?</label>
                      <select disabled={isReadOnly} value={editSchool.facilities?.hasComputerLab || ''} onChange={e => updateNested('facilities', 'hasComputerLab', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs">
                         <option value="">-- પસંદ કરો --</option>
                         <option value="હા">હા</option>
                         <option value="ના">ના</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">LBD લેબ સુવિધા?</label>
                      <select disabled={isReadOnly} value={editSchool.facilities?.hasLBDLab || ''} onChange={e => updateNested('facilities', 'hasLBDLab', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs">
                         <option value="">-- પસંદ કરો --</option>
                         <option value="હા">હા</option>
                         <option value="ના">ના</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">અન્ય કોઈ લેબ છે?</label>
                      <select disabled={isReadOnly} value={editSchool.facilities?.hasOtherLab || ''} onChange={e => updateNested('facilities', 'hasOtherLab', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs">
                         <option value="">-- પસંદ કરો --</option>
                         <option value="હા">હા</option>
                         <option value="ના">ના</option>
                      </select>
                    </div>
                    {editSchool.facilities?.hasOtherLab === 'હા' && (
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase ml-1">અન્ય લેબની વિગત</label>
                        <input disabled={isReadOnly} value={editSchool.facilities?.otherLabDetails || ''} onChange={e => updateNested('facilities', 'otherLabDetails', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs outline-none focus:ring-1 focus:ring-emerald-500" placeholder="લેબનું નામ..."/>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">કુલ કમ્પ્યુટર સંખ્યા</label>
                    <input type="number" disabled={isReadOnly} value={editSchool.facilities?.computerCount || ''} onChange={e => updateNested('facilities', 'computerCount', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase ml-1">ઇન્ટરનેટ કનેક્શન છે?</label>
                    <select disabled={isReadOnly} value={editSchool.facilities?.hasInternet || ''} onChange={e => updateNested('facilities', 'hasInternet', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold">
                       <option value="">-- પસંદ કરો --</option>
                       <option value="હા">હા</option>
                       <option value="ના">ના</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">RO પ્લાન્ટ સુવિધા?</label>
                      <select disabled={isReadOnly} value={editSchool.facilities?.hasRO || ''} onChange={e => updateNested('facilities', 'hasRO', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs">
                         <option value="">-- પસંદ કરો --</option>
                         <option value="હા">હા</option>
                         <option value="ના">ના</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-500 uppercase ml-1">વેન્ડિંગ મશીન છે?</label>
                      <select disabled={isReadOnly} value={editSchool.facilities?.hasVendingMachine || ''} onChange={e => updateNested('facilities', 'hasVendingMachine', e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs">
                         <option value="">-- પસંદ કરો --</option>
                         <option value="હા">હા</option>
                         <option value="ના">ના</option>
                      </select>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'smc' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-l-4 border-indigo-500 pl-3">SMC બેઠકોની વિગત</h4>
               {!isReadOnly && (
                 <button 
                  onClick={() => {
                    const newM: SMCMeeting = { id: Date.now().toString(), date: '', membersCount: '' };
                    setEditSchool({...editSchool, smcMeetings: [...(editSchool.smcMeetings || []), newM]});
                  }}
                  className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all hover:bg-indigo-200"
                 >+ નવી બેઠક ઉમેરો</button>
               )}
            </div>
            <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs bg-white rounded-3xl overflow-hidden">
                     <thead>
                        <tr className="bg-slate-900 text-white">
                           <th className="p-5 font-black uppercase text-center w-16">ક્રમ</th>
                           <th className="p-5 font-black uppercase">બેઠકની તારીખ</th>
                           <th className="p-5 font-black uppercase text-center">હાજર સભ્યોની સંખ્યા</th>
                           {!isReadOnly && <th className="p-5 font-black uppercase text-center w-24">ક્રિયા</th>}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {(editSchool.smcMeetings || []).map((m, idx) => (
                           <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-5 text-center font-black text-slate-400">{idx + 1}</td>
                              <td className="p-3">
                                 <input 
                                    type="date" 
                                    disabled={isReadOnly} 
                                    value={m.date} 
                                    onChange={e => {
                                       const updated = (editSchool.smcMeetings || []).map(item => item.id === m.id ? {...item, date: e.target.value} : item);
                                       setEditSchool({...editSchool, smcMeetings: updated});
                                    }} 
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-sm outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                 />
                              </td>
                              <td className="p-3">
                                 <input 
                                    type="number" 
                                    disabled={isReadOnly} 
                                    value={m.membersCount} 
                                    onChange={e => {
                                       const updated = (editSchool.smcMeetings || []).map(item => item.id === m.id ? {...item, membersCount: parseInt(e.target.value) || ''} : item);
                                       setEditSchool({...editSchool, smcMeetings: updated});
                                    }} 
                                    placeholder="સભ્યોની સંખ્યા..."
                                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-center text-sm outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                                 />
                              </td>
                              {!isReadOnly && (
                                 <td className="p-3 text-center">
                                    <button 
                                       onClick={() => setEditSchool({...editSchool, smcMeetings: (editSchool.smcMeetings || []).filter(x => x.id !== m.id)})} 
                                       className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                                    >
                                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                 </td>
                              )}
                           </tr>
                        ))}
                        {(!editSchool.smcMeetings || editSchool.smcMeetings.length === 0) && (
                           <tr>
                              <td colSpan={isReadOnly ? 3 : 4} className="p-10 text-center italic text-slate-400 font-bold uppercase tracking-widest text-[10px]">કોઈ બેઠક ડેટા નથી</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-8">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">શાળાના ફોટા (School Gallery)</h4>
               {!isReadOnly && (
                 <>
                  <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => {
                    if (e.target.files) {
                      (Array.from(e.target.files) as File[]).forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const updatedGallery = [...(editSchool.gallery || []), ev.target?.result as string];
                          setEditSchool(prev => ({
                            ...prev,
                            gallery: updatedGallery
                          }));
                          // Auto update on gallery changes since they are immediate actions
                          onUpdate({...editSchool, gallery: updatedGallery});
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }} />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-blue-700 transition-all">+ ફોટા અપલોડ કરો</button>
                 </>
               )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
               {(editSchool.gallery || []).map((img, i) => (
                 <div key={i} className="aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 relative group shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    {!isReadOnly && (
                      <button onClick={() => {
                        const updatedGallery = (editSchool.gallery || []).filter((_, idx) => idx !== i);
                        setEditSchool({...editSchool, gallery: updatedGallery});
                        onUpdate({...editSchool, gallery: updatedGallery});
                      }} className="absolute top-1 right-1 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    )}
                 </div>
               ))}
               {!editSchool.gallery?.length && <div className="col-span-full py-16 text-center text-slate-300 font-bold italic border-2 border-dashed border-slate-200 rounded-3xl uppercase text-[10px] tracking-widest">કોઈ ફોટા ઉપલબ્ધ નથી</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolManagement;
