
import React, { useState } from 'react';
import { Suggestion, UserRole } from '../types';

interface SuggestionsProps {
  suggestions: Suggestion[];
  onAdd: (suggestion: Suggestion) => void;
  onRemove: (id: string) => void;
  userRole: UserRole;
}

const Suggestions: React.FC<SuggestionsProps> = ({ suggestions, onAdd, onRemove, userRole }) => {
  const [text, setText] = useState('');
  
  // Only BRC and DPC can write suggestions
  const canWrite = userRole === 'brc_admin' || userRole === 'dpc_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const now = Date.now();
    const newSuggestion: Suggestion = {
      id: now.toString(),
      text,
      date: new Date(now).toLocaleString('gu-IN'),
      timestamp: now,
      senderRole: userRole,
      senderName: userRole === 'brc_admin' ? 'BRC KALYANPUR' : 'DPC DWARKA'
    };

    onAdd(newSuggestion);
    setText('');
    alert("સૂચના સફળતાપૂર્વક પ્રસિદ્ધ કરવામાં આવી છે.");
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500 flex flex-col h-full overflow-hidden">
      <div className="mb-8 flex-shrink-0">
        <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <span className="bg-amber-100 text-amber-600 p-2.5 rounded-2xl">📮</span>
          સૂચનપેટી (Guidance Box)
        </h2>
        <p className="text-slate-500 font-bold text-sm mt-1">ઓથોરિટી તરફથી શાળાઓ માટે જરૂરી માર્ગદર્શન અને સૂચનો.</p>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row gap-8 overflow-hidden pb-10">
        {/* Writer Section */}
        {canWrite && (
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="bg-indigo-50 border border-indigo-100 rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-lg font-black text-indigo-900 mb-6 border-l-4 border-indigo-600 pl-3">
                શાળાઓને માર્ગદર્શન/જરૂરી સૂચન અહીં આપો.
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">તમારો સંદેશ લખો</label>
                  <textarea 
                    value={text}
                    onChange={e => setText(e.target.value)}
                    rows={8}
                    placeholder="અહીં માર્ગદર્શન કે સૂચના ટાઈપ કરો..."
                    className="w-full bg-white border border-indigo-200 rounded-3xl p-5 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all resize-none shadow-inner"
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-3xl font-black text-sm shadow-xl shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  સૂચના પ્રસિદ્ધ કરો
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Reader Section */}
        <div className={`flex-grow overflow-y-auto custom-scrollbar pr-2 ${!canWrite ? 'max-w-4xl mx-auto' : ''}`}>
          <div className="space-y-6 pb-20">
            {suggestions.length === 0 ? (
              <div className="py-24 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-100 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 8v4m0 4h.01" /></svg>
                </div>
                <p className="text-slate-400 font-bold italic">હજુ સુધી કોઈ સૂચના આપવામાં આવી નથી.</p>
              </div>
            ) : (
              suggestions.map(s => (
                <div key={s.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-all relative group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-xs ${s.senderRole === 'dpc_admin' ? 'bg-rose-500' : 'bg-indigo-600'}`}>
                      {s.senderName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{s.senderName}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.date}</p>
                    </div>
                  </div>
                  
                  <div className="text-slate-700 font-bold leading-relaxed whitespace-pre-wrap">
                    {s.text}
                  </div>

                  {canWrite && (
                    <button 
                      onClick={() => onRemove(s.id)}
                      className="absolute top-8 right-8 text-slate-200 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Suggestions;
