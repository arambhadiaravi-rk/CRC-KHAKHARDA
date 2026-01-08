
import React, { useState, useRef } from 'react';
import { Competition, Winner, UserRole } from '../types';

interface CompetitionsProps {
  competitions: Competition[];
  onAdd: (comp: Competition) => void;
  onRemove: (id: string) => void;
  userRole: UserRole;
}

const Competitions: React.FC<CompetitionsProps> = ({ competitions, onAdd, onRemove, userRole }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewComp, setViewComp] = useState<Competition | null>(null);
  
  // Add Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [winners, setWinners] = useState<Winner[]>([{ rank: '1', studentName: '', schoolName: '' }]);
  const [photos, setPhotos] = useState<string[]>([]);
  
  const isFullAdmin = userRole === 'crc_admin';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Fix: Cast Array.from result to File[] to avoid 'unknown' type error in some environments
      (Array.from(e.target.files) as File[]).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setPhotos(prev => [...prev, ev.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const addWinnerRow = () => {
    setWinners([...winners, { rank: (winners.length + 1).toString(), studentName: '', schoolName: '' }]);
  };

  const updateWinner = (index: number, field: keyof Winner, value: string) => {
    const updated = [...winners];
    updated[index] = { ...updated[index], [field]: value };
    setWinners(updated);
  };

  const handleSubmit = () => {
    if (!title || !date) {
      alert("સ્પર્ધાનું નામ અને તારીખ જરૂરી છે.");
      return;
    }

    const newComp: Competition = {
      id: Date.now().toString(),
      title,
      date,
      description,
      winners: winners.filter(w => w.studentName.trim() !== ''),
      photos
    };

    onAdd(newComp);
    resetForm();
    setShowAddModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setWinners([{ rank: '1', studentName: '', schoolName: '' }]);
    setPhotos([]);
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">ક્લસ્ટર સ્પર્ધાઓ</h2>
          <p className="text-slate-500 font-bold text-sm">પ્રતિભાશાળી વિદ્યાર્થીઓ અને વિજેતાઓનું સન્માન.</p>
        </div>
        
        {isFullAdmin && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            સ્પર્ધા ઉમેરો
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {competitions.map(comp => (
          <div 
            key={comp.id} 
            className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all group cursor-pointer"
            onClick={() => setViewComp(comp)}
          >
            <div className="aspect-video bg-slate-100 relative overflow-hidden">
              {comp.photos && comp.photos.length > 0 ? (
                <img src={comp.photos[0]} alt={comp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest border border-white/20">
                {comp.date}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-xl font-black text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{comp.title}</h3>
              <p className="text-xs text-slate-500 font-bold mb-6 line-clamp-2">{comp.description || "સ્પર્ધાની વિગતો જોવા માટે ક્લિક કરો."}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <span className="text-[10px] font-black text-slate-400">વિજેતાઓ: {comp.winners.length}</span>
                <span className="text-blue-600 text-xs font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  વિગતો જુઓ
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </div>

            {isFullAdmin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onRemove(comp.id); }}
                className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        ))}
        
        {competitions.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
            </div>
            <p className="text-slate-400 font-bold italic">હજુ સુધી કોઈ સ્પર્ધાની વિગત ઉમેરવામાં આવી નથી.</p>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewComp && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-10 backdrop-blur-xl bg-slate-900/40">
          <div className="bg-white rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] shadow-2xl overflow-y-auto animate-in zoom-in-95 duration-300">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md px-10 py-6 border-b border-slate-100 flex justify-between items-center z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-800">{viewComp.title}</h3>
                <p className="text-blue-600 font-black text-xs uppercase tracking-widest">{viewComp.date}</p>
              </div>
              <button onClick={() => setViewComp(null)} className="bg-slate-100 hover:bg-slate-200 p-3 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div className="p-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <section>
                  <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg></span>
                    વિજેતાઓ (WINNER LIST)
                  </h4>
                  <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-100/50">
                          <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">ક્રમ</th>
                          <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">વિદ્યાર્થી</th>
                          <th className="px-6 py-4 font-black text-slate-400 text-[10px] uppercase tracking-widest">શાળા</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {viewComp.winners.map((w, i) => (
                          <tr key={i} className="hover:bg-white transition-colors">
                            <td className="px-6 py-4 font-black text-blue-600">{w.rank}</td>
                            <td className="px-6 py-4 font-black text-slate-800">{w.studentName}</td>
                            <td className="px-6 py-4 font-bold text-slate-500 text-xs">{w.schoolName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section>
                  <h4 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-2 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></span>
                    યાદગાર ક્ષણો (GALLERY)
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {viewComp.photos.map((p, i) => (
                      <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-sm group">
                        <img src={p} alt="Comp Photo" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-900/30">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl p-10 overflow-y-auto animate-in zoom-in-95 duration-200">
            <h3 className="text-3xl font-black text-slate-800 mb-8">નવી સ્પર્ધા ઉમેરો</h3>
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">સ્પર્ધાનું નામ (TITLE)</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value.toUpperCase())} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-blue-500 transition-all"/>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">તારીખ (DATE)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:bg-white focus:border-blue-500 transition-all"/>
                </div>
              </div>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">વિજેતાઓ ઉમેરો</label>
                  <button onClick={addWinnerRow} className="text-blue-600 text-xs font-black">+ નવું નામ</button>
                </div>
                <div className="space-y-3">
                  {winners.map((w, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3">
                       <input type="text" value={w.rank} onChange={e => updateWinner(idx, 'rank', e.target.value)} placeholder="ક્રમ" className="col-span-2 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 outline-none font-black text-sm"/>
                       <input type="text" value={w.studentName} onChange={e => updateWinner(idx, 'studentName', e.target.value.toUpperCase())} placeholder="વિદ્યાર્થીનું નામ" className="col-span-5 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 outline-none font-black text-sm"/>
                       <input type="text" value={w.schoolName} onChange={e => updateWinner(idx, 'schoolName', e.target.value.toUpperCase())} placeholder="શાળાનું નામ" className="col-span-5 bg-slate-50 border-2 border-slate-50 rounded-xl px-4 py-3 outline-none font-black text-sm"/>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">સ્પર્ધાના ફોટાઓ (GALLERY)</label>
                <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoUpload} />
                <div className="flex flex-wrap gap-4">
                  {photos.map((p, i) => (
                    <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-100">
                      <img src={p} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-300 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
              </section>

              <div className="flex gap-4 pt-6">
                 <button onClick={() => {setShowAddModal(false); resetForm();}} className="flex-grow py-5 font-black text-slate-400">રદ કરો</button>
                 <button onClick={handleSubmit} className="flex-[2] bg-blue-600 text-white py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98]">સેવ કરો (SAVE)</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Competitions;
