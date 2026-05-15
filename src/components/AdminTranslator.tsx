import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Languages, 
  ArrowRightLeft, 
  RefreshCw, 
  Copy, 
  Check, 
  Zap, 
  CheckCircle2,
  Globe,
  Loader2,
  Trash2,
  Type
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Language {
  code: string;
  name: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ko', name: '한국어 (Korean)' },
  { code: 'en', name: '영어 (English)' },
  { code: 'ja', name: '일본어 (Japanese)' },
  { code: 'zh', name: '중국어 (Chinese)' },
  { code: 'fr', name: '프랑스어 (French)' },
  { code: 'de', name: '독일어 (German)' },
  { code: 'es', name: '스페인어 (Spanish)' },
  { code: 'it', name: '이탈리아어 (Italian)' },
  { code: 'ru', name: '러시아어 (Russian)' },
  { code: 'pt', name: '포르투갈어 (Portuguese)' },
  { code: 'vi', name: '베트남어 (Vietnamese)' },
  { code: 'th', name: '태국어 (Thai)' },
];

export default function AdminTranslator() {
  const [languages] = useState<Language[]>(SUPPORTED_LANGUAGES);
  const [sourceText, setSourceText] = useState('');
  const [targetText, setTargetText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('ko');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) {
      setTargetText('');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const srcLangName = SUPPORTED_LANGUAGES.find(l => l.code === sourceLang)?.name || sourceLang;
      const targetLangName = SUPPORTED_LANGUAGES.find(l => l.code === targetLang)?.name || targetLang;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Translate the following text from ${srcLangName} to ${targetLangName}. 
        Keep the tone natural. Only provide the translated text without any explanations or extra characters.
        
        Text to translate:
        ${text}`,
      });

      const translated = response.text?.trim() || '';
      setTargetText(translated);
    } catch (err) {
      console.error('Translation error:', err);
      setError('번역 서비스 연결에 실패했습니다. Gemini API 설정을 확인해주세요.');
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLang, targetLang]);

  // Auto-translate with 0.6s debounce
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (sourceText.trim()) {
      timerRef.current = setTimeout(() => {
        handleTranslate(sourceText);
      }, 600);
    } else {
      setTargetText('');
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [sourceText, handleTranslate]);

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setSourceText(targetText);
    setTargetText(sourceText);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(targetText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">AI 언어 번역기</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Linguistic Intelligence v2.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Globe size={16} className="text-blue-400" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">엔진: Gemini AI v3</span>
          </div>
        </div>
      </div>

      {/* Main Interface */ }
      <div className="space-y-8">
         {/* Language Selectors */}
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4 py-6 glass rounded-[40px] border border-white/10 bg-white/[0.02]">
            <div className="relative group w-full sm:w-64">
               <select
                 value={sourceLang}
                 onChange={(e) => setSourceLang(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white font-bold appearance-none focus:outline-none focus:border-blue-400/50 transition-all cursor-pointer"
               >
                  {languages.map(lang => (
                    <option key={`src-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <Languages size={14} />
               </div>
               <label className="absolute -top-3 left-6 px-2 bg-[#0a0a0a] text-[9px] font-black uppercase tracking-widest text-white/30">출발 어</label>
            </div>

            <button
              onClick={swapLanguages}
              className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-white/40 hover:text-white transition-all transform active:rotate-180 duration-500"
            >
               <ArrowRightLeft size={20} />
            </button>

            <div className="relative group w-full sm:w-64">
               <select
                 value={targetLang}
                 onChange={(e) => setTargetLang(e.target.value)}
                 className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 px-6 text-sm text-white font-bold appearance-none focus:outline-none focus:border-blue-400/50 transition-all cursor-pointer"
               >
                  {languages.map(lang => (
                    <option key={`target-${lang.code}`} value={lang.code}>{lang.name}</option>
                  ))}
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                  <Languages size={14} />
               </div>
               <label className="absolute -top-3 left-6 px-2 bg-[#0a0a0a] text-[9px] font-black uppercase tracking-widest text-white/30">도착 어</label>
            </div>
         </div>

         {/* Text Areas */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Source */}
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-[42px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative glass rounded-[40px] border border-white/10 bg-forest/20 overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Type size={16} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Source Input</span>
                     </div>
                     <button 
                       onClick={() => setSourceText('')}
                       className="p-2 hover:bg-white/5 rounded-lg text-white/10 hover:text-white transition-colors"
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
                  <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    placeholder="번역할 내용을 입력하세요..."
                    className="flex-1 w-full bg-transparent p-10 text-lg sm:text-2xl text-white font-medium focus:outline-none placeholder:text-white/5 resize-none leading-relaxed"
                  />
                  <div className="p-6 bg-black/20 flex items-center justify-between">
                     <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">{sourceText.length} Characters</span>
                     {!timerRef.current && sourceText && (
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                           <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">자동 번역 대기</span>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Target */}
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-lime/10 to-emerald-500/10 rounded-[42px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="relative glass rounded-[40px] border border-white/10 bg-black/40 overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Zap size={16} className="text-lime" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Generated Result</span>
                     </div>
                     {targetText && (
                       <button
                         onClick={copyToClipboard}
                         className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl transition-all"
                       >
                          {copied ? <Check size={14} className="text-lime" /> : <Copy size={14} className="text-white/20" />}
                          <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors", copied ? "text-lime" : "text-white/20")}>
                             {copied ? 'Copied' : 'Copy'}
                          </span>
                       </button>
                     )}
                  </div>
                  
                  <div className="flex-1 relative">
                     <AnimatePresence mode="wait">
                        {isTranslating ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                          >
                             <Loader2 size={40} className="text-white/20 animate-spin" />
                             <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">번역 데이터 처리 중...</p>
                          </motion.div>
                        ) : targetText ? (
                          <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-10 text-lg sm:text-2xl text-lime font-mono leading-relaxed"
                          >
                             {targetText}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-10 space-y-4"
                          >
                             <Languages size={40} className="text-white/5" />
                             <p className="text-[10px] font-bold text-white/5 uppercase tracking-[0.4em]">입력을 시작하면 실시간으로 번역됩니다</p>
                          </motion.div>
                        )}
                     </AnimatePresence>
                  </div>

                  <div className="p-6 bg-black/20 flex items-center justify-between">
                     <button
                       onClick={() => handleTranslate(sourceText)}
                       disabled={!sourceText || isTranslating}
                       className="flex items-center gap-2 px-6 py-2 bg-lime text-forest rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                     >
                        <RefreshCw size={12} className={isTranslating ? 'animate-spin' : ''} />
                        수동 번역 실행
                     </button>
                     {error && (
                        <span className="text-[9px] font-bold text-red-400 uppercase tracking-widest italic">{error}</span>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Languages size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Language Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">AI Translation v2.5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>번역 데이터 검증 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
