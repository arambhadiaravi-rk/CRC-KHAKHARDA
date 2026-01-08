
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { GeneratedImage } from '../types';

const ImageSection: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      let foundImage = '';
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          // Find the image part, do not assume it is the first part.
          if (part.inlineData) {
            const base64EncodeString: string = part.inlineData.data;
            foundImage = `data:image/png;base64,${base64EncodeString}`;
            break;
          }
        }
      }

      if (foundImage) {
        setImages(prev => [{ url: foundImage, prompt, timestamp: Date.now() }, ...prev]);
        setPrompt('');
      } else {
        alert("ચિત્ર બનાવી શકાયું નથી.");
      }
    } catch (error) {
      console.error(error);
      alert("ચિત્ર બનાવવામાં ભૂલ થઈ.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col h-full gap-6">
      <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
        <h2 className="text-lg font-bold mb-2 text-indigo-900">AI ચિત્ર બનાવો (Create AI Image)</h2>
        <p className="text-sm text-indigo-700 mb-4">તમે કેવું ચિત્ર જોવા માંગો છો તે લખો. (તમે અંગ્રેજીમાં વધુ સારા પરિણામો મેળવી શકો છો)</p>
        
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ઉદાહરણ: A futuristic kite flying in Ahmedabad sky..."
            className="flex-grow bg-white border border-indigo-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
          />
          <button
            onClick={generateImage}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
          >
            {isLoading ? 'બની રહ્યું છે...' : 'બનાવો'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-y-auto">
        {images.map((img, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 group transition-all hover:shadow-xl">
            <img src={img.url} alt={img.prompt} className="w-full aspect-square object-cover" />
            <div className="p-4">
              <p className="text-sm text-slate-600 line-clamp-2 italic font-medium">"{img.prompt}"</p>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = img.url;
                  link.download = `ai-image-${img.timestamp}.png`;
                  link.click();
                }}
                className="mt-3 text-xs text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                ડાઉનલોડ કરો
              </button>
            </div>
          </div>
        ))}
        {!images.length && !isLoading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-20 h-20 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <p className="text-lg font-medium">તમારું પ્રથમ ચિત્ર બનાવવા માટે ઉપર ટાઇપ કરો!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageSection;
