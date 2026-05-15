import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, RotateCcw, 
  BrainCircuit, Trophy, Languages, Star, Info,
  Sparkles, History, HelpCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Flashcard {
  id: number;
  word: string;
  meaning: string;
  pronunciation?: string;
  example?: string;
}

const FLASHCARDS: Flashcard[] = [
  { id: 1, word: 'Serendipity', meaning: '우연한 행운', pronunciation: '/ˌserənˈdipədē/', example: 'Nature is full of serendipity.' },
  { id: 2, word: 'Ephemeral', meaning: '수명이 짧은, 덧없는', pronunciation: '/əˈfem(ə)rəl/', example: 'The beauty of sunset is ephemeral.' },
  { id: 3, word: 'Eloquence', meaning: '웅변, 능변', pronunciation: '/ˈeləkwəns/', example: 'She spoke with great eloquence.' },
  { id: 4, word: 'Luminous', meaning: '어둠 속에서 빛나는', pronunciation: '/ˈlo͞omənəs/', example: 'The watch has luminous hands.' },
  { id: 5, word: 'Mellifluous', meaning: '달콤한, 감미로운', pronunciation: '/məˈliflo͞oəs/', example: 'His voice was mellifluous.' },
  { id: 6, word: 'Resilient', meaning: '회복력 있는', pronunciation: '/rəˈzilyənt/', example: 'Communities are incredibly resilient.' },
  { id: 7, word: 'Ebullient', meaning: '패기 넘치는, 열광적인', pronunciation: '/iˈbo͝olyənt/', example: 'She sounded ebullient on the phone.' },
  { id: 8, word: 'Quintessential', meaning: '전형적인, 본질적인', pronunciation: '/ˌkwin(t)əˈsen(t)SHəl/', example: 'It was the quintessential summer day.' },
];

export default function AdminLanguageFlashcards() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<number[]>([]); // Track learned card IDs

  const currentCard = FLASHCARDS[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % FLASHCARDS.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + FLASHCARDS.length) % FLASHCARDS.length);
    }, 150);
  };

  const handleCorrect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!history.includes(currentCard.id)) {
      setScore(prev => prev + 100);
      setHistory(prev => [...prev, currentCard.id]);
    }
    handleNext();
  };

  const resetProgress = () => {
    setScore(0);
    setHistory([]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6 md:px-0 min-h-screen flex flex-col items-center"
    >
      {/* Header & Stats */}
      <div className="w-full flex flex-col md:flex-row gap-8 md:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">플래시 카드</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">언어 신경 학습 v2.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">누적 점수</span>
             <div className="flex items-center gap-2">
                <Trophy size={16} className="text-lime" />
                <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{score}</span>
             </div>
          </div>
          <button 
            onClick={resetProgress}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all active:scale-90"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Main Flashcard Container */}
      <div className="relative w-full max-w-sm sm:max-w-md perspective-1000 group py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="w-full aspect-[3/4] cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              className="relative w-full h-full preserve-3d"
            >
              {/* Front Side */}
              <div className="absolute inset-0 backface-hidden glass rounded-[48px] border border-white/10 p-12 flex flex-col items-center justify-center text-center space-y-8 bg-forest/40 shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-lime/5 blur-[80px] -translate-x-10 -translate-y-10" />
                
                <div className="w-16 h-16 bg-lime/10 rounded-3xl flex items-center justify-center text-lime mb-4">
                  <Languages size={32} />
                </div>

                <div className="space-y-4 relative z-10">
                  <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter serif italic">
                    {currentCard.word}
                  </h3>
                  {currentCard.pronunciation && (
                    <p className="text-xs font-bold text-white/20 uppercase tracking-widest font-mono">
                      {currentCard.pronunciation}
                    </p>
                  )}
                </div>

                <div className="pt-12 flex flex-col items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                    <Sparkles size={12} className="text-lime" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">클릭하여 뜻 확인하기</span>
                  </div>
                </div>
              </div>

              {/* Back Side */}
              <div className="absolute inset-0 backface-hidden glass rounded-[48px] border border-lime/30 p-12 flex flex-col items-center justify-center text-center space-y-8 bg-forest/40 shadow-2xl rotate-y-180 overflow-hidden">
                <div className="absolute inset-0 bg-lime/5" />
                
                <div className="w-16 h-16 bg-lime text-forest rounded-3xl flex items-center justify-center mb-4 shadow-xl shadow-lime/20">
                  <BrainCircuit size={32} />
                </div>

                <div className="space-y-6 relative z-10">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {currentCard.meaning}
                  </h3>
                  {currentCard.example && (
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <p className="text-sm italic text-white/60 leading-relaxed">
                        "{currentCard.example}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-lime uppercase tracking-widest">
                   <Star size={12} className="fill-current" />
                   지식 습득 완료
                </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls Area */}
      <div className="w-full max-w-md space-y-8">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft size={24} />
          </button>

          {!isFlipped ? (
            <button
              onClick={handleCorrect}
              className="flex-[2] py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] transition-all shadow-xl shadow-lime/10 active:scale-95 flex items-center justify-center gap-2 group"
            >
              <CheckCircle2 size={20} className="group-hover:scale-125 transition-transform" />
              <span>알고 있었어요 (+100)</span>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-[2] py-4 bg-white text-forest font-black rounded-2xl hover:bg-white/90 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
            >
              <ChevronRight size={20} />
              <span>다음 단어</span>
            </button>
          )}

          <button 
            onClick={handleNext}
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-95"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Progress & Meta */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Daily Progress</span>
            <span className="text-[10px] font-black text-lime uppercase tracking-widest">{currentIndex + 1} / {FLASHCARDS.length}</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-lime shadow-[0_0_15px_rgba(163,230,53,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / FLASHCARDS.length) * 100}%` }}
              transition={{ type: 'spring', bounce: 0, duration: 1 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-8 pt-4">
           <div className="flex items-center gap-2 text-[9px] font-black text-white/10 uppercase tracking-widest">
             <History size={12} />
             Learned: {history.length} Cards
           </div>
           <div className="flex items-center gap-2 text-[9px] font-black text-white/10 uppercase tracking-widest">
             <HelpCircle size={12} />
             Vibe Flash-Learning v1.0
           </div>
        </div>
      </div>
    </motion.div>
  );
}
