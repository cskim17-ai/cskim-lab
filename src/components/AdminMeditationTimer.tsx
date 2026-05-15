import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, Moon, Sun, 
  Volume2, Bell, Timer as TimerIcon, 
  Settings, Clock, Zap, Target, Sparkles,
  Cloud, Bird, Waves
} from 'lucide-react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Low-fi notification sound (Short Bell/Chime)
const playBell = () => {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
  oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 1); // A4

  gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + 1.5);
};

export default function AdminMeditationTimer() {
  const [minutes, setMinutes] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(10 * 60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load last setting from Firebase
  useEffect(() => {
    const loadSettings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const docRef = doc(db, 'meditation_settings', user.uid || 'anonymous');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const lastMin = docSnap.data().lastMinutes;
          setMinutes(lastMin);
          setTimeLeft(lastMin * 60);
          setTotalSeconds(lastMin * 60);
        }
      } catch (err) {
        console.warn('Failed to load meditation settings:', err);
      }
    };
    loadSettings();
  }, []);

  // Save to Firebase
  const saveSettings = async (mins: number) => {
    const user = auth.currentUser;
    const userId = user?.uid || 'anonymous';
    try {
      await setDoc(doc(db, 'meditation_settings', userId), {
        userId,
        lastMinutes: mins,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to save meditation settings:', err);
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      resetTimer();
      setIsActive(true);
      return;
    }

    if (!isActive) {
      // Starting: save setting
      saveSettings(minutes);
    }
    
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(minutes * 60);
    setTotalSeconds(minutes * 60);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playBell();
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) : 0;
  const strokeDasharray = 2 * Math.PI * 120; // radius is 120
  const strokeDashoffset = strokeDasharray * (1 - progress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "min-h-screen flex flex-col items-center justify-center transition-colors duration-1000 p-6 sm:p-10 rounded-[48px] overflow-hidden",
        isDarkMode ? "bg-forest-dark text-white" : "bg-white text-forest shadow-2xl"
      )}
    >
      {/* Zen Mode Toggle */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={cn(
          "absolute top-6 sm:top-8 right-6 sm:right-8 p-4 rounded-3xl transition-all active:scale-90 border z-50",
          isDarkMode ? "bg-white/5 border-white/10 text-lime" : "bg-forest/5 border-forest/10 text-forest"
        )}
      >
        {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      <div className="max-w-xl w-full space-y-10 sm:space-y-16 flex flex-col items-center py-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn(
               "text-[12px] font-black uppercase tracking-[0.5em] mb-2",
               isDarkMode ? "text-lime" : "text-forest/40"
            )}
          >
            마인드풀 세션 v1.4
          </motion.div>
          <h2 className={cn(
            "text-4xl sm:text-6xl font-black italic serif tracking-tighter",
            isDarkMode ? "text-white" : "text-forest"
          )}>
            명상 타이머
          </h2>
        </div>

        {/* Circular Timer Display */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
             {/* Background Circle */}
             <circle
               cx="50%"
               cy="50%"
               r="120"
               fill="transparent"
               stroke="currentColor"
               strokeWidth="8"
               className={cn(
                 "transition-colors duration-500",
                 isDarkMode ? "text-white/5" : "text-forest/5"
               )}
             />
             {/* Progress Circle */}
             <motion.circle
               cx="50%"
               cy="50%"
               r="120"
               fill="transparent"
               stroke="currentColor"
               strokeWidth="8"
               strokeLinecap="round"
               className={cn(
                 "transition-colors duration-500",
                 isDarkMode ? "text-lime" : "text-forest shadow-xl"
               )}
               style={{
                 strokeDasharray,
                 strokeDashoffset,
               }}
               transition={{ duration: 1, ease: 'linear' }}
             />
          </svg>

          <div className="relative z-10 flex flex-col items-center">
            <motion.span 
              key={timeLeft}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter italic"
            >
              {formatTime(timeLeft)}
            </motion.span>
            <div className={cn(
              "text-[10px] font-bold uppercase tracking-widest mt-2",
              isDarkMode ? "text-white/20" : "text-forest/20"
            )}>
              남은 시간
            </div>
          </div>

          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 z-0"
              >
                 <div className={cn(
                   "w-full h-full rounded-full border-4 animate-ping opacity-10",
                   isDarkMode ? "border-lime" : "border-forest"
                 )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="w-full space-y-8">
           {/* Minute Selection IF not active */}
           {!isActive && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="flex flex-col items-center gap-4"
             >
                <div className="flex items-center gap-4">
                  {[5, 10, 15, 20, 30].map(m => (
                    <button
                      key={m}
                      onClick={() => {
                        setMinutes(m);
                        setTimeLeft(m * 60);
                        setTotalSeconds(m * 60);
                      }}
                      className={cn(
                        "w-12 h-12 rounded-2xl text-[10px] font-black transition-all border",
                        minutes === m 
                          ? isDarkMode ? "bg-lime text-forest border-lime" : "bg-forest text-white border-forest"
                          : isDarkMode ? "bg-white/5 text-white/40 border-white/5" : "bg-forest/5 text-forest/40 border-forest/5"
                      )}
                    >
                      {m}m
                    </button>
                  ))}
                  <div className="relative group">
                    <input
                      type="number"
                      value={minutes}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setMinutes(val);
                        setTimeLeft(val * 60);
                        setTotalSeconds(val * 60);
                      }}
                      className={cn(
                        "w-20 h-12 bg-transparent border-b-2 text-center text-sm font-black focus:outline-none transition-colors",
                        isDarkMode ? "border-white/10 text-white focus:border-lime" : "border-forest/10 text-forest focus:border-forest"
                      )}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest opacity-20">Custom</div>
                  </div>
                </div>
             </motion.div>
           )}

           <div className="flex items-center justify-center gap-6">
              <button
                onClick={resetTimer}
                className={cn(
                  "p-6 rounded-3xl transition-all active:scale-90 border",
                  isDarkMode ? "bg-white/5 border-white/5 text-white/40 hover:text-white" : "bg-forest/5 border-forest/5 text-forest/40 hover:text-forest"
                )}
              >
                <RotateCcw size={28} />
              </button>

              <button
                onClick={toggleTimer}
                className={cn(
                  "px-12 py-6 rounded-[32px] text-lg font-black transition-all active:scale-95 shadow-2xl flex items-center gap-3",
                  isActive 
                    ? isDarkMode ? "bg-white/10 text-white border border-white/10" : "bg-forest/10 text-forest border border-forest/10"
                    : isDarkMode ? "bg-lime text-forest shadow-lime/20" : "bg-forest text-white shadow-forest/20"
                )}
              >
                {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                <span>{isActive ? '일시 정지' : '수련 시작'}</span>
              </button>
           </div>
        </div>

        {/* Ambient Sounds / Themes */}
        <div className="flex items-center gap-6 opacity-30 pt-8">
           <Waves size={20} className="hover:opacity-100 cursor-pointer transition-opacity" />
           <Bird size={20} className="hover:opacity-100 cursor-pointer transition-opacity" />
           <Cloud size={20} className="hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
      </div>

      <div className={cn(
        "mt-20 flex flex-col items-center gap-2 transition-opacity",
        isActive ? "opacity-0" : "opacity-100"
      )}>
        <p className={cn(
          "text-[9px] font-bold uppercase tracking-[0.3em] italic",
          isDarkMode ? "text-white/20" : "text-forest/20"
        )}>
          Deep Zen meditation Protocol
        </p>
        <div className={cn(
          "flex items-center gap-4 text-[9px] font-black uppercase tracking-widest",
          isDarkMode ? "text-white/10" : "text-forest/10"
        )}>
          <div className="flex items-center gap-1">
             <Bell size={10} />
             <span>알림 엔진 활성화</span>
          </div>
          <div className="flex items-center gap-1">
             <Zap size={10} />
             <span>클라우드 동기화 중</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
