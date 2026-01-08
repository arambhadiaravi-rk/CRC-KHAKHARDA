
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";
import Header from './components/Header';
import SchoolList from './components/SchoolList';
import Login from './components/Login';
import SchoolManagement from './components/SchoolManagement';
import Reports from './components/Reports';
import Circulars from './components/Circulars';
import Competitions from './components/Competitions';
import { TabType, School, DataRecord, UserRole, Circular, Competition } from './types';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAs-DEMO-ONLY-DO-NOT-USE-IN-PROD",
  authDomain: "crc-khakharda.firebaseapp.com",
  projectId: "crc-khakharda",
  storageBucket: "crc-khakharda.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const DATA_DOC_ID = "main_cluster_data";

// ખખરડા ક્લસ્ટરની નવી અધિકૃત યાદી (સાચા DISE કોડ સાથે)
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
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('syncing');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  
  const [schools, setSchools] = useState<School[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  // Firebase Firestore Real-time Listener
  useEffect(() => {
    setSyncStatus('syncing');
    const unsub = onSnapshot(doc(db, "cluster", DATA_DOC_ID), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchools(data.schools || []);
        setRecords(data.records || []);
        setCirculars(data.circulars || []);
        setCompetitions(data.competitions || []);
        setSyncStatus('synced');
      } else {
        setSchools([]);
        setSyncStatus('error');
      }
    }, (error) => {
      console.error("Firebase Sync Error:", error);
      setSyncStatus('error');
    });

    return () => unsub();
  }, []);

  const saveToFirebase = async (currentSchools: School[], currentRecords: DataRecord[], currentCirculars: Circular[], currentCompetitions: Competition[]) => {
    setSyncStatus('syncing');
    try {
      await setDoc(doc(db, "cluster", DATA_DOC_ID), {
        schools: currentSchools,
        records: currentRecords,
        circulars: currentCirculars,
        competitions: currentCompetitions,
        lastUpdated: new Date().toISOString()
      }, { merge: true });
      setSyncStatus('synced');
    } catch (error) {
      console.error("Save Error:", error);
      setSyncStatus('error');
    }
  };

  const resetAllSchoolData = async () => {
    if (userRole !== 'crc_admin') return;
    if (!window.confirm("શું તમે તમામ ૧૨ શાળાઓના DISE કોડ અને લિસ્ટને નવી માસ્ટર યાદી મુજબ રિસેટ કરવા માંગો છો?")) return;
    
    await saveToFirebase(MASTER_SCHOOLS, [], circulars, competitions);
    alert("યાદી સફળતાપૂર્વક અપડેટ અને રિસેટ થઈ ગઈ છે!");
  };

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    if (role === 'principal') setActiveTab('school-mgmt');
    else setActiveTab('schools');
    if (role === 'brc_admin' || role === 'dpc_admin') setShowWelcomeModal(true);
  };

  const handleResetPassword = async (diseCode: string, newPass: string) => {
    const updatedSchools = schools.map(s => s.diseCode === diseCode ? { ...s, password: newPass } : s);
    await saveToFirebase(updatedSchools, records, circulars, competitions);
  };

  const updateSchoolData = async (updatedSchool: School) => {
    if (userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer') return;
    const newSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
    await saveToFirebase(newSchools, records, circulars, competitions);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !loggedInSchoolId) return;
    const updatedSchools = schools.map(s => s.id === loggedInSchoolId ? { ...s, password: newPassword } : s);
    await saveToFirebase(updatedSchools, records, circulars, competitions);
    alert("પાસવર્ડ બદલાઈ ગયો છે!");
    setShowChangePasswordModal(false);
    setNewPassword('');
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInSchoolId(null);
    setActiveTab('schools');
  };

  const loggedInSchool = useMemo(() => schools.find(s => s.id === loggedInSchoolId) || null, [schools, loggedInSchoolId]);
  const isCoordinatior = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin' || userRole === 'crc_viewer';

  if (!userRole) {
    return <Login schools={schools} onLogin={handleLogin} onResetPassword={handleResetPassword} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col z-50 shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-pink-600 p-2.5 rounded-xl"><svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg></div>
          <span className="font-black text-lg tracking-tight uppercase">CRC KHAKHARDA</span>
        </div>
        
        <nav className="flex-grow py-6 space-y-1 px-3 overflow-y-auto">
          {[
            { id: 'schools', label: 'શાળાઓ', icon: '🏫', visible: isCoordinatior },
            { id: 'reports', label: 'રિપોર્ટ', icon: '📊', visible: isCoordinatior },
            { id: 'school-mgmt', label: 'વ્યવસ્થાપન', icon: '⚙️', visible: userRole === 'principal' },
            { id: 'circulars', label: 'પરિપત્રો', icon: '📜', visible: true },
            { id: 'competitions', label: 'સ્પર્ધાઓ', icon: '🏆', visible: true },
          ].filter(item => item.visible).map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id as TabType); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-black transition-all ${activeTab === item.id ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 space-y-3">
           {userRole === 'crc_admin' && (
             <button onClick={resetAllSchoolData} className="w-full py-2.5 px-4 rounded-xl text-[10px] font-black text-amber-400 border border-amber-400/20 hover:bg-amber-400/10 transition-all flex items-center justify-center gap-2">
               🔄 શાળાઓ રિસેટ કરો
             </button>
           )}
           <button onClick={() => setShowChangePasswordModal(true)} className="w-full py-2.5 px-4 rounded-xl text-[10px] font-black text-blue-400 border border-blue-400/20 hover:bg-blue-400/10 transition-all flex items-center justify-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><circle cx="12" cy="11" r="3"/><path d="M12 14v4"/></svg>
             પાસવર્ડ બદલો
           </button>
           <button onClick={handleLogout} className="w-full py-2.5 px-4 rounded-xl text-[10px] font-black text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-all">લોગઆઉટ</button>
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
            {activeTab === 'circulars' && <Circulars circulars={circulars} onAdd={(c) => saveToFirebase(schools, records, [c, ...circulars], competitions)} onRemove={(id) => saveToFirebase(schools, records, circulars.filter(c => c.id !== id), competitions)} userRole={userRole} />}
            {activeTab === 'competitions' && <Competitions competitions={competitions} onAdd={(c) => saveToFirebase(schools, records, circulars, [c, ...competitions])} onRemove={(id) => saveToFirebase(schools, records, circulars, competitions.filter(c => c.id !== id))} userRole={userRole} />}
          </div>
        </main>
      </div>

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-blue-600 p-10 text-center text-white relative">
                 <h3 className="text-xl font-black mb-2 uppercase">પાસવર્ડ બદલો</h3>
                 <p className="text-blue-100 font-black text-[9px] tracking-widest uppercase">Firebase Secure Update</p>
              </div>
              <div className="p-10 space-y-6">
                 <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter New Password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 outline-none font-black text-slate-700 focus:border-blue-500 transition-all" />
                 <div className="flex gap-4">
                    <button onClick={() => setShowChangePasswordModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">રદ કરો</button>
                    <button onClick={handleChangePassword} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl text-sm">પાસવર્ડ સેવ કરો</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-pink-600 p-12 text-center text-white">
                 <div className="text-4xl mb-4">🏢</div>
                 <h3 className="text-2xl font-black mb-2 uppercase">શુભેચ્છા સંદેશ</h3>
                 <p className="text-pink-100 font-black text-[10px] tracking-widest uppercase">Live Data Access</p>
              </div>
              <div className="p-10 text-center space-y-6">
                 <p className="text-slate-600 font-bold leading-relaxed">નમસ્તે સાહેબ! <b>Firebase Real-time</b> ક્લસ્ટર પોર્ટલમાં આપનું સ્વાગત છે. આપ શાળાઓના DISE કોડ અને તમામ રિપોર્ટ્સ હવે વાસ્તવિક સમયમાં જોઈ શકશો.</p>
                 <button onClick={() => setShowWelcomeModal(false)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl tracking-widest uppercase">OK</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
