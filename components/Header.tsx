
import React from 'react';
import { TabType, UserRole } from '../types';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userRole: UserRole;
  originalRole: UserRole;
  onLogout: () => void;
  onExitImpersonation: () => void;
  onGithubClick?: () => void;
  onSyncClick?: () => void;
  schoolName?: string;
  activeSubTab?: string;
  toggleSidebar: () => void;
  syncStatus: 'synced' | 'syncing' | 'error';
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  userRole, 
  originalRole, 
  onExitImpersonation,
  onGithubClick,
  onSyncClick,
  schoolName,
  toggleSidebar,
  syncStatus
}) => {
  const isImpersonating = (originalRole === 'crc_admin' || originalRole === 'brc_admin' || originalRole === 'dpc_admin') && userRole === 'principal';
  
  const getTabLabel = (id: string) => {
    switch (id) {
      case 'schools': return 'શાળાઓ';
      case 'reports': return 'રિપોર્ટ';
      case 'data-entry': return 'શાળાની વિગત';
      case 'school-mgmt': return 'વ્યવસ્થાપન';
      case 'circulars': return 'પરિપત્રો';
      case 'competitions': return 'સ્પર્ધાઓ';
      default: return '';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0 shadow-sm relative">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 md:hidden transition-all border border-slate-100 active:scale-90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight truncate max-w-[120px] md:max-w-none">
            {getTabLabel(activeTab)}
          </h2>
          <button 
            onClick={onSyncClick}
            className="flex items-center gap-1.5 hover:bg-slate-50 px-1 rounded transition-colors group"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 
              syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`}></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] group-hover:text-emerald-600">
              {syncStatus === 'synced' ? 'Local Sync' : syncStatus === 'syncing' ? 'Updating...' : 'Sync Error'}
            </span>
          </button>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
         <button 
           onClick={onGithubClick}
           className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-200 group active:scale-90"
           title="GitHub Guides"
         >
           <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
         </button>

         {isImpersonating && (
            <button 
              onClick={onExitImpersonation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-1 shadow-lg shadow-blue-200 active:scale-95"
            >
              EXIT
            </button>
         )}
         
         <div className="hidden md:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active User</span>
            <span className="text-xs font-black text-emerald-600 leading-none truncate max-w-[180px]">
              {schoolName || userRole?.toUpperCase().replace('_', ' ')}
            </span>
         </div>

         <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm border border-emerald-100 shadow-sm group cursor-default">
            {schoolName ? schoolName.charAt(0) : 'C'}
         </div>
      </div>
    </header>
  );
};

export default Header;
