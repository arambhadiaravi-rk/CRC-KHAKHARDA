
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
  schoolName,
  toggleSidebar,
  syncStatus
}) => {
  const isImpersonating = (originalRole === 'crc_admin' || originalRole === 'brc_admin' || originalRole === 'dpc_admin') && userRole === 'principal';
  
  const getTabLabel = (id: string) => {
    switch (id) {
      case 'schools': return 'શાળાઓ';
      case 'reports': return 'રિપોર્ટ';
      case 'school-mgmt': return 'વ્યવસ્થાપન';
      case 'enrollment': return 'વિદ્યાર્થી સંખ્યા';
      case 'student-stats': return 'વિદ્યાર્થીઓની વિગત';
      case 'cwsn': return 'દિવ્યાંગ બાળકો';
      case 'fln': return 'FLN ડેટા';
      case 'circulars': return 'પરિપત્રો';
      case 'competitions': return 'સ્પર્ધાઓ';
      case 'achievements': return 'શાળા સિદ્ધિ';
      case 'suggestions': return 'સૂચનપેટી';
      default: return '';
    }
  };

  const getDesignationContent = () => {
    if (userRole === 'principal') {
      return (
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">આચાર્યશ્રી</span>
          <span className="text-xs font-black text-emerald-600 leading-none truncate max-w-[200px]">
            {schoolName}
          </span>
        </div>
      );
    }
    
    if (userRole === 'crc_admin' || userRole === 'crc_viewer') {
      return (
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">DESIGNATION</span>
          <span className="text-xs font-black text-indigo-600 leading-none">
            CRC Coordinator - Khakharda
          </span>
        </div>
      );
    }

    if (userRole === 'brc_admin') {
      return (
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">DESIGNATION</span>
          <span className="text-xs font-black text-amber-600 leading-none">
            BRC Coordinator - Kalyanpur
          </span>
        </div>
      );
    }

    if (userRole === 'dpc_admin') {
      return (
        <div className="flex flex-col items-end">
          <span className="text-xs font-black text-rose-600 leading-none mb-1 uppercase tracking-tight">
            DPC - Devbhoomi Dwarka
          </span>
          <span className="text-[9px] font-black text-slate-500 uppercase leading-none">
            જિલ્લા પ્રાથમિક શિક્ષણાધિકારીશ્રી
          </span>
        </div>
      );
    }

    return null;
  };

  const getProfileDisplay = () => {
    if (userRole === 'principal') {
      return (
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-black text-[10px] uppercase shadow-sm">
          {schoolName}
        </div>
      );
    }

    if (userRole === 'crc_admin' || userRole === 'crc_viewer') {
      return (
        <div className="px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-black text-[10px] uppercase shadow-sm">
          CRC Coordinator - Khakharda
        </div>
      );
    }

    if (userRole === 'brc_admin') {
      return (
        <div className="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 font-black text-[10px] uppercase shadow-sm">
          BRC Coordinator - Kalyanpur
        </div>
      );
    }

    if (userRole === 'dpc_admin') {
      return (
        <div className="flex flex-col items-center px-4 py-1.5 bg-rose-50 border border-rose-100 rounded-xl shadow-sm">
          <span className="text-rose-700 font-black text-[10px] uppercase">DPC - Devbhoomi Dwarka</span>
          <span className="text-[8px] font-bold text-rose-500 uppercase">જિલ્લા પ્રાથમિક શિક્ષણાધિકારીશ્રી</span>
        </div>
      );
    }

    return null;
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-6 z-30 flex-shrink-0 shadow-sm relative">
      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-emerald-50 md:hidden transition-all border border-slate-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16m-7 6h7" /></svg>
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">{getTabLabel(activeTab)}</h2>
          <div className="flex items-center gap-1.5 px-1">
            <span className={`w-1.5 h-1.5 rounded-full ${
              syncStatus === 'synced' ? 'bg-emerald-500' : 
              syncStatus === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
            }`}></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em]">
              {syncStatus === 'synced' ? 'Saved' : syncStatus === 'syncing' ? 'Saving...' : 'Error'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4">
         {isImpersonating && (
            <button onClick={onExitImpersonation} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg">
              EXIT
            </button>
         )}
         
         <div className="hidden md:block">
            {getDesignationContent()}
         </div>

         {getProfileDisplay()}
      </div>
    </header>
  );
};

export default Header;
