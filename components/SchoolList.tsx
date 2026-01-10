
import React, { useState } from 'react';
import { School, DataRecord, Teacher, ClassEnrollment, UserRole, StudentStats } from '../types';

interface SchoolListProps {
  schools: School[];
  records: DataRecord[];
  userRole: UserRole;
  onImpersonate: (school: School) => void;
}

const SchoolList: React.FC<SchoolListProps> = ({ schools, records, userRole, onImpersonate }) => {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  const isFullAdmin = userRole === 'crc_admin' || userRole === 'brc_admin' || userRole === 'dpc_admin';

  if (selectedSchool) {
    const enrollment = selectedSchool.enrollment || {};
    const fln = selectedSchool.flnData || [];
    const stats: Record<string, StudentStats> = selectedSchool.studentStats || {};
    const facilities = selectedSchool.facilities;
    const cwsn = selectedSchool.cwsnData;
    const gallery = selectedSchool.gallery || [];
    const teachers = selectedSchool.teachers || [];
    
    return (
      <div className="p-4 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 overflow-y-auto max-h-[85vh]">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => setSelectedSchool(null)}
            className="flex items-center gap-2 text-emerald-700 font-bold hover:text-emerald-900 transition-colors bg-emerald-50 px-4 py-2 rounded-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            પરત જાઓ
          </button>
          
          {/* ONLY CRC ADMIN can impersonate a school */}
          {userRole === 'crc_admin' && (
            <button 
              onClick={() => onImpersonate(selectedSchool)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              શાળા તરીકે લોગિન
            </button>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden mb-10">
          <div className="bg-emerald-900 p-8 text-white relative">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg>
             </div>
             <h2 className="text-2xl md:text-3xl font-black mb-2 relative z-10">{selectedSchool.name}</h2>
             <p className="text-emerald-200 font-bold text-sm md:text-base relative z-10">DISE: {selectedSchool.diseCode} | આચાર્ય: {selectedSchool.principal}</p>
          </div>

          <div className="p-6 md:p-8 space-y-12">
            {/* Teachers Section */}
            <section>
              <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                શિક્ષકોની વિગત (Staff Details)
              </h3>
              {teachers.length > 0 ? (
                <div className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-4 font-black uppercase tracking-tight">નામ</th>
                          <th className="p-4 font-black uppercase tracking-tight">જાતિ</th>
                          <th className="p-4 font-black uppercase tracking-tight">હોદ્દો</th>
                          <th className="p-4 font-black uppercase tracking-tight">જન્મતારીખ</th>
                          <th className="p-4 font-black uppercase tracking-tight">મોબાઈલ</th>
                          <th className="p-4 font-black uppercase tracking-tight">આધાર</th>
                          <th className="p-4 font-black uppercase tracking-tight">પ્રથમ નિમણૂક</th>
                          <th className="p-4 font-black uppercase tracking-tight">હાજર તારીખ</th>
                          <th className="p-4 font-black uppercase tracking-tight">વિભાગ</th>
                          <th className="p-4 font-black uppercase tracking-tight">વિષય</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {teachers.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-slate-50">
                            <td className="p-4 font-black text-slate-700 italic">{t.name}</td>
                            <td className="p-4 font-bold text-slate-500">{t.gender || '-'}</td>
                            <td className="p-4 font-black text-indigo-600">{t.designation || '-'}</td>
                            <td className="p-4 font-bold text-slate-500 whitespace-nowrap">{t.dob || '-'}</td>
                            <td className="p-4 font-black text-slate-700">{t.mobile || '-'}</td>
                            <td className="p-4 font-bold text-slate-500">{t.aadhaar || '-'}</td>
                            <td className="p-4 font-bold text-slate-500 whitespace-nowrap">{t.joiningServiceDate || '-'}</td>
                            <td className="p-4 font-bold text-slate-500 whitespace-nowrap">{t.joiningSchoolDate || '-'}</td>
                            <td className="p-4 font-black text-emerald-600">{t.section || '-'}</td>
                            <td className="p-4 font-black text-blue-600">{t.subject || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center italic text-slate-400 bg-slate-50 rounded-3xl border border-dashed">શિક્ષકોની માહિતી ઉપલબ્ધ નથી</div>
              )}
            </section>

            {/* Physical Facilities Section */}
            <section>
              <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                ભૌતિક સુવિધાઓ (Physical Facilities)
              </h3>
              {facilities ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">શૌચાલય અને ઓરડા</p>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">ઓરડાઓ:</span><span className="font-black">{facilities.roomsCount || 0}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-emerald-600 font-bold">કુમાર શૌચાલય / યુરિનલ:</span><span className="font-black">{(facilities.boysToilets||0)} / {(facilities.boysUrinals || 0)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-pink-600 font-bold">કન્યા શૌચાલય / યુરિનલ:</span><span className="font-black">{(facilities.girlsToilets||0)} / {(facilities.girlsUrinals || 0)}</span></div>
                    <div className="flex justify-between text-sm border-t pt-1 font-black"><span>કુલ યુનિટ:</span><span className="text-slate-900">{(Number(facilities.boysToilets)||0) + (Number(facilities.girlsToilets)||0) + (Number(facilities.boysUrinals)||0) + (Number(facilities.girlsUrinals)||0)}</span></div>
                    <div className="flex justify-between text-sm"><span>CWSN ટોયલેટ:</span><span className={`font-black ${facilities.hasCWSNToilet === 'હા' ? 'text-emerald-600' : 'text-slate-400'}`}>{facilities.hasCWSNToilet || '-'}</span></div>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">લેબ અને ટેકનોલોજી</p>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">કમ્પ્યુટર લેબ:</span><span className={`font-black ${facilities.hasComputerLab === 'હા' ? 'text-blue-600' : 'text-slate-400'}`}>{facilities.hasComputerLab || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">કુલ કમ્પ્યુટર:</span><span className="font-black">{facilities.computerCount || 0}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">ઇન્ટરનેટ સુવિધા:</span><span className={`font-black ${facilities.hasInternet === 'હા' ? 'text-blue-600' : 'text-slate-400'}`}>{facilities.hasInternet || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">LBD લેબ:</span><span className={`font-black ${facilities.hasLBDLab === 'હા' ? 'text-blue-600' : 'text-slate-400'}`}>{facilities.hasLBDLab || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">અન્ય લેબ:</span><span className={`font-black ${facilities.hasOtherLab === 'હા' ? 'text-blue-600' : 'text-slate-400'}`}>{facilities.hasOtherLab || '-'}</span></div>
                    {facilities.hasOtherLab === 'હા' && <p className="text-[10px] text-blue-600 font-bold italic bg-blue-50 p-1.5 rounded-lg border border-blue-100">વિગત: {facilities.otherLabDetails}</p>}
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">પાણી અને મશીનરી</p>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">પીવાનું પાણી:</span><span className={`font-black ${facilities.hasDrinkingWater === 'હા' ? 'text-cyan-600' : 'text-slate-400'}`}>{facilities.hasDrinkingWater || '-'}</span></div>
                    {facilities.hasDrinkingWater === 'હા' && <p className="text-[10px] text-cyan-700 font-bold italic bg-cyan-50 p-1.5 rounded-lg">સ્ત્રોત: {facilities.drinkingWaterSource}</p>}
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">R.O. સુવિધા:</span><span className={`font-black ${facilities.hasRO === 'હા' ? 'text-cyan-600' : 'text-slate-400'}`}>{facilities.hasRO || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">વેન્ડિંગ મશીન:</span><span className={`font-black ${facilities.hasVendingMachine === 'હા' ? 'text-cyan-600' : 'text-slate-400'}`}>{facilities.hasVendingMachine || '-'}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-bold">ઈન્સીનેરેટર:</span><span className={`font-black ${facilities.hasIncinerator === 'હા' ? 'text-cyan-600' : 'text-slate-400'}`}>{facilities.hasIncinerator || '-'}</span></div>
                  </div>
                </div>
              ) : <div className="py-10 text-center italic text-slate-400 bg-slate-50 rounded-3xl border border-dashed">ભૌતિક સુવિધાઓની માહિતી ઉપલબ્ધ નથી</div>}
            </section>

            {/* CWSN Data Section */}
            <section className="bg-indigo-50/50 p-6 md:p-8 rounded-[2rem] border border-indigo-100">
               <h3 className="text-xl font-black text-indigo-900 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v2m0 0v2m0-2h2m-2 0h-2"/></svg>
                CWSN બાળકોની માહિતી
               </h3>
               {cwsn ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 space-y-4">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-3">સામાન્ય માહિતી</p>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">બાળકોની સંખ્યા:</span><span className="text-indigo-700">{cwsn.studentCount || 0}</span></div>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">વિકલાંગતા પ્રમાણપત્ર:</span><span className={`px-2 py-0.5 rounded-lg text-[10px] ${cwsn.hasCertificate === 'હા' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>{cwsn.hasCertificate || '-'}</span></div>
                       <div className="flex justify-between text-sm font-bold"><span className="text-slate-500">સહાય પ્રાપ્ત:</span><span className={`px-2 py-0.5 rounded-lg text-[10px] ${cwsn.receivedAssistance === 'હા' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>{cwsn.receivedAssistance || '-'}</span></div>
                       {cwsn.receivedAssistance === 'હા' && <p className="text-xs text-indigo-600 font-black bg-indigo-50 p-3 rounded-2xl border border-indigo-100">સહાય વિગત: {cwsn.assistanceDetails}</p>}
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100">
                       <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">બાળકોની યાદી</p>
                       <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {cwsn.students && cwsn.students.length > 0 ? cwsn.students.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                               <span className="text-xs font-black text-slate-700">{s.name}</span>
                               <span className="text-[10px] font-black bg-indigo-600 text-white px-3 py-1 rounded-full uppercase">{s.standard}</span>
                            </div>
                          )) : <p className="text-xs text-slate-400 italic text-center py-6">બાળકોની યાદી ખાલી છે</p>}
                       </div>
                    </div>
                 </div>
               ) : <div className="py-10 text-center italic text-slate-400 bg-white rounded-3xl border border-dashed">CWSN ડેટા ઉપલબ્ધ નથી</div>}
            </section>

            {/* Gallery Section */}
            <section>
              <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                શાળા ગેલેરી (Gallery)
              </h3>
              {gallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                  {gallery.map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-md border border-slate-100 group">
                      <img src={img} alt="School Gallery" className="w-full h-full object-cover transition-transform hover:scale-110 duration-700 cursor-zoom-in" onClick={() => window.open(img, '_blank')} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-[2rem] border border-dashed">
                   <p className="font-bold italic text-sm">શાળાના કોઈ ફોટા ઉપલબ્ધ નથી</p>
                </div>
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <section>
                  <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    વિદ્યાર્થી ડેટા સારાંશ
                  </h3>
                  <div className="bg-slate-50 rounded-3xl p-4 overflow-x-auto border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-1 font-black">ધોરણ</th>
                          <th className="py-2 px-1 font-black text-center">MBU</th>
                          <th className="py-2 px-1 font-black text-center">આધાર</th>
                          <th className="py-2 px-1 font-black text-center">APAAR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(stats).map(([std, s]) => (
                          <tr key={std} className="border-b border-slate-200/50">
                            <td className="py-2 px-1 font-bold">{std}</td>
                            <td className="py-2 px-1 text-center font-black text-emerald-600">{s.mbuCount || 0}</td>
                            <td className="py-2 px-1 text-center font-black text-blue-600">{s.aadhaarCount || 0}</td>
                            <td className="py-2 px-1 text-center font-black text-indigo-600">{s.apaarCount || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </section>

               <section>
                  <h3 className="text-xl font-black text-slate-800 mb-6 border-b pb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    FLN રીપોર્ટ (નવીનતમ)
                  </h3>
                  <div className="bg-slate-50 rounded-3xl p-4 overflow-x-auto border border-slate-100">
                    <table className="w-full text-left text-xs">
                       <thead>
                         <tr className="border-b">
                           <th className="py-2 px-1 font-black">ધોરણ</th>
                           <th className="py-2 px-1 font-black text-center">કુલ</th>
                           <th className="py-2 px-1 font-black text-center text-red-600">કચાશ</th>
                         </tr>
                       </thead>
                       <tbody>
                         {fln.length > 0 ? fln[0].records.map(r => (
                           <tr key={r.standard} className="border-b border-slate-200/50">
                             <td className="py-2 px-1 font-bold">{r.standard}</td>
                             <td className="py-2 px-1 text-center font-black">{r.totalStudents || 0}</td>
                             <td className="py-2 px-1 text-center font-black text-red-600">{r.weakStudents || 0}</td>
                           </tr>
                         )) : (
                           <tr><td colSpan={3} className="py-4 text-center italic text-slate-400">ડેટા ઉપલબ્ધ નથી</td></tr>
                         )}
                       </tbody>
                    </table>
                  </div>
               </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-emerald-900 tracking-tight">ક્લસ્ટર શાળાઓ</h2>
        <div className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-2xl text-sm font-black shadow-lg shadow-emerald-50">
          કુલ: {schools.length} શાળાઓ
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map(school => (
          <div 
            key={school.id} 
            className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
            onClick={() => setSelectedSchool(school)}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7M4 21V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v17"/></svg>
              </div>
              <div className="flex-grow min-w-0">
                <h3 className="text-lg font-black text-slate-800 leading-tight truncate">{school.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">DISE: {school.diseCode}</p>
              </div>
            </div>
            <div className="flex justify-between items-center text-xs font-bold text-slate-500">
               <span>આચાર્ય: {school.principal}</span>
               <span className="bg-slate-100 px-2 py-1 rounded-lg uppercase text-[10px]">{school.schoolType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolList;
