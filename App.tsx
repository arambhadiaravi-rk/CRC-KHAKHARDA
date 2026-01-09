
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SchoolList from './components/SchoolList';
import Login from './components/Login';
import SchoolManagement from './components/SchoolManagement';
import StudentDataEntry from './components/StudentDataEntry';
import Reports from './components/Reports';
import Circulars from './components/Circulars';
import Competitions from './components/Competitions';
import { TabType, School, DataRecord, UserRole, Circular, Competition } from './types';

const STORAGE_KEY = "crc_khakharda_local_data";

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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schools');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [originalRole, setOriginalRole] = useState<UserRole>(null);
  const [loggedInSchoolId, setLoggedInSchoolId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const [schools, setSchools] = useState<School[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSchools(parsed.schools || MASTER_SCHOOLS);
        setRecords(parsed.records || []);
        setCirculars(parsed.circulars || []);
        setCompetitions(parsed.competitions || []);
      } catch (e) {
        console.error("Data Parse Error:", e);
        setSchools(MASTER_SCHOOLS);
      }
    } else {
      setSchools(MASTER_SCHOOLS);
    }
  }, []);

  const saveData = (newSchools: School[], newRecords: DataRecord[], newCirculars: Circular[], newCompetitions: Competition[]) => {
    setSyncStatus('syncing');
    const dataToSave = {
      schools: newSchools,
      records: newRecords,
      circulars: newCirculars,
      competitions: newCompetitions,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    
    setSchools(newSchools);
    setRecords(newRecords);
    setCirculars(newCirculars);
    setCompetitions(newCompetitions);
    
    setTimeout(() => setSyncStatus('synced'), 500);
  };

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    if (role === 'principal') setActiveTab('school-mgmt');
    else setActiveTab('schools');
  };

  const updateSchoolData = (updatedSchool: School) => {
    const newSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
    saveData(newSchools, records, circulars, competitions);
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInSchoolId(null);
    setActiveTab('schools');
  };

  const loggedInSchool = useMemo(() => schools.find(s => s.id === loggedInSchoolId) || null, [schools, loggedInSchoolId]);
  const isCoordinatior = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  if (!userRole) {
    return <Login schools={schools} onLogin={handleLogin} onResetPassword={async (dise, pass) => {
      const updated = schools.map(s => s.diseCode === dise ? { ...s, password: pass } : s);
      saveData(updated, records, circulars, competitions);
    }} />;
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
            { id: 'student-stats', label: 'વિદ્યાર્થી આઈડી', icon: '🆔', visible: userRole === 'principal' },
            { id: 'cwsn', label: 'દિવ્યાંગ બાળક', icon: '♿', visible: userRole === 'principal' },
            { id: 'fln', label: 'FLN ડેટા', icon: '📚', visible: userRole === 'principal' },
            { id: 'circulars', label: 'પરિપત્રો', icon: '📜', visible: true },
            { id: 'competitions', label: 'સ્પર્ધાઓ', icon: '🏆', visible: true },
          ].filter(item => item.visible).map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <span className="text-lg">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full py-4 px-4 rounded-xl text-[10px] font-black text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-all uppercase tracking-widest">લોગઆઉટ</button>
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
            {activeTab === 'schools' && <SchoolList schools={schools} records={records} userRole={userRole} onImpersonate={(s) => { if(userRole === 'crc_admin'){ setLoggedInSchoolId(s.id); setUserRole('principal'); setActiveTab('school-mgmt'); } }} />}
            {activeTab === 'reports' && <Reports schools={schools} records={records} onRestoreData={() => {}} userRole={userRole} />}
            {activeTab === 'school-mgmt' && loggedInSchool && <SchoolManagement school={loggedInSchool} onUpdate={updateSchoolData} userRole={userRole} />}
            
            {(activeTab === 'enrollment' || activeTab === 'student-stats' || activeTab === 'cwsn' || activeTab === 'fln') && loggedInSchool && (
              <StudentDataEntry school={loggedInSchool} activeSection={activeTab} onUpdate={updateSchoolData} userRole={userRole} />
            )}

            {activeTab === 'circulars' && <Circulars circulars={circulars} onAdd={(c) => saveData(schools, records, [c, ...circulars], competitions)} onRemove={(id) => saveData(schools, records, circulars.filter(c => c.id !== id), competitions)} userRole={userRole} />}
            {activeTab === 'competitions' && <Competitions competitions={competitions} onAdd={(c) => saveData(schools, records, circulars, [c, ...competitions])} onRemove={(id) => saveData(schools, records, circulars, competitions.filter(c => c.id !== id))} userRole={userRole} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
