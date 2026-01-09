
import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
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
  apiKey: "AIzaSyDmHdJPaz6w4b8MQvMO7jzp58HbSwKSTdI",
  authDomain: "crc-khakharda-c88d7.firebaseapp.com",
  projectId: "crc-khakharda-c88d7",
  storageBucket: "crc-khakharda-c88d7.firebasestorage.app",
  messagingSenderId: "1092915968972",
  appId: "1:1092915968972:web:65b016822290e697e5bb69",
  measurementId: "G-J2WHJ6BH26"
};

// Initialize Firebase safely
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const DATA_DOC_ID = "main_cluster_data";

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
  
  const [schools, setSchools] = useState<School[]>([]);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    setSyncStatus('syncing');
    const docRef = doc(db, "cluster", DATA_DOC_ID);

    const unsub = onSnapshot(docRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSchools(data.schools || MASTER_SCHOOLS);
          setRecords(data.records || []);
          setCirculars(data.circulars || []);
          setCompetitions(data.competitions || []);
          setSyncStatus('synced');
        } else {
          console.log("Database empty. Initializing...");
          await setDoc(docRef, {
            schools: MASTER_SCHOOLS,
            records: [],
            circulars: [],
            competitions: [],
            lastUpdated: new Date().toISOString()
          });
          setSyncStatus('synced');
        }
      } catch (err: any) {
        console.error("Sync Error:", err.message);
        setSyncStatus('error');
      }
    }, (error) => {
      console.error("Firebase Error:", error.message);
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
      console.error("Write Error:", error);
      setSyncStatus('error');
    }
  };

  const handleLogin = (role: UserRole, school: School | null) => {
    setUserRole(role);
    setOriginalRole(role);
    setLoggedInSchoolId(school?.id || null);
    if (role === 'principal') setActiveTab('school-mgmt');
    else setActiveTab('schools');
    if (role === 'brc_admin' || role === 'dpc_admin') setShowWelcomeModal(true);
  };

  const updateSchoolData = async (updatedSchool: School) => {
    const newSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
    await saveToFirebase(newSchools, records, circulars, competitions);
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
      await saveToFirebase(updated, records, circulars, competitions);
    }} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-800">
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out w-72 bg-slate-900 text-white flex-shrink-0 flex flex-col z-50 shadow-2xl`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-pink-600 p-2.5 rounded-xl">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
          </div>
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

        <div className="p-6 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full py-4 px-4 rounded-xl text-xs font-black text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-all uppercase tracking-widest">લોગઆઉટ</button>
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

      {showWelcomeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="bg-emerald-600 p-12 text-center text-white">
                 <div className="text-4xl mb-4">✅</div>
                 <h3 className="text-2xl font-black mb-2 uppercase">Database Active</h3>
              </div>
              <div className="p-10 text-center space-y-6">
                 <p className="text-slate-600 font-bold leading-relaxed">તમારા Firebase Rules અપડેટ થઈ ગયા છે. હવે તમે જે પણ ફેરફાર કરશો તે સીધા ક્લાઉડ સર્વર પર સેવ થશે.</p>
                 <button onClick={() => setShowWelcomeModal(false)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl tracking-widest uppercase">શરૂ કરો</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
