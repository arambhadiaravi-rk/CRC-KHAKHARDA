
import React, { useState, useRef } from 'react';
import { Achievement, School, UserRole } from '../types';

interface SchoolAchievementsProps {
  achievements: Achievement[];
  onAdd: (achievement: Achievement) => void;
  onRemove: (id: string) => void;
  userRole: UserRole;
  loggedInSchool: School | null;
}

const SchoolAchievements: React.FC<SchoolAchievementsProps> = ({ achievements, onAdd, onRemove, userRole, loggedInSchool }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'સ્પર્ધા' | 'પરીક્ષા' | 'અન્ય'>('all');
  const [viewPhoto, setViewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    category: 'સ્પર્ધા' | 'પરીક્ષા' | 'અન્ય';
    achievementName: string;
    achieverName: string;
    achieverType: 'શિક્ષક' | 'વિદ્યાર્થી';
    designation: string;
    standard: string;
    result: string;
    photo?: string;
  }>({
    category: 'સ્પર્ધા',
    achievementName: '',
    achieverName: '',
    achieverType: 'વિદ્યાર્થી',
    designation: '',
    standard: 'ધોરણ 1',
    result: '',
    photo: ''
  });

  const isPrincipal = userRole === 'principal';
  const isAdmin = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm(prev => ({ ...prev, photo: ev.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggedInSchool) return;

    if (!form.achievementName || !form.achieverName || !form.result) {
      alert("મહેરબાની કરીને બધી ફરજિયાત વિગતો ભરો.");
      return;
    }

    const newAchievement: Achievement = {
      id: Date.now().toString(),
      schoolId: loggedInSchool.id,
      schoolName: loggedInSchool.name,
      category: form.category,
      achievementName: form.achievementName,
      achieverName: form.achieverName,
      achieverType: form.achieverType,
      designation: form.achieverType === 'શિક્ષક' ? form.designation : undefined,
      standard: form.achieverType === 'વિદ્યાર્થી' ? form.standard : undefined,
      result: form.result,
      date: new Date().toLocaleDateString('gu-IN'),
      timestamp: Date.now(),
      photo: form.photo
    };

    onAdd(newAchievement);
    setForm({
      category: 'સ્પર્ધા',
      achievementName: '',
      achieverName: '',
      achieverType: 'વિદ્યાર્થી',
      designation: '',
      standard: 'ધોરણ 1',
      result: '',
      photo: ''
    });
    setShowAddForm(false);
    alert("સિદ્ધિ સફળતાપૂર્વક ઉમેરવામાં આવી છે!");
  };

  const filteredAchievements = achievements.filter(a => {
    const matchesCategory = filterCategory === 'all' || a.category === filterCategory;
    const matchesSchool = isPrincipal ? a.schoolId === loggedInSchool?.id : true;
    return matchesCategory && matchesSchool;
  });

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="bg-amber-100 text-amber-600 p-2.5 rounded-2xl">🌟</span>
            શાળા સિદ્ધિ (Achievements)
          </h2>
          <p className="text-slate-500 font-bold text-sm mt-1">શાળા, શિક્ષકો અને વિદ્યાર્થીઓની ગૌરવશાળી સફળતાઓ.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="bg-white border border-slate-200 px-4 py-3 rounded-xl text-xs font-black shadow-sm outline-none"
          >
            <option value="all">તમામ કેટેગરી</option>
            <option value="સ્પર્ધા">સ્પર્ધા</option>
            <option value="પરીક્ષા">પરીક્ષા</option>
            <option value="અન્ય">અન્ય</option>
          </select>
          
          {isPrincipal && (
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-black text-xs shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              નવી સિદ્ધિ ઉમેરો
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map(a => (
            <div key={a.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden border-t-4 border-t-amber-400 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    a.category === 'સ્પર્ધા' ? 'bg-amber-100 text-amber-700' :
                    a.category === 'પરીક્ષા' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {a.category}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{a.date}</span>
               </div>
               
               <h3 className="text-lg font-black text-slate-800 mb-1 leading-tight">{a.achievementName}</h3>
               {isAdmin && <p className="text-[10px] font-black text-blue-400 uppercase mb-4">{a.schoolName}</p>}
               
               <div className="bg-slate-50 rounded-2xl p-4 mt-4 space-y-3 flex-grow">
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${a.achieverType === 'શિક્ષક' ? 'bg-rose-500' : 'bg-emerald-600'}`}>
                        {a.achieverType === 'શિક્ષક' ? '👨‍🏫' : '🎓'}
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1">વિજેતા / સફળતા</p>
                        <p className="text-sm font-black text-slate-700">{a.achieverName}</p>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-black uppercase border-t border-slate-200/50 pt-2">
                     <span className="text-slate-400">{a.achieverType === 'શિક્ષક' ? 'હોદ્દો' : 'ધોરણ'}</span>
                     <span className="text-slate-600">{a.achieverType === 'શિક્ષક' ? a.designation : a.standard}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] font-black uppercase">
                     <span className="text-slate-400">ક્રમાંક / ગુણ</span>
                     <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{a.result}</span>
                  </div>

                  {a.photo && (
                    <div className="mt-4 rounded-xl overflow-hidden cursor-zoom-in border border-slate-200" onClick={() => setViewPhoto(a.photo!)}>
                       <img src={a.photo} alt="Achievement Certificate" className="w-full h-32 object-cover hover:scale-105 transition-transform" />
                       <div className="p-2 bg-white text-center text-[8px] font-black uppercase text-slate-400 tracking-widest">પ્રમાણપત્ર / ફોટો જુઓ</div>
                    </div>
                  )}
               </div>

               {(isPrincipal && a.schoolId === loggedInSchool?.id) && (
                 <button 
                  onClick={() => onRemove(a.id)}
                  className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                 </button>
               )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-white">
              <div className="bg-amber-500 p-8 text-center text-white">
                 <h3 className="text-xl font-black mb-1 uppercase tracking-tight">નવી સિદ્ધિ ઉમેરો (Add Achievement)</h3>
                 <p className="text-amber-100 font-black text-[8px] tracking-[0.3em] uppercase">Excellence Portal</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">કેટેગરી પસંદ કરો</label>
                       <select value={form.category} onChange={e => setForm({...form, category: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all">
                          <option value="સ્પર્ધા">સ્પર્ધા</option>
                          <option value="પરીક્ષા">પરીક્ષા</option>
                          <option value="અન્ય">અન્ય</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">સ્પર્ધા / પરીક્ષાનું નામ</label>
                       <input type="text" value={form.achievementName} onChange={e => setForm({...form, achievementName: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all" placeholder="દા.ત. ચિત્ર સ્પર્ધા / NMMS પરીક્ષા"/>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">વિજેતાનો પ્રકાર</label>
                       <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl">
                          <button type="button" onClick={() => setForm({...form, achieverType: 'વિદ્યાર્થી'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.achieverType === 'વિદ્યાર્થી' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>વિદ્યાર્થી</button>
                          <button type="button" onClick={() => setForm({...form, achieverType: 'શિક્ષક'})} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${form.achieverType === 'શિક્ષક' ? 'bg-white text-rose-500 shadow-sm' : 'text-slate-400'}`}>શિક્ષક</button>
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">સફળતા પ્રાપ્ત કરનારનું નામ</label>
                       <input type="text" value={form.achieverName} onChange={e => setForm({...form, achieverName: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all" placeholder="પૂરું નામ લખો"/>
                    </div>

                    {form.achieverType === 'શિક્ષક' ? (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">હોદ્દો (Designation)</label>
                          <input type="text" value={form.designation} onChange={e => setForm({...form, designation: e.target.value.toUpperCase()})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all" placeholder="શિક્ષક / આચાર્ય"/>
                       </div>
                    ) : (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">ધોરણ (Standard)</label>
                          <select value={form.standard} onChange={e => setForm({...form, standard: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all">
                             {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={`ધોરણ ${s}`}>ધોરણ {s}</option>)}
                          </select>
                       </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">મેળવેલ ગુણ / ક્રમાંક</label>
                       <input type="text" value={form.result} onChange={e => setForm({...form, result: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-amber-500 transition-all" placeholder="દા.ત. પ્રથમ નંબર / 85 ગુણ"/>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">પ્રમાણપત્ર અથવા સન્માનનો ફોટો (Photo)</label>
                       <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                       <div 
                         onClick={() => fileInputRef.current?.click()}
                         className={`w-full py-8 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${form.photo ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-amber-400 hover:bg-amber-50'}`}
                       >
                         {form.photo ? (
                           <div className="flex flex-col items-center gap-2">
                              <img src={form.photo} className="h-20 w-32 object-cover rounded-xl shadow-sm" />
                              <span className="text-[8px] font-black text-emerald-600 uppercase">ફોટો બદલો</span>
                           </div>
                         ) : (
                           <>
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-300 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                             <span className="text-[10px] font-black text-slate-400 uppercase">ફોટો અપલોડ કરવા ક્લિક કરો</span>
                           </>
                         )}
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex gap-4 pt-6">
                    <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 py-5 font-black text-slate-400 uppercase text-[10px] tracking-widest">રદ કરો</button>
                    <button type="submit" className="flex-[2] bg-slate-900 text-white py-5 rounded-3xl font-black text-[10px] shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest">વિગત સેવ કરો (SAVE)</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Photo View Modal */}
      {viewPhoto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setViewPhoto(null)}>
           <div className="relative max-w-4xl w-full flex justify-center">
              <img src={viewPhoto} className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl animate-in zoom-in-95" />
              <button className="absolute top-0 right-0 -mt-12 text-white font-black uppercase text-xs hover:text-amber-400 transition-colors">Close ✕</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default SchoolAchievements;
