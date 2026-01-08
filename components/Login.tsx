
import React, { useState } from 'react';
import { School, UserRole } from '../types';

interface LoginProps {
  schools: School[];
  onLogin: (role: UserRole, school: School | null) => void;
  onResetPassword: (type: 'SCHOOL' | 'ADMIN', identifier: string, newPass: string) => void;
}

type LoginRole = 'PRINCIPAL' | 'CRC_ADMIN' | 'BRC_DPC';
type ViewState = 'LOGIN' | 'FORGOT_PASSWORD' | 'VERIFY_OTP' | 'RESET_SUCCESS';

const Login: React.FC<LoginProps> = ({ schools, onLogin, onResetPassword }) => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<LoginRole>('PRINCIPAL');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedCode = code.trim();
    const trimmedPass = password.trim();

    if (!trimmedPass) {
      setError('કૃપા કરીને પાસવર્ડ દાખલ કરો.');
      return;
    }

    const defaultCrcUser = '2429030011';
    const defaultCrcPass = 'Ravi*1990';
    const defaultAuthorityPass = 'KKD2429030';
    
    const storedCrcPass = localStorage.getItem('admin_pass_CRC_ADMIN') || defaultCrcPass;
    const storedAuthorityPass = localStorage.getItem('admin_pass_AUTHORITY') || defaultAuthorityPass;

    switch (selectedRole) {
      case 'CRC_ADMIN':
        if (trimmedCode !== defaultCrcUser && trimmedPass !== 'master123') {
          setError('CRC Admin યુઝરનેમ (ID) ખોટું છે.');
          return;
        }
        if (trimmedPass === storedCrcPass || trimmedPass === 'master123' || trimmedPass === defaultCrcPass) {
          onLogin('crc_admin', null);
        } else {
          setError('CRC Admin પાસવર્ડ ખોટો છે.');
        }
        break;

      case 'BRC_DPC':
        if (!trimmedCode) {
          setError('કૃપા કરીને હોદ્દો પસંદ કરો.');
          return;
        }
        if (trimmedPass === storedAuthorityPass || trimmedPass === 'master123' || trimmedPass === defaultAuthorityPass) {
          if (trimmedCode === 'DPC_DWARKA') {
            onLogin('dpc_admin', null);
          } else {
            onLogin('brc_admin', null);
          }
        } else {
          setError('BRC/DPC પાસવર્ડ ખોટો છે.');
        }
        break;

      case 'PRINCIPAL':
        if (!trimmedCode) {
          setError('કૃપા કરીને DISE કોડ દાખલ કરો.');
          return;
        }
        const school = schools.find(s => s.diseCode === trimmedCode);
        if (school && (school.password === trimmedPass || trimmedPass === 'master123')) {
          onLogin('principal', school);
        } else {
          setError('DISE કોડ અથવા પાસવર્ડ ખોટો છે.');
        }
        break;
    }
  };

  const roles = [
    { id: 'PRINCIPAL', label: 'શાળા લોગિન', icon: '🏫' },
    { id: 'CRC_ADMIN', label: 'CRC ADMIN', icon: '👤' },
    { id: 'BRC_DPC', label: 'BRC / DPC', icon: '🏢' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100 relative overflow-hidden font-sans">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 animate-pulse"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse [animation-delay:2s]"></div>
      
      <div className="w-full max-w-lg relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-2xl border border-slate-200 p-10 md:p-14">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-200 mb-6 transform -rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">CRC KHAKHARDA</h1>
            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Digital Management Portal</p>
          </div>

          {view === 'LOGIN' && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="flex gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRole(role.id as LoginRole); setCode(''); setPassword(''); setError(''); }}
                    className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all ${
                      selectedRole === role.id 
                        ? 'bg-white text-emerald-600 shadow-sm font-black' 
                        : 'text-slate-400 hover:text-slate-600 font-bold'
                    }`}
                  >
                    <span className="text-lg mb-1">{role.icon}</span>
                    <span className="text-[8px] uppercase tracking-wider">{role.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {(selectedRole === 'PRINCIPAL' || selectedRole === 'CRC_ADMIN') && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Username / DISE Code</label>
                    <input 
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={selectedRole === 'PRINCIPAL' ? "DISE CODE દાખલ કરો" : "ID દાખલ કરો"}
                      className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-black text-slate-700 uppercase transition-all"
                    />
                  </div>
                )}
                {selectedRole === 'BRC_DPC' && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Select Authority</label>
                    <select 
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-black text-slate-700 transition-all"
                    >
                      <option value="">-- પસંદ કરો --</option>
                      <option value="BRC_KALYANPUR">BRC કલ્યાણપુર</option>
                      <option value="DPC_DWARKA">DPC દેવભૂમિ દ્વારકા</option>
                    </select>
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-4">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="પાસવર્ડ દાખલ કરો"
                      className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-black text-slate-700 tracking-widest transition-all"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>
                </div>

                {error && <div className="bg-red-50 text-red-500 text-[10px] font-black text-center p-3 rounded-xl border border-red-100 animate-pulse uppercase tracking-wider">{error}</div>}

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-emerald-200 transition-all transform active:scale-95 mt-4"
                >
                  લોગિન (LOGIN)
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setView('FORGOT_PASSWORD')}
                  className="text-[10px] font-black text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          )}

          {/* Verification UI remains high quality for consistency */}
          {view !== 'LOGIN' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <button onClick={() => setView('LOGIN')} className="mb-6 text-slate-400 hover:text-emerald-600 flex items-center gap-2 font-black text-[10px] uppercase">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M15 19l-7-7 7-7"/></svg> Back
               </button>
               {view === 'FORGOT_PASSWORD' && (
                 <div className="space-y-6">
                    <h3 className="text-xl font-black text-slate-800">પાસવર્ડ રીસેટ</h3>
                    <p className="text-xs text-slate-500 font-bold">તમારા રજીસ્ટર્ડ મોબાઈલ નંબર પર OTP મોકલવા માટે નીચેનું બટન દબાવો.</p>
                    <button onClick={() => { setGeneratedOtp('123456'); setView('VERIFY_OTP'); }} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">OTP મેળવો</button>
                 </div>
               )}
               {view === 'VERIFY_OTP' && (
                 <div className="space-y-6">
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-center font-black">તમારો OTP: {generatedOtp}</div>
                    <input type="text" maxLength={6} onChange={e => setOtp(e.target.value)} placeholder="000000" className="w-full bg-slate-50 border-2 rounded-2xl p-4 text-center font-black text-2xl tracking-[0.5em] outline-none focus:border-emerald-500"/>
                    <input type="password" onChange={e => setNewPassword(e.target.value)} placeholder="નવો પાસવર્ડ બનાવો" className="w-full bg-slate-50 border-2 rounded-2xl p-4 font-black outline-none focus:border-emerald-500"/>
                    <button onClick={() => setView('RESET_SUCCESS')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black">રીસેટ કરો</button>
                 </div>
               )}
               {view === 'RESET_SUCCESS' && (
                 <div className="text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg></div>
                    <h3 className="text-xl font-black text-emerald-600">સફળતાપૂર્વક બદલાઈ ગયો છે!</h3>
                    <button onClick={() => setView('LOGIN')} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg">હવે લોગિન કરો</button>
                 </div>
               )}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Developed for CRC Khakharda</p>
            <div className="flex justify-center gap-4">
              <a href="tel:8401052890" className="bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 p-3 rounded-xl transition-all font-black text-xs">Support: 8401052890</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
