
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { DataRecord, School, ChatMessage } from '../types';

interface AIAdminProps {
  records: DataRecord[];
  schools: School[];
}

const AIAdmin: React.FC<AIAdminProps> = ({ records, schools }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'નમસ્તે CRC કો-ઓર્ડિનેટર સાહેબ! હું તમારો ડેટા આસિસ્ટન્ટ છું. તમે દાખલ કરેલા ડેટાના આધારે રિપોર્ટ તૈયાર કરવામાં કે અન્ય વહીવટી પ્રશ્નોમાં હું તમને મદદ કરી શકું છું. હું તમારી શું મદદ કરું?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct context from current records
      const context = `
        Current Cluster Data:
        Schools: ${JSON.stringify(schools)}
        Recent Records: ${JSON.stringify(records.slice(0, 20))}
        Role: You are an AI assistant for a CRC (Cluster Resource Centre) Coordinator in Gujarat. 
        Language: Respond in Gujarati. 
        Task: Analyze the provided school data and answer queries. Be helpful and professional.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: {
          systemInstruction: context,
        },
      });

      const modelMessage: ChatMessage = {
        role: 'model',
        content: response.text || 'ક્ષમા કરશો, હું તમારી વિનંતી સમજી શક્યો નથી.',
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'કનેક્શનમાં ભૂલ થઈ છે. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      <div className="bg-emerald-900 text-white p-4 flex items-center gap-3">
        <div className="bg-emerald-700 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12l9 2.5"/><path d="M12 12l-2.5 9"/><path d="M12 12l-9-2.5"/><path d="M12 12l2.5-9"/></svg>
        </div>
        <div>
          <h2 className="font-bold">સ્માર્ટ એડમિન આસિસ્ટન્ટ</h2>
          <p className="text-[10px] text-emerald-300">ડેટા વિશ્લેષણ અને રિપોર્ટિંગ</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-700 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 rounded-tl-none text-slate-700'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="દા.ત. 'બધી શાળાઓનો હાજરી રિપોર્ટ આપો'..."
            className="flex-grow border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-5 py-3 font-bold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAdmin;
