
import React, { useState, useEffect, useMemo } from 'react';
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
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

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
      const timer = setTimeout(() => setSyncStatus('synced'), 1200);
      return () => clearTimeout(timer);
    }
  }, [records, schools, circulars, competitions, syncStatus]);

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    
    if (role === 'brc_admin') {
      setWelcomeMessage("Co. Ordinator શ્રી બ્લોક રિસોર્સ સેન્ટર કલ્યાણપુર આપશ્રીનું હાર્દિક સ્વાગત છે.");
    } else if (role === 'dpc_admin') {
      setWelcomeMessage("જિલ્લા પ્રાથમિક શિક્ષણાધિકારીશ્રી દેવભૂમિ દ્વારકા આપશ્રીનું હાર્દિક સ્વાગત છે.");
    } else {
      setWelcomeMessage(null);
    }

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
    setWelcomeMessage(null);
    setActiveTab('schools');
    setIsSidebarOpen(false);
    setActiveSubTab('');
  };

  const isCoordinatior = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';
  
  const handleImpersonate = (school: School) => {
    if (userRole === 'crc_admin') {
      setLoggedInSchoolId(school.id);
      setUserRole('principal');
      setActiveTab('school-mgmt');
      setActiveSubTab('teachers');
      setIsSidebarOpen(false);
    }
  };

  const handleExitImpersonation = () => {
    setUserRole(originalRole);
    setLoggedInSchoolId(null);
    setActiveTab('schools');
    setActiveSubTab('');
  };

  const updateSchoolData = (updatedSchool: School) => {
    setSyncStatus('syncing');
    setSchools(prev => prev.map(s => s.id === updatedSchool.id ? updatedSchool : s));
  };

  const handleTabClick = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === 'reports') setActiveSubTab('overview');
    else if (tabId === 'school-mgmt') setActiveSubTab('teachers');
    else setActiveSubTab('');
    
    if (tabId !== 'reports' && tabId !== 'school-mgmt') {
      setIsSidebarOpen(false);
    }
  };

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
      { id: 'enrollment', label: 'રજીસ્ટર્ડ સંખ્યા', icon: '📝' },
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

      <aside className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col z-50`}>
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-900/40">
               <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <span className="font-black text-lg tracking-tight">CRC KHAKHARDA</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 p-1 active:scale-90">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <nav className="flex-grow py-6 space-y-1 px-3 overflow-y-auto custom-scrollbar">
          {navItems.filter(item => item.visible).map(item => (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => handleTabClick(item.id as TabType)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${
                  activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3"><span>{item.icon}</span>{item.label}</div>
                {item.subItems && <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${activeTab === item.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>}
              </button>
              
              {item.subItems && activeTab === item.id && (
                <div className="ml-6 pl-3 border-l-2 border-slate-700/50 space-y-1 animate-in slide-in-from-left-2 duration-200">
                  {item.subItems.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => { setActiveSubTab(sub.id); setIsSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-black transition-all ${
                        activeSubTab === sub.id ? 'text-emerald-400 bg-slate-800' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <span>{sub.icon}</span>{sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <div className="mb-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
             <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Cloud Active</span>
             </div>
             <p className="text-[9px] text-slate-400 font-bold leading-relaxed">બધી શાળાઓનો ડેટા એકસાથે સેન્ટ્રલ સર્વર પર સિંક થાય છે.</p>
          </div>
          <button onClick={handleLogout} className="w-full py-3 px-4 rounded-xl text-[11px] font-black text-red-400 hover:bg-red-400/10 transition-all border border-red-400/20 uppercase tracking-widest active:scale-95">લોગઆઉટ</button>
        </div>
      </aside>

      <div className="flex-grow flex flex-col overflow-hidden">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          userRole={userRole} 
          originalRole={originalRole} 
          onLogout={handleLogout} 
          onExitImpersonation={handleExitImpersonation}
          schoolName={loggedInSchool?.name}
          activeSubTab={activeSubTab}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          syncStatus={syncStatus}
        />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 bg-slate-50/50">
           {welcomeMessage && (
            <div className="mb-6 bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center gap-3 animate-in slide-in-from-top-4 duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-sm font-bold">{welcomeMessage}</p>
            </div>
          )}

          <div className="bg-white rounded-[2rem] md:rounded-[3.5rem] shadow-xl border border-slate-100 min-h-[80vh] flex flex-col overflow-hidden relative">
            {activeTab === 'schools' && <SchoolList schools={schools} records={records} userRole={userRole} onImpersonate={handleImpersonate} />}
            {activeTab === 'reports' && <Reports schools={schools} records={records} onRestoreData={() => {}} userRole={userRole} activeSubTabFromProps={(activeSubTab || 'overview') as any} />}
            {activeTab === 'data-entry' && <DataEntryForm schools={schools} onAddRecord={() => {}} loggedInSchool={loggedInSchool} records={records} userRole={userRole} onUpdateSchool={updateSchoolData} />}
            {activeTab === 'school-mgmt' && loggedInSchool && <SchoolManagement school={loggedInSchool} onUpdate={updateSchoolData} userRole={userRole} activeSubTabFromProps={(activeSubTab || 'teachers') as any} />}
            {activeTab === 'circulars' && <Circulars circulars={circulars} onAdd={(c) => { setCirculars([c, ...circulars]); setSyncStatus('syncing'); }} onRemove={(id) => { setCirculars(circulars.filter(c => c.id !== id)); setSyncStatus('syncing'); }} userRole={userRole} />}
            {activeTab === 'competitions' && <Competitions competitions={competitions} onAdd={(c) => { setCompetitions([c, ...competitions]); setSyncStatus('syncing'); }} onRemove={(id) => { setCompetitions(competitions.filter(c => c.id !== id)); setSyncStatus('syncing'); }} userRole={userRole} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
