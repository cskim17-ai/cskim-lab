import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Heart, 
  Quote, 
  Trash2, 
  Zap, 
  CheckCircle2,
  Calendar,
  Flower2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_AFFIRMATIONS = [
  "나는 매일 성장하고 있으며, 나 자신을 사랑합니다.",
  "오늘도 내가 할 수 있는 최선을 다하며 긍정적인 하루를 보냅니다.",
  "나는 내 삶의 주인이며, 스스로 행복을 창조합니다.",
  "어떠한 어려움도 나는 유연하게 대처하고 해결해 나갈 수 있습니다.",
  "나에게는 무한한 잠재력과 창의성이 있습니다.",
  "나는 사랑받을 자격이 충분한 소중한 사람입니다.",
  "오늘 하루 내가 만나는 모든 인연은 나에게 소중한 선물입니다."
];

export default function AdminDailyAffirmation() {
  const [affirmations, setAffirmations] = useState<string[]>(() => {
    const saved = localStorage.getItem('vibe_affirmations');
    return saved ? JSON.parse(saved) : DEFAULT_AFFIRMATIONS;
  });
  
  const [currentAffirmation, setCurrentAffirmation] = useState('');
  const [inputVal, setInputVal] = useState('');
  const [fadeKey, setFadeKey] = useState(0);

  const pickRandom = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * affirmations.length);
    setCurrentAffirmation(affirmations[randomIndex]);
    setFadeKey(prev => prev + 1);
  }, [affirmations]);

  useEffect(() => {
    pickRandom();
  }, [pickRandom]);

  useEffect(() => {
    localStorage.setItem('vibe_affirmations', JSON.stringify(affirmations));
  }, [affirmations]);

  const handleAddAffirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    
    setAffirmations(prev => [inputVal.trim(), ...prev]);
    setInputVal('');
  };

  const deleteAffirmation = (index: number) => {
    if (affirmations.length <= 1) return;
    const updated = [...affirmations];
    updated.splice(index, 1);
    setAffirmations(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">오늘의 긍정문</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Mindset Protocol v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Calendar size={16} className="text-pink-300" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">{new Date().toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="relative group">
         {/* Background Glow */}
         <div className="absolute -inset-4 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-blue-400/20 rounded-[80px] blur-[80px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[60px] p-12 sm:p-24 flex flex-col items-center justify-center text-center space-y-12 overflow-hidden min-h-[500px]">
            <Quote size={40} className="text-white/10" />
            
            <AnimatePresence mode="wait">
               <motion.div
                 key={fadeKey}
                 initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                 animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                 exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
                 transition={{ duration: 1.5, ease: "circOut" }}
                 className="space-y-8"
               >
                  <h3 className="text-3xl sm:text-6xl font-black italic serif text-white tracking-tighter leading-tight max-w-3xl">
                     {currentAffirmation}
                  </h3>
               </motion.div>
            </AnimatePresence>

            <button
              onClick={pickRandom}
              className="flex items-center gap-3 px-10 py-5 bg-white text-forest rounded-[32px] font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/5"
            >
               <RotateCcw size={18} />
               다른 문장 보기
            </button>
            
            {/* Decrative elements */}
            <div className="absolute top-10 left-10 text-white/5 transform rotate-[-15deg]">
               <Flower2 size={120} strokeWidth={1} />
            </div>
            <div className="absolute bottom-10 right-10 text-white/5 transform rotate-15">
               <Sparkles size={80} strokeWidth={1} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
         {/* Add New */}
         <div className="lg:col-span-5 space-y-8">
            <div className="glass rounded-[40px] border border-white/10 p-10 space-y-8 bg-forest/20 shadow-2xl">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-pink-400/10 flex items-center justify-center text-pink-400">
                     <Plus size={20} />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">새 긍정문 추가</h3>
               </div>

               <form onSubmit={handleAddAffirmation} className="space-y-6">
                  <div className="space-y-4">
                     <textarea
                       value={inputVal}
                       onChange={(e) => setInputVal(e.target.value)}
                       placeholder="나를 위한 따뜻한 한마디를 적어보세요..."
                       rows={4}
                       className="w-full bg-forest/50 border border-white/10 rounded-[32px] py-6 px-8 text-sm text-white focus:outline-none focus:border-pink-300/50 transition-all placeholder:text-white/5 leading-relaxed font-medium"
                     />
                  </div>
                  <button
                    type="submit"
                    disabled={!inputVal.trim()}
                    className="w-full py-5 bg-pink-400 text-forest font-black rounded-2xl hover:bg-pink-300 active:scale-95 transition-all shadow-xl shadow-pink-400/10 flex items-center justify-center gap-3 group disabled:opacity-20"
                  >
                    <Heart size={18} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                    저장하기
                  </button>
               </form>
            </div>
         </div>

         {/* Library */}
         <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Affirmation Library</h3>
               <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest font-mono">
                  {affirmations.length} Sentences
               </span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
               <AnimatePresence mode="popLayout">
                  {affirmations.map((text, idx) => (
                     <motion.div
                       key={`${text}-${idx}`}
                       layout
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="group p-6 rounded-[32px] bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between gap-4"
                     >
                        <p className="text-sm font-bold text-white/80 italic leading-snug flex-1">
                           "{text}"
                        </p>
                        <button
                          onClick={() => deleteAffirmation(idx)}
                          className={cn(
                            "p-3 rounded-xl bg-red-500/0 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all group-hover:opacity-100",
                            affirmations.length > 1 ? "opacity-0" : "pointer-events-none opacity-0"
                          )}
                        >
                           <Trash2 size={16} />
                        </button>
                     </motion.div>
                  ))}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Sparkles size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Mindset Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Positive Thinking v1.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>동기부여 최적화 완료</span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </motion.div>
  );
}
