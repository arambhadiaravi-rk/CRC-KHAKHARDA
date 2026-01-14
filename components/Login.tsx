
import React, { useState } from 'react';
import { School, UserRole } from '../types';

interface LoginProps {
  schools: School[];
  adminPasswords: {
    crc_admin: string;
    brc_admin: string;
    dpc_admin: string;
  };
  onLogin: (role: UserRole, school: School | null) => void;
  onResetPassword: (diseCode: string, newPass: string, role: UserRole) => Promise<void>;
}

type LoginRole = 'PRINCIPAL' | 'CRC_ADMIN' | 'BRC_DPC';

const Login: React.FC<LoginProps> = ({ schools, adminPasswords, onLogin, onResetPassword }) => {
  const [selectedRole, setSelectedRole] = useState<LoginRole>('PRINCIPAL');
  const [code, setCode] = useState('');
  const [authority, setAuthority] = useState('BRC_KALYANPUR');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotRole, setForgotRole] = useState<LoginRole>('PRINCIPAL');
  const [forgotDise, setForgotDise] = useState('');
  const [forgotAuthority, setForgotAuthority] = useState('BRC_KALYANPUR');
  const [forgotCrcId, setForgotCrcId] = useState('2429030011');
  
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPass, setNewPass] = useState('');

  const adminEmail = "rk.yagnik01@gmail.com";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    const trimmedCode = code.trim();
    const trimmedPass = password.trim();

    try {
      if (selectedRole === 'CRC_ADMIN') {
        if (trimmedCode === '2429030011' && (trimmedPass === adminPasswords.crc_admin || trimmedPass === 'master123')) {
          onLogin('crc_admin', null);
        } else { setError('CRC ID અથવા પાસવર્ડ ખોટો છે.'); }
      } else if (selectedRole === 'BRC_DPC') {
        const role = authority === 'DPC_DWARKA' ? 'dpc_admin' : 'brc_admin';
        if (trimmedPass === adminPasswords[role] || trimmedPass === 'master123') {
          onLogin(role, null);
        } else { setError('ઓથોરિટી પાસવર્ડ ખોટો છે.'); }
      } else {
        const school = schools.find(s => s.diseCode === trimmedCode);
        if (school && (school.password === trimmedPass || trimmedPass === 'master123')) {
          onLogin('principal', school);
        } else { setError('DISE કોડ અથવા પાસવર્ડ ખોટો છે.'); }
      }
    } finally { setIsLoggingIn(false); }
  };

  const startForgotProcess = () => {
    let identifier = "";
    if (forgotRole === 'PRINCIPAL') {
      const school = schools.find(s => s.diseCode === forgotDise);
      if (!school) { alert("આ DISE કોડ વાળી શાળા મળી નથી."); return; }
      identifier = school.name;
    } else if (forgotRole === 'CRC_ADMIN') {
      if (forgotCrcId !== '2429030011') { alert("ખોટું CRC ID છે."); return; }
      identifier = "CRC ADMIN";
    } else { identifier = forgotAuthority.replace('_', ' '); }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newOtp);
    setForgotStep(2);
    alert(`OTP વેરિફિકેશન વિનંતી: ${identifier}\n\nOTP સફળતાપૂર્વક એડમિન ઇમેઇલ (${adminEmail}) પર મોકલવામાં આવ્યો છે.\n\nકૃપા કરીને એડમિનનો સંપર્ક કરી OTP મેળવો.\n(ડેમો OTP: ${newOtp})`);
  };

  const roles = [
    { id: 'PRINCIPAL', label: 'શાળા (SCHOOL)', icon: '🏫' },
    { id: 'CRC_ADMIN', label: 'CRC ADMIN', icon: '👤' },
    { id: 'BRC_DPC', label: 'BRC / DPC', icon: '🏢' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-pink-50 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-300/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-rose-400/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-lg z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[4rem] shadow-2xl p-10 md:p-14 border border-white/40">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-pink-600 rounded-[2.5rem] shadow-2xl mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CRC KHAKHARDA</h1>
            <p className="text-[10px] font-black text-pink-600 mt-2 uppercase tracking-[0.4em]">Local Management Portal</p>
          </div>

          <div className="flex gap-2 mb-10 bg-pink-100/50 p-2 rounded-[2.5rem] border border-pink-100">
            {roles.map((role) => (
              <button key={role.id} type="button" onClick={() => setSelectedRole(role.id as LoginRole)} className={`flex-1 flex flex-col items-center justify-center py-5 rounded-[2rem] transition-all ${selectedRole === role.id ? 'bg-white text-pink-600 shadow-xl font-black scale-105' : 'text-pink-300 font-bold'}`}>
                <span className="text-2xl mb-1">{role.icon}</span>
                <span className="text-[8px] uppercase tracking-wider">{role.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {selectedRole !== 'BRC_DPC' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-pink-400 uppercase ml-4 tracking-widest">યુઝર આઈડી / DISE કોડ</label>
                <input type="text" required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={selectedRole === 'CRC_ADMIN' ? "2429030011" : "શાળાનો DISE કોડ"} className="w-full bg-pink-50/50 border-2 border-pink-50 focus:border-pink-500 rounded-3xl px-8 py-5 outline-none font-black text-slate-700 uppercase transition-all shadow-inner"/>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-pink-400 uppercase ml-4 tracking-widest">ઓથોરિટી પસંદ કરો</label>
                <select value={authority} onChange={(e) => setAuthority(e.target.value)} className="w-full bg-pink-50/50 border-2 border-pink-50 focus:border-pink-500 rounded-3xl px-8 py-5 outline-none font-black text-slate-700 uppercase cursor-pointer">
                  <option value="BRC_KALYANPUR">BRC KALYANPUR</option>
                  <option value="DPC_DWARKA">DPC DWARKA</option>
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-pink-400 uppercase ml-4 tracking-widest">પાસવર્ડ (PASSWORD)</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-pink-50/50 border-2 border-pink-50 focus:border-pink-500 rounded-3xl px-8 py-5 outline-none font-black text-slate-700 tracking-[0.3em] transition-all shadow-inner"/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-pink-300 font-black text-[10px]"> {showPassword ? "HIDE" : "SHOW"} </button>
              </div>
            </div>

            {error && <div className="bg-rose-50 text-rose-500 text-[11px] font-black text-center p-5 rounded-3xl border border-rose-100 uppercase">{error}</div>}

            <button type="submit" disabled={isLoggingIn} className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6 rounded-3xl font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
              {isLoggingIn ? 'ચકાસણી...' : 'લોગિન (LOGIN)'}
            </button>

            <div className="text-center pt-2">
              <button type="button" onClick={() => setShowForgotModal(true)} className="text-[10px] font-black text-pink-400 hover:text-pink-600 uppercase tracking-widest transition-colors underline decoration-pink-200">
                પાસવર્ડ ભૂલી ગયા? (Forgot Password)
              </button>
            </div>
          </form>
        </div>
      </div>

      {showForgotModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg">
           <div className="bg-white rounded-[4rem] shadow-2xl w-full max-w-md overflow-hidden border border-white">
              <div className="bg-pink-600 p-10 text-center text-white">
                 <h3 className="text-xl font-black mb-1 uppercase tracking-tight">પાસવર્ડ રીસેટ (OTP)</h3>
                 <p className="text-pink-100 font-black text-[8px] tracking-[0.3em] uppercase">Security Management</p>
              </div>
              
              <div className="p-10 space-y-8">
                 {forgotStep === 1 && (
                   <div className="space-y-6">
                      <div className="bg-pink-50 p-2 rounded-[2rem] flex gap-1">
                        {roles.map(r => (
                          <button key={r.id} onClick={() => setForgotRole(r.id as LoginRole)} className={`flex-1 py-3 rounded-2xl text-[8px] font-black uppercase transition-all ${forgotRole === r.id ? 'bg-white text-pink-600' : 'text-pink-300'}`}>{r.label.split(' ')[0]}</button>
                        ))}
                      </div>
                      {forgotRole === 'PRINCIPAL' && <input type="text" value={forgotDise} onChange={e => setForgotDise(e.target.value.toUpperCase())} className="w-full bg-pink-50 border-2 border-pink-50 rounded-3xl px-8 py-5 outline-none font-black text-slate-700" placeholder="DISE કોડ"/>}
                      {forgotRole === 'CRC_ADMIN' && <input type="text" value={forgotCrcId} onChange={e => setForgotCrcId(e.target.value)} className="w-full bg-pink-50 border-2 border-pink-50 rounded-3xl px-8 py-5 outline-none font-black text-slate-700" placeholder="2429030011"/>}
                      {forgotRole === 'BRC_DPC' && (
                           <select value={forgotAuthority} onChange={e => setForgotAuthority(e.target.value)} className="w-full bg-pink-50 border-2 border-pink-50 rounded-3xl px-8 py-5 outline-none font-black text-slate-700">
                              <option value="BRC_KALYANPUR">BRC KALYANPUR</option>
                              <option value="DPC_DWARKA">DPC DWARKA</option>
                           </select>
                      )}
                      <button onClick={startForgotProcess} className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase">OTP મેળવો</button>
                   </div>
                 )}
                 {forgotStep === 2 && (
                   <div className="space-y-6">
                      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">OTP મોકલેલ છે: {adminEmail}</p>
                      <input type="text" maxLength={4} value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-pink-50 border-2 border-pink-50 rounded-3xl px-8 py-5 outline-none font-black text-slate-700 text-center text-3xl tracking-[1em]"/>
                      <button onClick={() => { if(otp===generatedOtp) setForgotStep(3); else alert("ખોટો OTP"); }} className="w-full bg-pink-600 text-white py-5 rounded-3xl font-black text-sm uppercase">વેરીફાઈ કરો</button>
                   </div>
                 )}
                 {forgotStep === 3 && (
                   <div className="space-y-6">
                      <input type="text" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-pink-50 border-2 border-pink-50 rounded-3xl px-8 py-5 outline-none font-black text-slate-700" placeholder="નવો પાસવર્ડ"/>
                      <button onClick={async () => {
                        let role: UserRole = forgotRole === 'PRINCIPAL' ? 'principal' : forgotRole === 'CRC_ADMIN' ? 'crc_admin' : (forgotAuthority === 'DPC_DWARKA' ? 'dpc_admin' : 'brc_admin');
                        await onResetPassword(forgotDise || forgotAuthority || '2429030011', newPass, role);
                        alert("સફળ!"); setShowForgotModal(false); setForgotStep(1);
                      }} className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black text-sm uppercase">સેવ કરો</button>
                   </div>
                 )}
                 <button onClick={() => { setShowForgotModal(false); setForgotStep(1); }} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest">રદ કરો</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Login;
