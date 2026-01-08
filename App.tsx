
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import SchoolList from './components/SchoolList';
import DataEntryForm from './components/DataEntryForm';
import Login from './components/Login';
import SchoolManagement from './components/SchoolManagement';
import Reports from './components/Reports';
import Circulars from './components/Circulars';
import Competitions from './components/Competitions';
import { TabType, School, DataRecord, UserRole, Circular, Competition } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schools');
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [originalRole, setOriginalRole] = useState<UserRole>(null);
  const [loggedInSchoolId, setLoggedInSchoolId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('crc_schools');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'BHOPALKA PRIMARY SCHOOL', diseCode: '24290300801', principal: 'આચાર્યશ્રી', contact: '9000000001', password: 'school123', teachers: [], enrollment: {}, standards: '1-8', schoolType: 'NON SOE', address: 'BHOPALKA' },
      { id: '2', name: 'BHARATPUR VADI SHALA', diseCode: '24290300802', principal: 'આચાર્યશ્રી', contact: '9000000002', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'BHARATPUR' },
      { id: '3', name: 'KHAKHARDA PRIMARY SCHOOL', diseCode: '24290303801', principal: 'આચાર્યશ્રી', contact: '9000000003', password: 'school123', teachers: [], enrollment: {}, standards: '1-8', schoolType: 'NON SOE', address: 'KHAKHARDA' },
      { id: '4', name: 'KHAKHARDA VADI SHALA 1', diseCode: '24290303802', principal: 'આચાર્યશ્રી', contact: '9000000004', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'KHAKHARDA' },
      { id: '5', name: 'PATELKA TALUKA SHALA', diseCode: '24290305801', principal: 'આચાર્યશ્રી', contact: '9000000005', password: 'school123', teachers: [], enrollment: {}, standards: '1-8', schoolType: 'SOE', address: 'PATELKA' },
      { id: '6', name: 'FAGAS VADI SHALA 1 PATELKA', diseCode: '24290305802', principal: 'આચાર્યશ્રી', contact: '9000000006', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'FAGAS' },
      { id: '7', name: 'LAMDHAR VADI SHALA 2 PATELKA', diseCode: '24290305803', principal: 'આચાર્યશ્રી', contact: '9000000007', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'LAMDHAR' },
      { id: '8', name: 'ROJIDHAR VADI SHALA 3 PATELKA', diseCode: '24290305804', principal: 'આચાર્યશ્રી', contact: '9000000008', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'ROJIDHAR' },
      { id: '9', name: 'KANADHAR VADI SHALA 4 PATELKA', diseCode: '24290305805', principal: 'આચાર્યશ્રી', contact: '9000000009', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'KANADHAR' },
      { id: '10', name: 'BARCHHA VADI SHALA 6 PATELKA', diseCode: '24290305807', principal: 'આચાર્યશ્રી', contact: '9000000010', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'BARCHHA' },
      { id: '11', name: 'THARDHAR VADI SHALA 7 PATELKA', diseCode: '24290305808', principal: 'આચાર્યશ્રી', contact: '9000000011', password: 'school123', teachers: [], enrollment: {}, standards: '1-5', schoolType: 'NON SOE', address: 'THARDHAR' },
      { id: '12', name: 'SHARDAMANDIR HIGH SCHOOL', diseCode: '24290303804', principal: 'આચાર્યશ્રી', contact: '9000000012', password: 'school123', teachers: [], enrollment: {}, standards: '9-10', schoolType: 'NON SOE', address: 'KHAKHARDA' },
    ];
  });

  const [records, setRecords] = useState<DataRecord[]>(() => {
    const saved = localStorage.getItem('crc_records');
    return saved ? JSON.parse(saved) : [];
  });

  const [circulars, setCirculars] = useState<Circular[]>(() => {
    const saved = localStorage.getItem('crc_circulars');
    return saved ? JSON.parse(saved) : [];
  });

  const [competitions, setCompetitions] = useState<Competition[]>(() => {
    const saved = localStorage.getItem('crc_competitions');
    return saved ? JSON.parse(saved) : [];
  });

  const loggedInSchool = useMemo(() => {
    return schools.find(s => s.id === loggedInSchoolId) || null;
  }, [schools, loggedInSchoolId]);

  useEffect(() => {
    localStorage.setItem('crc_records', JSON.stringify(records));
    localStorage.setItem('crc_schools', JSON.stringify(schools));
    localStorage.setItem('crc_circulars', JSON.stringify(circulars));
    localStorage.setItem('crc_competitions', JSON.stringify(competitions));
    
    if (syncStatus === 'syncing') {
      const timer = setTimeout(() => setSyncStatus('synced'), 1000);
      return () => clearTimeout(timer);
    }
  }, [records, schools, circulars, competitions, syncStatus]);

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    if (role === 'principal') {
      setActiveTab('school-mgmt');
      setActiveSubTab('teachers');
    } else {
      setActiveTab('schools');
      setActiveSubTab('');
    }
    setSyncStatus('syncing');
  };

  const handleLogout = () => {
    setUserRole(null);
    setOriginalRole(null);
    setLoggedInSchoolId(null);
    setActiveTab('schools');
    setIsSidebarOpen(false);
  };

  const updateSchoolData = (updatedSchool: School) => {
    setSyncStatus('syncing');
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? { ...s, ...updatedSchool } : s));
  };

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === 'reports') setActiveSubTab('overview');
    else if (tabId === 'school-mgmt') setActiveSubTab('teachers');
    else setActiveSubTab('');
    setIsSidebarOpen(false);
  };

  const handleExportData = () => {
    const fullData = { 
      schools, 
      records, 
      circulars, 
      competitions, 
      exportDate: new Date().toISOString(),
      appVersion: "1.0.final"
    };
    const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CRC_DATABASE_BACKUP_${new Date().toLocaleDateString('gu-IN')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert("બેકઅપ ફાઈલ ડાઉનલોડ થઈ છે. હવે આ ફાઈલ બીજા મોબાઈલમાં મોકલી ત્યાં 'Sync Center' માં ઇમ્પોર્ટ કરો.");
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.schools) setSchools(data.schools);
        if (data.records) setRecords(data.records);
        if (data.circulars) setCirculars(data.circulars);
        if (data.competitions) setCompetitions(data.competitions);
        setSyncStatus('syncing');
        alert("ડેટા સફળતાપૂર્વક અપડેટ થયો છે! હવે બીજા મોબાઈલની માહિતી અહીં જોઈ શકાશે.");
        setShowSyncModal(false);
      } catch (err) {
        alert("ખોટી ફાઈલ! કૃપા કરીને સાચો બેકઅપ અપલોડ કરો.");
      }
    };
    reader.readAsText(file);
  };

  const isCoordinatior = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  if (!userRole) {
    return <Login schools={schools} onLogin={handleLogin} onResetPassword={() => {}} />;
  }

  const navItems = [
    { id: 'schools', label: 'શાળાઓ', icon: '🏫', visible: isCoordinatior },
    { id: 'reports', label: 'રિપોર્ટ', icon: '📊', visible: isCoordinatior, subItems: [
      { id: 'overview', label: 'શાળાવાર વ્યૂ', icon: '🏫' },
      { id: 'teachers', label: 'શિક્ષક ડેટા', icon: '👨‍🏫' },
      { id: 'facilities', label: 'સુવિધા એનાલિસિસ', icon: '🛠️' },
      { id: 'students', label: 'વિદ્યાર્થી ડેટા', icon: '📊' },
      { id: 'fln', label: 'FLN પ્રગતિ', icon: '📈' }
    ]},
    { id: 'data-entry', label: 'પ્રોફાઇલ', icon: '📝', visible: userRole === 'principal' },
    { id: 'school-mgmt', label: 'વ્યવસ્થાપન', icon: '⚙️', visible: userRole === 'principal', subItems: [
      { id: 'teachers', label: 'શિક્ષકો', icon: '👨‍🏫' },
      { id: 'enrollment', label: 'સંખ્યા', icon: '📝' },
      { id: 'students', label: 'વિદ્યાર્થી ડેટા', icon: '👤' },
      { id: 'fln', label: 'FLN', icon: '📈' },
      { id: 'facilities', label: 'સુવિધાઓ', icon: '🛠️' },
      { id: 'gallery', label: 'ગેલેરી', icon: '🖼️' }
    ]},
    { id: 'circulars', label: 'પરિપત્રો', icon: '📜', visible: true },
    { id: 'competitions', label: 'સ્પર્ધાઓ', icon: '🏆', visible: true },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col z-50 shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg></div>
            <span className="font-black text-lg">CRC KHAKHARDA</span>
          </div>
        </div>
        
        <nav className="flex-grow py-6 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => item.visible).map(item => (
            <div key={item.id} className="space-y-1">
              <button onClick={() => handleTabClick(item.id as TabType)} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                <div className="flex items-center gap-3"><span>{item.icon}</span>{item.label}</div>
              </button>
              {item.subItems && activeTab === item.id && (
                <div className="ml-6 pl-3 border-l-2 border-slate-700/50 space-y-1">
                  {item.subItems.map(sub => (
                    <button key={sub.id} onClick={() => { setActiveSubTab(sub.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all ${activeSubTab === sub.id ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'}`}>
                      <span>{sub.icon}</span>{sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-950/20">
           <button onClick={() => setShowSyncModal(true)} className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl font-black text-[10px] hover:bg-emerald-700 mb-4 transition-all uppercase shadow-xl active:scale-95">Cloud Sync Center</button>
           <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl text-[11px] font-black text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-all uppercase">લોગઆઉટ</button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col overflow-hidden">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={userRole} 
          originalRole={originalRole} 
          onLogout={handleLogout} 
          onExitImpersonation={() => { setUserRole(originalRole); setLoggedInSchoolId(null); setActiveTab('schools'); }}
          onGithubClick={() => setShowGithubModal(true)}
          onSyncClick={() => setShowSyncModal(true)}
          schoolName={loggedInSchool?.name}
          activeSubTab={activeSubTab}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          syncStatus={syncStatus}
        />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 min-h-[85vh] flex flex-col overflow-hidden">
            {activeTab === 'schools' && <SchoolList schools={schools} records={records} userRole={userRole} onImpersonate={(s) => { if(userRole === 'crc_admin'){ setLoggedInSchoolId(s.id); setUserRole('principal'); setActiveTab('school-mgmt'); setActiveSubTab('teachers'); } }} />}
            {activeTab === 'reports' && <Reports schools={schools} records={records} onRestoreData={() => {}} userRole={userRole} activeSubTabFromProps={(activeSubTab || 'overview') as any} />}
            {activeTab === 'data-entry' && <DataEntryForm schools={schools} onAddRecord={() => {}} loggedInSchool={loggedInSchool} records={records} userRole={userRole} onUpdateSchool={updateSchoolData} />}
            {activeTab === 'school-mgmt' && loggedInSchool && <SchoolManagement school={loggedInSchool} onUpdate={updateSchoolData} userRole={userRole} activeSubTabFromProps={(activeSubTab || 'teachers') as any} />}
            {activeTab === 'circulars' && <Circulars circulars={circulars} onAdd={(c) => setCirculars([c, ...circulars])} onRemove={(id) => setCirculars(circulars.filter(c => c.id !== id))} userRole={userRole} />}
            {activeTab === 'competitions' && <Competitions competitions={competitions} onAdd={(c) => setCompetitions([c, ...competitions])} onRemove={(id) => setCompetitions(competitions.filter(c => c.id !== id))} userRole={userRole} />}
          </div>
        </main>
      </div>

      {showSyncModal && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="bg-emerald-900 p-12 text-white relative text-center">
                <button onClick={() => setShowSyncModal(false)} className="absolute top-8 right-8 text-emerald-300 hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-3xl font-black mb-1">Cluster Sync</h3>
                <p className="text-emerald-300 text-[10px] font-black uppercase tracking-widest">ડેટા ટ્રાન્સફર સેન્ટર</p>
             </div>
             
             <div className="p-10 space-y-6">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <h4 className="font-black text-slate-800 mb-2 text-xs uppercase">અગત્યની સૂચના:</h4>
                   <p className="text-[11px] font-bold text-slate-500 leading-relaxed italic">
                     "ડેટા અત્યારે ફક્ત આ મોબાઈલમાં સેવ થાય છે. બીજા મોબાઈલમાં આ જ માહિતી જોવા માટે 'એક્સપોર્ટ' કરી ફાઈલ વોટ્સએપ પર મોકલો અને ત્યાં 'ઇમ્પોર્ટ' કરો."
                   </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                   <button onClick={handleExportData} className="flex items-center gap-6 bg-slate-900 text-white p-6 rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95">
                      <div className="bg-white/10 p-3 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg></div>
                      <div className="text-left"><span className="block font-black text-sm uppercase tracking-tight">બેકઅપ ડાઉનલોડ (EXPORT)</span><span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Share this via WhatsApp</span></div>
                   </button>

                   <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-6 bg-emerald-50 text-emerald-900 p-6 rounded-3xl hover:bg-emerald-100 transition-all border-2 border-emerald-100 active:scale-95">
                      <div className="bg-emerald-200 p-3 rounded-xl text-emerald-700"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg></div>
                      <div className="text-left"><span className="block font-black text-sm uppercase tracking-tight">ડેટા રીસ્ટોર (IMPORT)</span><span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest">Upload WhatsApp file here</span></div>
                   </button>
                   <input type="file" accept=".json" ref={fileInputRef} className="hidden" onChange={handleImportData} />
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
