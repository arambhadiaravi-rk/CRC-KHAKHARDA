
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

  const canUpload = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin';

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
      const roleStr = (userRole?.toString() || '').toUpperCase().replace('_', ' ');
      
      const newCircular: Circular = {
        id: Date.now().toString(),
        title,
        description,
        date: new Date().toLocaleDateString('gu-IN'),
        pdfData: base64Data,
        fileName: file.name,
        uploadedBy: roleStr
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
          <p className="text-slate-500 font-bold text-sm">ક્લસ્ટર તથા ઓથોરિટી દ્વારા બહાર પાડવામાં આવેલા અગત્યના પરિપત્રો.</p>
        </div>
        
        {canUpload && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
          >
            પરિપત્ર અપલોડ કરો
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circulars.map(circular => (
          <div key={circular.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all group relative">
            <h3 className="text-lg font-black text-slate-800 mb-2 leading-tight">{circular.title}</h3>
            <p className="text-xs text-slate-500 font-bold mb-4 line-clamp-2">{circular.description || "કોઈ વધારાની વિગત નથી."}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400">{circular.date}</span>
                {circular.uploadedBy && <span className="text-[8px] font-black text-blue-400 uppercase tracking-tighter">BY: {circular.uploadedBy}</span>}
              </div>
              <button 
                onClick={() => handleDownload(circular)}
                className="text-emerald-600 text-xs font-black hover:underline flex items-center gap-1"
              >
                ડાઉનલોડ (PDF)
              </button>
            </div>

            {canUpload && (
              <button 
                onClick={() => onRemove(circular.id)}
                className="absolute top-4 right-4 text-slate-200 hover:text-red-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/20">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-slate-800 mb-6">પરિપત્રની વિગત</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">પરિપત્રનું નામ (TITLE)</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 outline-none font-bold"
                />
              </div>

              <div>
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileUpload}
                  className="hidden" 
                  ref={fileInputRef} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-black text-xs"
                >
                  {file ? file.name : "PDF ફાઇલ પસંદ કરો"}
                </button>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 font-black text-slate-400">રદ કરો</button>
                <button onClick={handleSubmit} disabled={isUploading} className="flex-2 bg-emerald-600 text-white py-4 rounded-2xl font-black">
                  {isUploading ? "Uploading..." : "અપલોડ કરો"}
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
