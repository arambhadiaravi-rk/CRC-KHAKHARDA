
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

/**
 * --- FIREBASE CONFIGURATION ---
 * આ વિગતો તમારા પ્રોજેક્ટ માટે અપડેટ કરવામાં આવી છે.
 */
const firebaseConfig = {
  apiKey: "AIzaSyC9eS9g-fjkQo7jS8ni6GoIvk5vMpFG5b8",
  authDomain: "cluster-resource-center.firebaseapp.com",
  projectId: "cluster-resource-center",
  storageBucket: "cluster-resource-center.firebasestorage.app",
  messagingSenderId: "321646212044",
  appId: "1:321646212044:web:b871be321d4c8b19296369",
  measurementId: "G-R35T6T20G5"
};

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
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'setup_required'>('syncing');
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Data State
  const [schools, setSchools] = useState<School[]>(MASTER_SCHOOLS);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [adminPasswords, setAdminPasswords] = useState(DEFAULT_ADMIN_PASSWORDS);
  
  const [lastViewedSuggestions, setLastViewedSuggestions] = useState<number>(() => {
    return parseInt(localStorage.getItem("suggestions_last_viewed") || '0');
  });

  const dbRef = useRef<any>(null);

  // Firebase Setup
  useEffect(() => {
    const firebase = (window as any).firebase;
    if (!firebase) {
      setSyncStatus('error');
      return;
    }

    if (!firebase.apps.length) {
      try {
        firebase.initializeApp(firebaseConfig);
      } catch (e) {
        setSyncStatus('error');
        return;
      }
    }
    
    dbRef.current = firebase.firestore();
    setSyncStatus('syncing');
    
    // Cloud Synchronization logic
    const unsubscribe = dbRef.current.collection("cluster_data").doc("master_v1").onSnapshot((doc: any) => {
      if (doc.exists) {
        const data = doc.data();
        
        // Merge cloud data with hardcoded master structure
        const cloudSchools = data.schools || [];
        const mergedSchools = MASTER_SCHOOLS.map(ms => {
          const saved = cloudSchools.find((s: School) => s.id === ms.id);
          if (!saved) return ms;
          return { ...ms, ...saved, name: ms.name, diseCode: ms.diseCode };
        });

        setSchools(mergedSchools);
        setRecords(data.records || []);
        setCirculars(data.circulars || []);
        setCompetitions(data.competitions || []);
        setSuggestions(data.suggestions || []);
        setAchievements(data.achievements || []);
        setAdminPasswords(data.adminPasswords || DEFAULT_ADMIN_PASSWORDS);
        setSyncStatus('synced');
      } else {
        // Initial setup for the first time
        saveToCloud({
          schools: MASTER_SCHOOLS,
          records: [],
          circulars: [],
          competitions: [],
          suggestions: [],
          achievements: [],
          adminPasswords: DEFAULT_ADMIN_PASSWORDS
        });
      }
    }, (error: any) => {
      console.error("Firebase Error:", error);
      setSyncStatus('error');
    });

    return () => unsubscribe();
  }, []);

  const saveToCloud = async (updates: any) => {
    if (!dbRef.current) return;
    setSyncStatus('syncing');
    try {
      await dbRef.current.collection("cluster_data").doc("master_v1").set({
        ...updates,
        lastUpdated: Date.now()
      }, { merge: true });
      setSyncStatus('synced');
    } catch (e) {
      setSyncStatus('error');
    }
  };

  const saveData = async (updates: {
    schools?: School[],
    records?: DataRecord[],
    circulars?: Circular[],
    competitions?: Competition[],
    suggestions?: Suggestion[],
    achievements?: Achievement[],
    adminPasswords?: typeof DEFAULT_ADMIN_PASSWORDS
  }) => {
    await saveToCloud(updates);
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
      localStorage.setItem("suggestions_last_viewed", now.toString());
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
            saveData({ adminPasswords: { ...adminPasswords, [role as keyof typeof DEFAULT_ADMIN_PASSWORDS]: pass } });
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
          <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-900/20">
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
              className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-[10px] font-black transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>{item.label}
              </div>
              {item.showStar && (
                <span className="text-amber-400 animate-pulse text-lg">⭐</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-2">
           <div className="flex items-center gap-3 px-4 py-3 bg-slate-800/50 rounded-xl mb-2 border border-slate-700/50">
              <div className={`w-3 h-3 rounded-full shadow-sm ${
                syncStatus === 'synced' ? 'bg-emerald-500 shadow-emerald-500/50' : 
                syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 
                syncStatus === 'setup_required' ? 'bg-indigo-500' : 'bg-rose-500'
              }`}></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">
                {syncStatus === 'synced' ? 'Cloud Live' : 
                 syncStatus === 'syncing' ? 'Syncing...' : 
                 syncStatus === 'setup_required' ? 'Setup Required' : 'Cloud Error'}
              </span>
           </div>
           <button 
              onClick={handleLogout} 
              className="w-full py-3 px-4 rounded-xl text-[10px] font-black text-rose-400 border border-rose-400/20 hover:bg-rose-400/10 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
           >
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
          syncStatus={syncStatus === 'synced' ? 'synced' : syncStatus === 'syncing' ? 'syncing' : 'error'}
        />

        <main className="flex-grow overflow-y-auto p-4 md:p-8 relative">
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

      {showWelcome && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-500 border-4 border-white">
              <div className={`p-10 text-center text-white ${userRole === 'dpc_admin' ? 'bg-rose-600' : 'bg-amber-600'}`}>
                 <h3 className="text-2xl font-black mb-1 uppercase tracking-tight">સ્વાગત સંદેશ (WELCOME)</h3>
              </div>
              
              <div className="p-12 text-center space-y-8">
                 <p className="text-xl font-bold text-slate-700 leading-relaxed italic">
                    {userRole === 'brc_admin' && "BRC કૉ. ઓર્ડીનેટર શ્રી જામ કલ્યાણપુરનું ખાખરડા ક્લસ્ટરની તમામ શાળાઓ તથા CRC કૉ. ઓર્ડીનેટર હાર્દિક સ્વાગત કરીએ છીએ. આભાર..🙏"}
                    {userRole === 'dpc_admin' && "જિલ્લા પ્રોજેક્ટ કૉ ઓર્ડીનેટર શ્રી તથા જિલ્લા પ્રાથમિક શિક્ષણાધિકારી શ્રી દેવભૂમિ દ્વારકાનું અમે ખાખરડા ક્લસ્ટરની તમામ શાળાઓ તથા CRC કૉ. ઓર્ડીનેટર હાર્દિક સ્વાગત કરીએ છીએ. આભાર..🙏"}
                 </p>
                 <button onClick={() => setShowWelcome(false)} className={`px-16 py-5 rounded-[2rem] font-black text-white text-lg shadow-xl uppercase tracking-widest ${userRole === 'dpc_admin' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-600 hover:bg-amber-700'}`}>OK</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
