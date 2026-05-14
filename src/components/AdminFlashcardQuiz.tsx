import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Brain, RotateCcw, SkipForward, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Flashcard {
  id: number;
  question: string;
  answer: string;
}

const INITIAL_CARDS: Flashcard[] = [
  { id: 1, question: "고구려의 전성기를 이끈 왕으로 영토를 크게 확장한 인물은?", answer: "광개토대왕 (또는 장수왕)" },
  { id: 2, question: "1592년 임진왜란 당시 한산도 대첩을 승리로 이끈 장군은?", answer: "이순신 장군" },
  { id: 3, question: "세종대왕이 창제한 우리나라의 고유 글자는?", answer: "훈민정음 (한글)" },
  { id: 4, question: "고려 시대에 만들어진 유네스코 세계기록유산인 불교 경판은?", answer: "팔만대장경" },
  { id: 5, question: "신라의 수도로, 불국사와 석굴암이 위치한 도시는?", answer: "경주 (금성)" },
  { id: 6, question: "1919년 일제 강점기에 일어난 최대 규모의 독립운동은?", answer: "3·1 운동" },
  { id: 7, question: "조선 시대 왕실의 중요한 행사를 그림과 글로 기록한 책은?", answer: "조선왕조의궤" },
];

export default function AdminFlashcardQuiz() {
  const [cards, setCards] = useState<Flashcard[]>(INITIAL_CARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [memorizedCount, setMemorizedCount] = useState(0);

  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSkip = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to start if showing skipped cards
      setCurrentIndex(0);
    }
  };

  const handleMemorize = () => {
    const newCards = cards.filter((_, idx) => idx !== currentIndex);
    setMemorizedCount(prev => prev + 1);
    setIsFlipped(false);

    if (newCards.length === 0) {
      setIsCompleted(true);
    } else {
      setCards(newCards);
      // If we removed the last card, go back to 0
      if (currentIndex >= newCards.length) {
        setCurrentIndex(0);
      }
    }
  };

  const handleReset = () => {
    setCards(INITIAL_CARDS);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
    setMemorizedCount(0);
  };

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center space-y-8 py-20"
      >
        <div className="w-24 h-24 bg-lime/20 text-lime rounded-full flex items-center justify-center animate-bounce">
          <Trophy size={48} />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black italic serif">축하합니다!</h2>
          <p className="text-white/60">모든 카드를 암기하셨습니다.</p>
          <p className="text-sm text-lime font-bold">총 {INITIAL_CARDS.length}개 학습 완료</p>
        </div>
        <button
          onClick={handleReset}
          className="bg-lime text-forest px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all active:scale-95"
        >
          <RotateCcw size={20} />
          다시 시작하기
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-8 py-4 sm:py-10"
    >
      {/* Header & Progress */}
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-3 text-lime">
          <Brain className="animate-pulse" />
          <h2 className="text-2xl font-black italic serif underline decoration-lime/50 underline-offset-8">플래시 카드 퀴즈</h2>
        </div>
        
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/10">
          <motion.div 
            className="h-full bg-lime" 
            animate={{ width: `${(memorizedCount / INITIAL_CARDS.length) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between w-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/40">
          <span>진행 상황: {memorizedCount} / {INITIAL_CARDS.length}</span>
          <span>남은 카드: {cards.length}</span>
        </div>
      </div>

      {/* Card Arena */}
      <div className="relative perspective-1000 h-80 sm:h-[450px] md:h-[500px] w-full group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id + (isFlipped ? '-back' : '-front')}
            initial={{ rotateY: isFlipped ? -180 : 180, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 180 : -180, opacity: 0 }}
            onClick={handleFlip}
            className={cn(
              "w-full h-full cursor-pointer preserve-3d rounded-[40px] border-2 transition-all p-8 flex flex-col items-center justify-center text-center",
              isFlipped 
                ? "bg-white border-lime text-forest shadow-[0_20px_50px_rgba(163,230,53,0.2)]" 
                : "glass border-white/10 text-white hover:border-lime/50"
            )}
          >
            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-30">
               <BookOpen size={14} />
               <span className="text-[10px] font-black uppercase tracking-tighter">
                 {isFlipped ? 'ANSWER' : 'QUESTION'}
               </span>
            </div>

            <p className={cn(
              "text-xl sm:text-2xl font-bold leading-relaxed serif",
              isFlipped ? "italic" : ""
            )}>
              {isFlipped ? currentCard.answer : currentCard.question}
            </p>

            <p className="absolute bottom-6 text-[10px] font-bold opacity-30 animate-bounce">
              {isFlipped ? '질문으로 돌아가려면 탭하세요' : '답을 확인하려면 탭하세요'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSkip}
          className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          <SkipForward size={18} className="group-hover:translate-x-1 transition-transform" />
          건너뛰기
        </button>
        <button
          onClick={handleMemorize}
          className="flex-[1.5] bg-lime text-forest py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-[#b0f533] active:scale-95 shadow-[0_10px_30px_rgba(163,230,53,0.2)]"
        >
          <CheckCircle2 size={18} />
          암기함
        </button>
      </div>

      <div className="pt-4 flex items-center justify-center gap-2 text-white/20">
        <div className="h-[1px] w-8 bg-current" />
        <p className="text-[10px] font-bold uppercase tracking-widest italic">Vibe Coding - Flashcard Module</p>
        <div className="h-[1px] w-8 bg-current" />
      </div>
    </motion.div>
  );
}
