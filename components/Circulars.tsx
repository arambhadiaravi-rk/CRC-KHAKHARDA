
import React, { useState, useRef } from 'react';
import { Circular, UserRole } from '../types';

interface CircularsProps {
  circulars: Circular[];
  onAdd: (circular: Circular) => void;
  onRemove: (id: string) => void;
  userRole: UserRole;
}

const Circulars: React.FC<CircularsProps> = ({ circulars, onAdd, onRemove, userRole }) => {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFullAdmin = userRole === 'crc_admin';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!title || !file) {
      alert("પરિપત્રનું નામ અને PDF ફાઇલ બંને જરૂરી છે.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      const newCircular: Circular = {
        id: Date.now().toString(),
        title,
        description,
        date: new Date().toLocaleDateString('gu-IN'),
        pdfData: base64Data,
        fileName: file.name
      };
      onAdd(newCircular);
      setTitle('');
      setDescription('');
      setFile(null);
      setShowModal(false);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = (circular: Circular) => {
    const link = document.createElement('a');
    link.href = circular.pdfData;
    link.download = circular.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">શૈક્ષણિક પરિપત્રો</h2>
          <p className="text-slate-500 font-bold text-sm">ક્લસ્ટર દ્વારા બહાર પાડવામાં આવેલા અગત્યના પરિપત્રો.</p>
        </div>
        
        {isFullAdmin && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            પરિપત્ર અપલોડ કરો
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circulars.map(circular => (
          <div key={circular.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative">
            <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            
            <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">{circular.title}</h3>
            <p className="text-xs text-slate-500 font-bold mb-4 line-clamp-2">{circular.description || "કોઈ વધારાની વિગત નથી."}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-[10px] font-black text-slate-400">{circular.date}</span>
              <button 
                onClick={() => handleDownload(circular)}
                className="text-emerald-600 text-xs font-black hover:underline flex items-center gap-1"
              >
                ડાઉનલોડ (PDF)
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              </button>
            </div>

            {isFullAdmin && (
              <button 
                onClick={() => onRemove(circular.id)}
                className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            )}
          </div>
        ))}
        
        {circulars.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <p className="text-slate-400 font-bold italic">હજુ સુધી કોઈ પરિપત્ર અપલોડ કરવામાં આવ્યો નથી.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              પરિપત્રની વિગત
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">પરિપત્રનું નામ (TITLE)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="દા.ત. શૈક્ષણિક પ્રવાસ બાબત..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">વધારાની વિગત (DESCRIPTION)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  rows={3}
                  placeholder="પરિપત્ર વિશે થોડી માહિતી લખો..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">PDF ફાઇલ પસંદ કરો</label>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  ref={fileInputRef} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-6 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-500'}`}
                >
                  {file ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15l3 3 3-3"/><path d="M12 18V11"/></svg>
                      <span className="font-black text-xs">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                      <span className="font-black text-xs">PDF ફાઇલ અહીંથી પસંદ કરો</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-grow py-4 rounded-2xl font-black text-slate-400 hover:text-slate-600 transition-colors"
                >
                  રદ કરો
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'અપલોડ કરો'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Circulars;
