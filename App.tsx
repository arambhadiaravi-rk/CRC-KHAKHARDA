
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import SchoolList from './components/SchoolList';
import Login from './components/Login';
import SchoolManagement from './components/SchoolManagement';
import StudentDataEntry from './components/StudentDataEntry';
import Reports from './components/Reports';
import Circulars from './components/Circulars';
import Competitions from './components/Competitions';
import Suggestions from './components/Suggestions';
import SchoolAchievements from './components/SchoolAchievements';
import { TabType, School, DataRecord, UserRole, Circular, Competition, Suggestion, Achievement } from './types';

// IMPORTANT: Never change this key unless you want a fresh start.
const STORAGE_KEY = "crc_khakharda_production_v1";
const SUGGESTIONS_LAST_VIEWED_KEY = "suggestions_last_viewed_timestamp";

const MASTER_SCHOOLS: School[] = [
  { id: '1', name: 'BHOPALKA PRIMARY SCHOOL', diseCode: '24290300801', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '2', name: 'BHARATPUR VADI SHALA', diseCode: '24290300802', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '3', name: 'KHAKHARDA PRIMARY SCHOOL', diseCode: '24290303801', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '4', name: 'KHAKHARDA VADI SHALA 1', diseCode: '24290303802', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '5', name: 'PATELKA TALUKA SHALA', diseCode: '24290305801', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '6', name: 'FAGAS VADI SHALA 1 PATELKA', diseCode: '24290305802', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '7', name: 'LAMDHAR VADI SHALA 2 PATELKA', diseCode: '24290305803', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '8', name: 'ROJIDHAR VADI SHALA 3 PATELKA', diseCode: '24290305804', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '9', name: 'KANADHAR VADI SHALA 4 PATELKA', diseCode: '24290305805', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '10', name: 'BARCHHA VADI SHALA 6 PATELKA', diseCode: '24290305807', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '11', name: 'THARDHAR VADI SHALA 7 PATELKA', diseCode: '24290305808', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '1-8' },
  { id: '12', name: 'SHARDAMANDIR HIGH SCHOOL', diseCode: '24290303804', principal: 'આચાર્યશ્રી', contact: '', password: '123', schoolType: 'NON SOE', standards: '9-10' }
];

const DEFAULT_ADMIN_PASSWORDS = {
  crc_admin: 'Ravi*1990',
  brc_admin: 'KKD2429030',
  dpc_admin: 'KKD2429030'
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schools');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [originalRole, setOriginalRole] = useState<UserRole>(null);
  const [loggedInSchoolId, setLoggedInSchoolId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Data State
  const [schools, setSchools] = useState<School[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [adminPasswords, setAdminPasswords] = useState(DEFAULT_ADMIN_PASSWORDS);
  
  const [lastViewedSuggestions, setLastViewedSuggestions] = useState<number>(() => {
    return parseInt(localStorage.getItem(SUGGESTIONS_LAST_VIEWED_KEY) || '0');
  });

  // Initialization: Safely load and merge data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        
        // Merge Logic: Prioritize saved data for dynamic fields, but keep master ID/Names intact
        const mergedSchools = MASTER_SCHOOLS.map(ms => {
          const saved = (parsed.schools || []).find((s: School) => s.id === ms.id);
          if (!saved) return ms;
          // Deep merge critical arrays and objects to prevent loss
          return {
            ...ms, // Static defaults
            ...saved, // Dynamic overrides from user
            name: ms.name, // Keep official names
            diseCode: ms.diseCode // Keep official codes
          };
        });

        setSchools(mergedSchools);
        setRecords(parsed.records || []);
        setCirculars(parsed.circulars || []);
        setCompetitions(parsed.competitions || []);
        setSuggestions(parsed.suggestions || []);
        setAchievements(parsed.achievements || []);
        setAdminPasswords(parsed.adminPasswords || DEFAULT_ADMIN_PASSWORDS);
      } catch (e) {
        console.error("Critical Load Error - Recovering Defaults:", e);
        setSchools(MASTER_SCHOOLS);
      }
    } else {
      setSchools(MASTER_SCHOOLS);
    }
  }, []);

  // Robust Global Save Function
  const saveData = (updates: {
    schools?: School[],
    records?: DataRecord[],
    circulars?: Circular[],
    competitions?: Competition[],
    suggestions?: Suggestion[],
    achievements?: Achievement[],
    adminPasswords?: typeof DEFAULT_ADMIN_PASSWORDS
  }) => {
    setSyncStatus('syncing');

    setSchools(prevSchools => {
      const nextSchools = updates.schools || prevSchools;
      setRecords(prevRecords => {
        const nextRecords = updates.records || prevRecords;
        setCirculars(prevCirculars => {
          const nextCirculars = updates.circulars || prevCirculars;
          setCompetitions(prevCompetitions => {
            const nextCompetitions = updates.competitions || prevCompetitions;
            setSuggestions(prevSuggestions => {
              const nextSuggestions = updates.suggestions || prevSuggestions;
              setAchievements(prevAchievements => {
                const nextAchievements = updates.achievements || prevAchievements;
                setAdminPasswords(prevPasswords => {
                  const nextPasswords = updates.adminPasswords || prevPasswords;

                  const dataToSave = {
                    schools: nextSchools,
                    records: nextRecords,
                    circulars: nextCirculars,
                    competitions: nextCompetitions,
                    suggestions: nextSuggestions,
                    achievements: nextAchievements,
                    adminPasswords: nextPasswords,
                    schemaVersion: "1.0",
                    lastModified: Date.now()
                  };
                  
                  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
                  return nextPasswords;
                });
                return nextAchievements;
              });
              return nextSuggestions;
            });
            return nextCompetitions;
          });
          return nextCirculars;
        });
        return nextRecords;
      });
      return nextSchools;
    });

    setTimeout(() => setSyncStatus('synced'), 400);
  };

  // Export Entire Database as JSON file
  const exportDatabase = () => {
    const data = {
      schools, records, circulars, competitions, suggestions, achievements, adminPasswords,
      exportDate: new Date().toISOString(),
      source: "CRC_KHAKHARDA_MANAGEMENT_PORTAL"
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRC_KHAKHARDA_BACKUP_${new Date().toLocaleDateString('gu-IN').replace(/\//g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Database from JSON file
  const importDatabase = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.schools) throw new Error("Invalid format");
        
        if (window.confirm("ચેતવણી: આ ફાઇલ અપલોડ કરવાથી તમારી હાલની તમામ માહિતી બદલાઈ જશે. શું તમે ખરેખર રીસ્ટોર કરવા માંગો છો?")) {
          saveData({
            schools: parsed.schools,
            records: parsed.records,
            circulars: parsed.circulars,
            competitions: parsed.competitions,
            suggestions: parsed.suggestions,
            achievements: parsed.achievements,
            adminPasswords: parsed.adminPasswords
          });
          alert("ડેટા સફળતાપૂર્વક રીસ્ટોર કરવામાં આવ્યો છે. પેજ રીલોડ થશે.");
          window.location.reload();
        }
      } catch (err) {
        alert("ખોટી ફાઇલ: ડેટા રીસ્ટોર કરી શકાયો નથી.");
      }
    };
    reader.readAsText(file);
  };

  const hasNewSuggestions = useMemo(() => {
    if (suggestions.length === 0) return false;
    const latestTimestamp = Math.max(...suggestions.map(s => s.timestamp));
    return latestTimestamp > lastViewedSuggestions;
  }, [suggestions, lastViewedSuggestions]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
    if (tab === 'suggestions') {
      const now = Date.now();
      setLastViewedSuggestions(now);
      localStorage.setItem(SUGGESTIONS_LAST_VIEWED_KEY, now.toString());
    }
  };

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    if (role === 'brc_admin' || role === 'dpc_admin') setShowWelcome(true);
    if (role === 'principal') setActiveTab('school-mgmt');
    else setActiveTab('schools');
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInSchoolId(null);
    setActiveTab('schools');
    setShowWelcome(false);
  };

  const loggedInSchool = useMemo(() => schools.find(s => s.id === loggedInSchoolId) || null, [schools, loggedInSchoolId]);
  const isCoordinatior = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  if (!userRole) {
    return (
      <Login 
        schools={schools} 
        adminPasswords={adminPasswords}
        onLogin={handleLogin} 
        onResetPassword={async (dise, pass, role) => {
          if (role === 'principal') {
            const updated = schools.map(s => s.diseCode === dise ? { ...s, password: pass } : s);
            saveData({ schools: updated });
          } else if (role) {
            saveData({ adminPasswords: { ...adminPasswords, [role]: pass } });
          }
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col z-50 shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-emerald-600 p-2.5 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
          <span className="font-black text-lg tracking-tight uppercase">CRC KHAKHARDA</span>
        </div>
        
        <nav className="flex-grow py-6 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {[
            { id: 'schools', label: 'શાળાઓ', icon: '🏫', visible: isCoordinatior },
            { id: 'reports', label: 'રિપોર્ટ', icon: '📊', visible: isCoordinatior },
            { id: 'school-mgmt', label: 'વ્યવસ્થાપન', icon: '⚙️', visible: userRole === 'principal' },
            { id: 'enrollment', label: 'વિદ્યાર્થી સંખ્યા', icon: '📝', visible: userRole === 'principal' },
            { id: 'student-stats', label: 'વિદ્યાર્થીઓની વિગત', icon: '🆔', visible: userRole === 'principal' },
            { id: 'cwsn', label: 'દિવ્યાંગ બાળક', icon: '♿', visible: userRole === 'principal' },
            { id: 'fln', label: 'FLN ડેટા', icon: '📚', visible: userRole === 'principal' },
            { id: 'circulars', label: 'પરિપત્રો', icon: '📜', visible: true },
            { id: 'achievements', label: 'શાળા સિદ્ધિ', icon: '🌟', visible: true },
            { id: 'suggestions', label: 'સૂચનપેટી', icon: '📮', visible: true, showStar: hasNewSuggestions },
            { id: 'competitions', label: 'સ્પર્ધાઓ', icon: '🏆', visible: true },
          ].filter(item => item.visible).map(item => (
            <button 
              key={item.id} 
              onClick={() => handleTabChange(item.id as TabType)} 
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>{item.label}
              </div>
              {item.showStar && (
                <span className="text-amber-400 animate-pulse text-lg" title="નવી સૂચના ઉપલબ્ધ છે">⭐</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <button 
              onClick={() => setShowBackupModal(true)} 
              className="w-full py-3 px-4 rounded-xl text-[10px] font-black text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              ડેટા બેકઅપ
           </button>
           <button 
              onClick={handleLogout} 
              className="w-full py-3 px-4 rounded-xl text-[10px] font-black text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
           >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              લોગઆઉટ
           </button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col overflow-hidden">
        <Header 
          activeTab={activeTab} 
          setActiveTab={() => {}} 
          userRole={userRole} 
          originalRole={originalRole} 
          onLogout={handleLogout} 
          onExitImpersonation={() => { setUserRole(originalRole); setLoggedInSchoolId(null); setActiveTab('schools'); }}
          schoolName={loggedInSchool?.name}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          syncStatus={syncStatus}
        />

        <main className="flex-grow overflow-y-auto p-4 md:p-8">
          <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 min-h-[85vh] flex flex-col overflow-hidden">
            {activeTab === 'schools' && (
              <SchoolList 
                schools={schools} 
                records={records} 
                userRole={userRole} 
                onImpersonate={(s) => { 
                  if(userRole === 'crc_admin'){ 
                    setLoggedInSchoolId(s.id); 
                    setUserRole('principal'); 
                    setActiveTab('school-mgmt'); 
                  } 
                }} 
              />
            )}
            {activeTab === 'reports' && <Reports schools={schools} records={records} onRestoreData={() => {}} userRole={userRole} />}
            {activeTab === 'school-mgmt' && loggedInSchool && <SchoolManagement school={loggedInSchool} onUpdate={(s) => saveData({ schools: schools.map(i => i.id === s.id ? s : i) })} userRole={userRole} />}
            
            {(activeTab === 'enrollment' || activeTab === 'student-stats' || activeTab === 'cwsn' || activeTab === 'fln') && loggedInSchool && (
              <StudentDataEntry school={loggedInSchool} activeSection={activeTab} onUpdate={(s) => saveData({ schools: schools.map(i => i.id === s.id ? s : i) })} userRole={userRole} />
            )}

            {activeTab === 'circulars' && <Circulars circulars={circulars} onAdd={(c) => saveData({ circulars: [c, ...circulars] })} onRemove={(id) => saveData({ circulars: circulars.filter(c => c.id !== id) })} userRole={userRole} />}
            {activeTab === 'competitions' && <Competitions competitions={competitions} onAdd={(c) => saveData({ competitions: [c, ...competitions] })} onRemove={(id) => saveData({ competitions: competitions.filter(c => c.id !== id) })} userRole={userRole} />}
            {activeTab === 'suggestions' && <Suggestions suggestions={suggestions} onAdd={(s) => saveData({ suggestions: [s, ...suggestions] })} onRemove={(id) => saveData({ suggestions: suggestions.filter(s => s.id !== id) })} userRole={userRole} />}
            {activeTab === 'achievements' && <SchoolAchievements achievements={achievements} onAdd={(a) => saveData({ achievements: [a, ...achievements] })} onRemove={(id) => saveData({ achievements: achievements.filter(a => a.id !== id) })} userRole={userRole} loggedInSchool={loggedInSchool} />}
          </div>
        </main>
      </div>

      {/* Backup & Recovery Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 border border-white">
              <div className="bg-emerald-600 p-8 text-center text-white">
                 <h3 className="text-xl font-black mb-1 uppercase tracking-tight">ડેટા મેનેજમેન્ટ (SECURITY)</h3>
                 <p className="text-emerald-100 font-bold text-[10px] tracking-[0.2em] uppercase">Backup & Recovery Portal</p>
              </div>
              
              <div className="p-10 space-y-8">
                 <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-3">
                    <h4 className="font-black text-emerald-800 text-sm">૧. બેકઅપ ડાઉનલોડ કરો</h4>
                    <p className="text-[11px] text-emerald-600 font-bold leading-relaxed">તમારા ક્લસ્ટરનો તમામ ડેટા એક સુરક્ષિત ફાઇલમાં ડાઉનલોડ કરો. મહિનામાં એકવાર આ કરવું સલાહભર્યું છે.</p>
                    <button onClick={exportDatabase} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">DOWNLOAD BACKUP (.JSON)</button>
                 </div>

                 <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-3">
                    <h4 className="font-black text-slate-800 text-sm">૨. ડેટા પાછો લાવો (Restore)</h4>
                    <p className="text-[11px] text-slate-500 font-bold leading-relaxed">જો તમે બ્રાઉઝર બદલ્યું હોય, તો ડાઉનલોડ કરેલી બેકઅપ ફાઇલ અહીંથી અપલોડ કરી બધો ડેટા પાછો મેળવી શકો છો.</p>
                    <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={importDatabase} />
                    <button onClick={() => fileInputRef.current?.click()} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">UPLOAD & RESTORE</button>
                 </div>

                 <button onClick={() => setShowBackupModal(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">બંધ કરો (CLOSE)</button>
              </div>
           </div>
        </div>
      )}

      {/* Welcome Message Modal */}
      {showWelcome && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border-4 border-white">
              <div className={`p-10 text-center text-white ${userRole === 'dpc_admin' ? 'bg-rose-600' : 'bg-amber-600'}`}>
                 <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                 </div>
                 <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">સ્વાગત સંદેશ (WELCOME)</h3>
              </div>
              
              <div className="p-12 text-center space-y-8">
                 <p className="text-xl font-bold text-slate-700 leading-relaxed italic">
                    {userRole === 'brc_admin' && "BRC કૉ. ઓર્ડીનેટર શ્રી જામ કલ્યાણપુરનું ખાખરડા ક્લસ્ટરની તમામ શાળાઓ તથા CRC કૉ. ઓર્ડીનેટર હાર્દિક સ્વાગત કરીએ છીએ. આપશ્રીને અહીં ક્લસ્ટરની તમામ શાળાઓની વિગતો જોવા મળશે. અહીંથી આપ અમોને પરિપત્રો મૂકીને અથવા સૂચનપેટીના માધ્યમથી જરૂરી માર્ગદર્શન સૂચન કરી શકો છો. આભાર..🙏"}
                    {userRole === 'dpc_admin' && "જિલ્લા પ્રોજેક્ટ કૉ ઓર્ડીનેટર શ્રી તથા જિલ્લા પ્રાથમિક શિક્ષણાધિકારી શ્રી દેવભૂમિ દ્વારકાનું અમે ખાખરડા ક્લસ્ટરની તમામ શાળાઓ તથા CRC કૉ. ઓર્ડીનેટર હાર્દિક સ્વાગત કરીએ છીએ. આપશ્રીને અહીં ક્લસ્ટરની તમામ શાળાઓની વિગતો જોવા મળશે. અહીંથી આપ અમોને પરિપત્રો મૂકીને અથવા સૂચનપેટીના માધ્યમથી જરૂરી માર્ગદર્શન સૂચન કરી શકો છો. આભાર..🙏"}
                 </p>
                 
                 <button 
                  onClick={() => setShowWelcome(false)} 
                  className={`px-16 py-5 rounded-[2rem] font-black text-white text-lg shadow-xl transition-all transform active:scale-95 uppercase tracking-widest ${userRole === 'dpc_admin' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}
                 >
                    OK (સમજાયું)
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
