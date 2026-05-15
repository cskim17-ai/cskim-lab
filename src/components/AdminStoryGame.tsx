import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scroll, 
  ChevronRight, 
  RotateCcw, 
  Zap, 
  CheckCircle2,
  Sword,
  Shield,
  Compass,
  Map as MapIcon,
  Gamepad2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Scene {
  id: number;
  text: string;
  choices: {
    text: string;
    nextScene: number;
  }[];
  isEnding?: boolean;
  image?: string;
}

const STORY_DATA: Record<number, Scene> = {
  1: {
    id: 1,
    text: "당신은 어두운 숲 속에서 깨어났습니다. 사방은 고요하고 차가운 안개가 자욱합니다. 앞에는 북쪽으로 난 이끼 낀 길과 동쪽으로 난 우거진 숲길이 있습니다. 어느 길로 가시겠습니까?",
    choices: [
      { text: "이끼 낀 북쪽 길로 간다", nextScene: 2 },
      { text: "우거진 동쪽 숲길로 간다", nextScene: 3 }
    ]
  },
  2: {
    id: 2,
    text: "북쪽 길을 따라가니 오래된 돌탑이 나타났습니다. 돌탑 꼭대기에서 이상한 빛이 나고 있습니다. 가까이 가서 조사해 볼까요, 아니면 무시하고 길을 계속 갈까요?",
    choices: [
      { text: "돌탑을 조사한다", nextScene: 4 },
      { text: "길을 계속 간다", nextScene: 5 }
    ]
  },
  3: {
    id: 3,
    text: "동쪽 숲길은 점점 험해집니다. 갑자기 거대한 늑대 한 마리가 나타나 길을 막아섭니다! 늑대의 눈은 붉게 빛나고 있습니다.",
    choices: [
      { text: "싸울 준비를 한다", nextScene: 6 },
      { text: "조심스럽게 도망친다", nextScene: 7 }
    ]
  },
  4: {
    id: 4,
    text: "돌탑 꼭대기에는 신비로운 푸른 보석이 박혀 있었습니다. 당신이 손을 대자 강력한 에너지가 온몸을 감쌉니다! 당신은 숲의 수호자로 선택되었습니다.",
    choices: [
      { text: "마법의 힘을 받아들인다", nextScene: 8 }
    ],
    isEnding: true
  },
  5: {
    id: 5,
    text: "무시하고 계속 걸었지만, 길은 끝없이 반복됩니다. 결국 당신은 숲 속에서 길을 잃고 영원히 헤매게 되었습니다.",
    choices: [
      { text: "포기한다", nextScene: 9 }
    ],
    isEnding: true
  },
  6: {
    id: 6,
    text: "당신은 용감하게 늑대와 맞서 싸웠습니다! 치열한 전투 끝에 당신은 늑대를 물리치고, 늑대가 지키고 있던 황금 상자를 발견했습니다.",
    choices: [
      { text: "보물을 차지한다", nextScene: 10 }
    ],
    isEnding: true
  },
  7: {
    id: 7,
    text: "당신은 도망치려 했지만 늑대는 너무나 빨랐습니다. 숲의 어둠 속으로 끌려간 당신의 운명은 아무도 알 수 없게 되었습니다.",
    choices: [
      { text: "절망한다", nextScene: 11 }
    ],
    isEnding: true
  },
  8: { id: 8, text: "[엔딩: 숲의 현자] 당신은 이제 숲을 지키는 강력한 마법사가 되었습니다. 평화가 찾아왔습니다.", choices: [], isEnding: true },
  9: { id: 9, text: "[엔딩: 미아] 당신의 이야기는 여기서 끝이 났습니다. 숲은 비밀을 간직한 채 침묵합니다.", choices: [], isEnding: true },
  10: { id: 10, text: "[엔딩: 전설의 용사] 황금 상자 안에는 전설의 갑옷이 들어있었습니다. 당신은 위대한 모험가가 되었습니다.", choices: [], isEnding: true },
  11: { id: 11, text: "[엔딩: 어두운 그림자] 당신은 숲의 일부가 되었습니다. 다른 여행자들을 위협하는 그림자로 살아가게 됩니다.", choices: [], isEnding: true }
};

export default function AdminStoryGame() {
  const [currentSceneId, setCurrentSceneId] = useState(1);
  const currentScene = STORY_DATA[currentSceneId];

  const handleChoice = useCallback((nextId: number) => {
    setCurrentSceneId(nextId);
  }, []);

  const resetGame = useCallback(() => {
    setCurrentSceneId(1);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col items-center space-y-4 text-center">
        <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">인터랙티브 스토리</h2>
        <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black">Adventure Protocol v1.0</p>
      </div>

      <div className="glass p-6 sm:p-10 rounded-[40px] border border-white/10 space-y-10 relative overflow-hidden flex flex-col items-center min-h-[500px] justify-center text-center">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-lime/5 blur-[100px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-400/5 blur-[100px] translate-x-1/2 translate-y-1/2" />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneId}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl flex flex-col items-center space-y-12 relative z-10"
          >
            {/* Story Box (Parchment Feel) */}
            <div className="w-full bg-[#f4e4bc] text-[#5d4037] p-8 sm:p-12 rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.5),inset_0_0_100px_rgba(139,69,19,0.1)] border border-[#d7c49e] relative">
              {/* Corner Ornaments */}
              <div className="absolute top-4 left-4 border-t-2 border-l-2 border-[#8b4513]/20 w-8 h-8 rounded-tl-lg" />
              <div className="absolute top-4 right-4 border-t-2 border-r-2 border-[#8b4513]/20 w-8 h-8 rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 border-b-2 border-l-2 border-[#8b4513]/20 w-8 h-8 rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 border-b-2 border-r-2 border-[#8b4513]/20 w-8 h-8 rounded-br-lg" />

              <div className="flex justify-center mb-6">
                <Scroll size={32} className="text-[#8b4513]/40" />
              </div>

              <p id="story-text" className="text-xl sm:text-2xl font-serif leading-relaxed italic text-center">
                {currentScene.text}
              </p>
            </div>

            {/* Choices */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!currentScene.isEnding && currentScene.choices.length > 0 ? (
                currentScene.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleChoice(choice.nextScene)}
                    className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-lime hover:border-lime hover:text-forest overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-lime opacity-0 group-hover:opacity-10 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-sm font-black uppercase tracking-widest text-left pr-4">
                        {index === 0 ? "선택 1: " : "선택 2: "}{choice.text}
                      </span>
                      <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 flex flex-col items-center space-y-6">
                  {currentScene.choices.length > 0 && currentScene.choices.map((choice, index) => (
                     <motion.button
                        key={index}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleChoice(choice.nextScene)}
                        className="w-full max-w-sm group relative p-6 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-lime hover:border-lime hover:text-forest overflow-hidden"
                      >
                         <div className="flex items-center justify-center gap-2 relative z-10">
                           <span className="text-sm font-black uppercase tracking-widest">{choice.text}</span>
                           <ChevronRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" />
                         </div>
                      </motion.button>
                  ))}
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetGame}
                    className="group flex items-center gap-3 px-10 py-5 bg-white text-forest font-black rounded-full hover:bg-lime transition-all shadow-xl shadow-white/5"
                  >
                    <RotateCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span className="uppercase tracking-[0.2em] text-sm">다시 하기</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Gamepad2 size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Interactive Fiction</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Story Engine v1.0.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 연산</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>로컬 상태 저장</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
