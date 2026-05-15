import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, XCircle, ChevronRight, RotateCcw, 
  Trophy, HelpCircle, Sparkles, Brain, Timer,
  Info, AlertCircle, Quote, Star
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // 0-based index
  context: string;
}

const QUIZ_DATA: Question[] = [
  {
    id: 1,
    question: "대한민국에서 가장 높은 산은 무엇입니까?",
    options: ["설악산", "지리산", "한라산", "백두산"],
    correctAnswer: 2,
    context: "한라산은 제주도에 위치하며 높이는 1,947m입니다."
  },
  {
    id: 2,
    question: "태양계에서 가장 큰 행성은 무엇입니까?",
    options: ["지구", "화성", "목성", "토성"],
    correctAnswer: 2,
    context: "목성은 가스 행성으로 지름이 지구의 약 11배에 달합니다."
  },
  {
    id: 3,
    question: "인간의 몸에서 가장 큰 장기는 무엇입니까?",
    options: ["간", "심장", "폐", "피부"],
    correctAnswer: 3,
    context: "피부는 성인 기준 면적이 약 1.6~2.0㎡에 달하는 가장 큰 인체 조직입니다."
  },
  {
    id: 4,
    question: "세계에서 가장 긴 강은 무엇입니까?",
    options: ["미시시피 강", "아마존 강", "나일 강", "양쯔 강"],
    correctAnswer: 2,
    context: "나일 강은 약 6,650km로 세계에서 가장 긴 강으로 알려져 있습니다."
  },
  {
    id: 5,
    question: "원소 기호 'Au'는 어떤 금속을 나타냅니까?",
    options: ["은", "구리", "철", "금"],
    correctAnswer: 3,
    context: "라틴어의 Aurum에서 유래한 기호로 '빛나는 새벽'이라는 뜻을 가집니다."
  }
];

export default function AdminQuizApp() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = QUIZ_DATA[currentIndex];

  const handleOptionSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < QUIZ_DATA.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowResult(false);
    setIsAnswered(false);
  };

  const progress = ((currentIndex + 1) / QUIZ_DATA.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6 md:px-0 min-h-screen flex flex-col items-center justify-center"
    >
      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="quiz-body"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full space-y-12 flex flex-col items-center"
          >
            {/* Header & Progress */}
            <div className="w-full flex flex-col gap-8 items-center border-b border-white/5 pb-10">
              <div className="space-y-4 text-center">
                <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">퀴즈 스테이지</h2>
                <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">뉴럴 지식 테스트 v2.1</p>
              </div>

              <div className="w-full max-w-md space-y-3">
                <div className="flex justify-between items-end px-2">
                   <div className="flex items-center gap-2">
                      <Brain size={16} className="text-lime" />
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Intelligence Check</span>
                   </div>
                   <span className="text-[10px] font-black text-lime uppercase tracking-widest tabular-nums italic">
                     {currentIndex + 1} / {QUIZ_DATA.length}
                   </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                   <motion.div 
                     className="h-full bg-lime rounded-full shadow-[0_0_15px_rgba(163,230,53,0.5)]"
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                   />
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-2xl glass rounded-[48px] border border-white/10 p-8 sm:p-12 relative overflow-hidden flex flex-col items-center text-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 blur-[80px] -translate-x-10 -translate-y-10" />
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime/2 blur-[80px] translate-x-10 translate-y-10" />

               <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-lime/40 mb-6 border border-white/10">
                 <HelpCircle size={24} />
               </div>

               <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tight serif leading-tight mb-12 relative z-10">
                 "{currentQuestion.question}"
               </h3>

               {/* Options Grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full relative z-10">
                 {currentQuestion.options.map((option, idx) => {
                   const isSelected = selectedOption === idx;
                   const isCorrect = idx === currentQuestion.correctAnswer;
                   const showCorrect = isAnswered && isCorrect;
                   const showWrong = isAnswered && isSelected && !isCorrect;

                   return (
                     <button
                       key={idx}
                       disabled={isAnswered}
                       onClick={() => handleOptionSelect(idx)}
                       className={cn(
                         "p-6 rounded-3xl border text-sm font-bold transition-all duration-300 flex items-center justify-between group",
                         !isAnswered && "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 active:scale-95 text-white/60 hover:text-white",
                         showCorrect && "bg-green-500/20 border-green-500 text-green-400 shadow-lg shadow-green-500/10",
                         showWrong && "bg-red-500/20 border-red-500 text-red-400 shadow-lg shadow-red-500/10",
                         isAnswered && !isCorrect && !isSelected && "opacity-30 grayscale"
                       )}
                     >
                       <span className="truncate pr-4">{option}</span>
                       <div className="shrink-0">
                         {showCorrect && <CheckCircle2 size={18} className="animate-pulse" />}
                         {showWrong && <XCircle size={18} />}
                         {!isAnswered && (
                           <div className="w-5 h-5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-black text-white/20 group-hover:bg-lime/20 group-hover:border-lime/40 group-hover:text-lime transition-all">
                             {String.fromCharCode(65 + idx)}
                           </div>
                         )}
                       </div>
                     </button>
                   );
                 })}
               </div>

               {/* Hint/Context After Answer */}
               <AnimatePresence>
                 {isAnswered && (
                   <motion.div
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="mt-8 w-full p-4 bg-white/5 rounded-3xl border border-white/5 flex items-start gap-4 text-left"
                   >
                     <div className="p-2 bg-lime/10 rounded-xl text-lime shrink-0">
                        <Info size={14} />
                     </div>
                     <p className="text-[10px] font-bold text-white/40 italic leading-relaxed uppercase tracking-wider">
                       {currentQuestion.context}
                     </p>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>

            {/* Next Button */}
            <div className="pt-4 w-full flex justify-center">
              <button
                disabled={!isAnswered}
                onClick={handleNext}
                className={cn(
                  "px-12 py-5 rounded-[32px] text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 transition-all active:scale-95 shadow-2xl",
                  isAnswered 
                    ? "bg-lime text-forest shadow-lime/20 hover:scale-105" 
                    : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
                )}
              >
                {currentIndex === QUIZ_DATA.length - 1 ? "결과 보기" : "다음 문제"}
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="result-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass rounded-[64px] border border-white/10 p-12 sm:p-16 flex flex-col items-center text-center space-y-10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-lime/5 blur-[120px]" />
            
            <div className="relative">
              <div className="absolute inset-0 bg-lime/20 blur-[40px] rounded-full scale-150 animate-pulse" />
              <div className="w-24 h-24 bg-lime text-forest rounded-[32px] flex items-center justify-center shadow-2xl shadow-lime/20 relative z-10 group rotate-3">
                <Trophy size={48} />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h2 className="text-3xl sm:text-5xl font-black text-white italic serif tracking-tighter uppercase">퀴즈 완료!</h2>
              <p className="text-xs font-bold text-white/20 uppercase tracking-[0.5em] italic">인지 상태 보고서</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full relative z-10">
               <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 hover:border-lime/30 transition-all group">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">총 점수</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-white italic tabular-nums">{score}</span>
                    <span className="text-lg font-bold text-white/20 italic tabular-nums">/ {QUIZ_DATA.length}</span>
                  </div>
               </div>
               <div className="p-8 bg-white/5 rounded-[40px] border border-white/5 hover:border-lime/30 transition-all group">
                  <span className="text-[10px] font-black text-white/20 uppercase tracking-widest block mb-1">정답률</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-black text-lime italic tabular-nums">{Math.round((score / QUIZ_DATA.length) * 100)}%</span>
                  </div>
               </div>
            </div>

            <div className="w-full space-y-4 relative z-10">
              <button
                onClick={restartQuiz}
                className="w-full py-6 bg-lime text-forest font-black rounded-3xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
              >
                <RotateCcw size={18} />
                재도전 하기
              </button>
            </div>

            <div className="pt-4 flex items-center justify-center gap-4 opacity-30 relative z-10">
               <div className="h-[1px] w-8 bg-current" />
               <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Wisdom Protocol 3.0</p>
               <div className="h-[1px] w-8 bg-current" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistence/Meta Footer */}
      {!showResult && (
        <div className="mt-20 flex flex-col items-center gap-4 opacity-20 pointer-events-none sticky bottom-10">
           <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                 <Timer size={12} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Clock Sync Active</span>
              </div>
              <div className="flex items-center gap-2">
                 <Sparkles size={12} />
                 <span className="text-[9px] font-black uppercase tracking-widest">Real-time Feedback</span>
              </div>
           </div>
        </div>
      )}
    </motion.div>
  );
}
