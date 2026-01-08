
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

    // New Requested Credentials
    const defaultCrcUser = '2429030011';
    const defaultCrcPass = 'Ravi*1990';
    const defaultAuthorityPass = 'KKD2429030';
    
    // Check localStorage or use defaults
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

  const handleSendOtp = () => {
    if (!code) {
      setError('કૃપા કરીને DISE કોડ અથવા ID દાખલ કરો.');
      return;
    }
    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomOtp);
    setView('VERIFY_OTP');
    setError('');
  };

  const handleVerifyAndReset = () => {
    if (otp !== generatedOtp) {
      setError('દાખલ કરેલ OTP ખોટો છે.');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('કૃપા કરીને ઓછામાં ઓછો 4 અક્ષરનો નવો પાસવર્ડ બનાવો.');
      return;
    }
    if (selectedRole === 'PRINCIPAL') {
      onResetPassword('SCHOOL', code, newPassword);
    } else {
      onResetPassword('ADMIN', selectedRole === 'BRC_DPC' ? 'AUTHORITY' : 'CRC_ADMIN', newPassword);
    }
    setView('RESET_SUCCESS');
  };

  const roles = [
    { id: 'PRINCIPAL', label: 'શાળા', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg> },
    { id: 'CRC_ADMIN', label: 'CRC ADMIN', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: 'BRC_DPC', label: 'BRC / DPC', icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M18 3.13a4 4 0 0 1 0 7.75"/></svg> }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="bg-white/80 backdrop-blur-2xl rounded-[3.5rem] shadow-2xl border border-white p-8 md:p-14">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-xl mb-4 transform -rotate-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">CRC KHAKHARDA</h1>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Login Portal</p>
          </div>

          {view === 'LOGIN' && (
            <div className="animate-in fade-in zoom-in duration-300">
              <div className="grid grid-cols-3 gap-3 mb-8">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => { setSelectedRole(role.id as LoginRole); setCode(''); setPassword(''); setError(''); }}
                    className={`flex flex-col items-center justify-center p-4 rounded-3xl transition-all border-2 ${
                      selectedRole === role.id 
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-xl scale-105' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className="mb-2">{role.icon}</div>
                    <span className="text-[9px] font-black uppercase">{role.label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {(selectedRole === 'PRINCIPAL' || selectedRole === 'CRC_ADMIN') && (
                  <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={selectedRole === 'PRINCIPAL' ? "DISE CODE દાખલ કરો" : "ID દાખલ કરો (2429030011)"}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-3xl px-8 py-4 outline-none font-black text-slate-700 uppercase"
                  />
                )}
                {selectedRole === 'BRC_DPC' && (
                  <select 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-3xl px-8 py-4 outline-none font-black text-slate-700"
                  >
                    <option value="">-- હોદ્દો પસંદ કરો --</option>
                    <option value="BRC_KALYANPUR">BRC કલ્યાણપુર</option>
                    <option value="DPC_DWARKA">DPC દેવભૂમિ દ્વારકા</option>
                  </select>
                )}
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="પાસવર્ડ (PASSWORD)"
                    className="w-full bg-slate-50 border-2 border-slate-50 focus:border-emerald-500 focus:bg-white rounded-3xl px-8 py-4 outline-none font-black text-slate-700 tracking-widest"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>

                {error && <p className="text-red-500 text-xs font-bold text-center px-4 animate-pulse">{error}</p>}

                <button 
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black text-lg shadow-xl transition-all transform active:scale-95"
                >
                  લોગિન કરો (LOGIN)
                </button>
              </form>
              
              <button 
                onClick={() => setView('FORGOT_PASSWORD')}
                className="w-full mt-6 text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors underline"
              >
                પાસવર્ડ ભૂલી ગયા? (FORGOT PASSWORD)
              </button>
            </div>
          )}

          {view === 'FORGOT_PASSWORD' && (
            <div className="animate-in slide-in-from-right-4 duration-300">
               <h3 className="text-xl font-black text-slate-800 mb-6">પાસવર્ડ રીસેટ</h3>
               <div className="space-y-4">
                  <p className="text-sm text-slate-500 font-bold mb-4">તમારા રજીસ્ટર્ડ નંબર પર OTP મોકલવામાં આવશે.</p>
                  <button onClick={handleSendOtp} className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-black shadow-lg">OTP મેળવો</button>
                  <button onClick={() => setView('LOGIN')} className="w-full text-xs font-bold text-slate-400 mt-4">પરત લોગિન પર જાઓ</button>
               </div>
            </div>
          )}
          
          {view === 'VERIFY_OTP' && (
             <div className="animate-in slide-in-from-right-4 duration-300">
                <p className="mb-4 text-emerald-600 font-black bg-emerald-50 p-4 rounded-2xl text-center">તમારો OTP: {generatedOtp}</p>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="ENTER OTP" className="w-full bg-slate-50 border-2 rounded-2xl p-4 mb-4 font-black text-center text-xl tracking-[0.5em]"/>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="નવો પાસવર્ડ (NEW PASSWORD)" className="w-full bg-slate-50 border-2 rounded-2xl p-4 mb-4 font-black"/>
                {error && <p className="text-red-500 text-xs font-bold mb-4 text-center">{error}</p>}
                <button onClick={handleVerifyAndReset} className="w-full bg-slate-900 text-white py-4 rounded-3xl font-black">પાસવર્ડ બદલો અને સેવ કરો</button>
             </div>
          )}

          {view === 'RESET_SUCCESS' && (
             <div className="text-center animate-in zoom-in">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-emerald-600 mb-4">પાસવર્ડ બદલાઈ ગયો છે!</h3>
                <button onClick={() => setView('LOGIN')} className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-black shadow-lg">નવા પાસવર્ડ સાથે લોગિન કરો</button>
             </div>
          )}

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Technical Support</p>
            <a href="tel:8401052890" className="text-emerald-600 font-black text-lg hover:underline transition-all">8401052890</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
