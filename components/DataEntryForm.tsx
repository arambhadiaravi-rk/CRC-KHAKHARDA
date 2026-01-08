
import React, { useState, useEffect } from 'react';
import { School, UserRole } from '../types';

interface DataEntryFormProps {
  schools: School[];
  onAddRecord: () => void;
  loggedInSchool: School | null;
  records: any[];
  userRole: UserRole;
  onUpdateSchool?: (school: School) => void;
}

const DataEntryForm: React.FC<DataEntryFormProps> = ({ 
  schools, 
  loggedInSchool, 
  userRole,
  onUpdateSchool 
}) => {
  const isReadOnlyAuthority = userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';
  
  const [profileData, setProfileData] = useState<School>({
    id: loggedInSchool?.id || '',
    name: loggedInSchool?.name || '',
    diseCode: loggedInSchool?.diseCode || '',
    principal: loggedInSchool?.principal || '',
    contact: loggedInSchool?.contact || '',
    standards: loggedInSchool?.standards || '',
    schoolType: loggedInSchool?.schoolType || '',
    address: loggedInSchool?.address || '',
  });

  useEffect(() => {
    if (loggedInSchool) {
      setProfileData({ ...loggedInSchool });
    }
  }, [loggedInSchool]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnlyAuthority) return;
    if (!onUpdateSchool) return;
    onUpdateSchool(profileData);
    alert("શાળાની વિગતો સફળતાપૂર્વક અપડેટ કરવામાં આવી છે.");
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full animate-in fade-in duration-500">
      <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 shadow-sm mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-emerald-600 p-3 rounded-2xl text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-emerald-900">શાળાની વિગત (School Details)</h2>
            <p className="text-emerald-600 text-sm font-bold mt-1 uppercase tracking-wider">વિગતો અંગ્રેજી કેપિટલ અક્ષરોમાં ભરો</p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">શાળાનું નામ (SCHOOL NAME)</label>
            <input 
              type="text"
              disabled={isReadOnlyAuthority}
              value={profileData.name}
              onChange={e => setProfileData({...profileData, name: e.target.value.toUpperCase()})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-slate-700 disabled:opacity-70"
              placeholder="ENTER SCHOOL NAME"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">ડાયસકોડ (DISE CODE)</label>
            <input 
              type="text"
              disabled={isReadOnlyAuthority}
              value={profileData.diseCode}
              onChange={e => setProfileData({...profileData, diseCode: e.target.value.toUpperCase()})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-slate-700 disabled:opacity-70"
              placeholder="ENTER DISE CODE"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">શાળામાં ચાલતા ધોરણો (STANDARDS)</label>
            <select 
              disabled={isReadOnlyAuthority}
              value={profileData.standards}
              onChange={e => setProfileData({...profileData, standards: e.target.value as any})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-slate-700 disabled:opacity-70"
            >
              <option value="">-- SELECT STANDARDS --</option>
              <option value="1-5">1 TO 5 (1 થી 5)</option>
              <option value="1-8">1 TO 8 (1 થી 8)</option>
              <option value="9-10">9 TO 10 (9 થી 10)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">શાળાનો પ્રકાર (SCHOOL TYPE)</label>
            <select 
              disabled={isReadOnlyAuthority}
              value={profileData.schoolType}
              onChange={e => setProfileData({...profileData, schoolType: e.target.value as any})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-black text-slate-700 disabled:opacity-70"
            >
              <option value="">-- SELECT TYPE --</option>
              <option value="SOE">SOE</option>
              <option value="NON SOE">NON SOE</option>
              <option value="PM SHREE GOG">PM SHREE GOG</option>
              <option value="PM SHREE GOI">PM SHREE GOI</option>
            </select>
          </div>

          <div className="md:col-span-2 pt-4">
            {!isReadOnlyAuthority && (
              <button 
                type="submit"
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                વિગતો સાચવો (SAVE DETAILS)
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DataEntryForm;
