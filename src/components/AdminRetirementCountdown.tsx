import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  Calendar, 
  User, 
  Zap, 
  CheckCircle2, 
  History, 
  Gift, 
  Clock, 
  ChevronRight,
  TrendingDown,
  Sparkles,
  PartyPopper
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CountdownResult {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  isPast: boolean;
}

export default function AdminRetirementCountdown() {
  const [birthDate, setBirthDate] = useState<string>('');
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [isStarted, setIsStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<CountdownResult | null>(null);

  const calculateTimeLeft = useCallback(() => {
    if (!birthDate) return null;

    const birth = new Date(birthDate);
    const retirement = new Date(birth);
    retirement.setFullYear(birth.getFullYear() + retirementAge);

    const now = new Date();
    const difference = retirement.getTime() - now.getTime();

    if (difference <= 0) {
      return { years: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, isPast: true };
    }

    const totalSeconds = Math.floor(difference / 1000);
    const years = Math.floor(totalSeconds / (365 * 24 * 3600));
    const totalDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    let remainingSeconds = totalSeconds % (365 * 24 * 3600);
    const days = Math.floor(remainingSeconds / (24 * 3600));
    
    remainingSeconds %= (24 * 3600);
    const hours = Math.floor(remainingSeconds / 3600);
    
    remainingSeconds %= 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    
    const seconds = remainingSeconds % 60;

    return { years, days, hours, minutes, seconds, totalDays, isPast: false };
  }, [birthDate, retirementAge]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isStarted && birthDate) {
      setTimeLeft(calculateTimeLeft());
      interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isStarted, birthDate, calculateTimeLeft]);

  const handleStart = () => {
    if (!birthDate) return;
    setIsStarted(true);
  };

  const specialMessage = useMemo(() => {
    if (!timeLeft) return null;
    const days = timeLeft.totalDays;
    if (days === 365) return "정확히 1년 전입니다! 마지막 1년을 즐겁게 계획해보세요. ✨";
    if (days === 100) return "드디어 100일 남았습니다! 은퇴 파티 준비를 시작할 시간입니다! 🥳";
    return null;
  }, [timeLeft]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">은퇴 카운트다운</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Freedom Timer v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Timer size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">실시간 시간 분석기 활성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Settings */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-10 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                    <User size={20} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">개인 설정</h3>
              </div>

              <div className="space-y-6">
                 {/* Birth Date */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">생년월일 (Birth Date)</label>
                    <div className="relative group">
                       <input
                         type="date"
                         value={birthDate}
                         onChange={(e) => setBirthDate(e.target.value)}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold cursor-pointer"
                       />
                       <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={16} />
                    </div>
                 </div>

                 {/* Retirement Age */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">은퇴 연령 (Retirement Age)</label>
                    <div className="relative group">
                       <input
                         type="number"
                         min="1"
                         max="120"
                         value={retirementAge}
                         onChange={(e) => setRetirementAge(parseInt(e.target.value) || 0)}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold"
                       />
                       <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={16} />
                    </div>
                 </div>

                 <button
                   onClick={handleStart}
                   disabled={!birthDate}
                   className="w-full py-5 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20 mt-4"
                 >
                   <Zap size={18} className="group-hover:rotate-12 transition-transform" />
                   <span className="uppercase tracking-widest text-sm">시스템 가동 시작</span>
                 </button>
              </div>
           </div>

           {/* Info Cards */}
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center gap-2">
                 <Sparkles size={16} className="text-lime" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">희망의 메시지</span>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed italic">
                "은퇴는 끝이 아니라, 새로운 자유의 시작입니다. 당신의 미래는 지금보다 더 찬란할 것입니다."
              </p>
           </div>
        </div>

        {/* Right: Countdown Area */}
        <div className="lg:col-span-8 flex flex-col items-center justify-center min-h-[500px]">
           <AnimatePresence mode="wait">
              {isStarted && timeLeft ? (
                 <motion.div
                   key="timer"
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="w-full space-y-12"
                 >
                    {/* Main Counter Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6">
                       {[
                         { label: 'YEARS', value: timeLeft.years, color: 'text-white' },
                         { label: 'DAYS', value: timeLeft.days, color: 'text-white' },
                         { label: 'HOURS', value: timeLeft.hours, color: 'text-lime' },
                         { label: 'MINUTES', value: timeLeft.minutes, color: 'text-lime' },
                         { label: 'SECONDS', value: timeLeft.seconds, color: 'text-lime' },
                       ].map((item, idx) => (
                          <div key={item.label} className="glass rounded-[32px] border border-white/10 bg-black/40 p-6 sm:p-8 flex flex-col items-center justify-center space-y-2 relative group overflow-hidden">
                             <div className="absolute -top-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                                <Timer size={80} strokeWidth={1} />
                             </div>
                             <span className={cn("text-4xl sm:text-5xl font-black italic serif tracking-tighter leading-none mb-1", item.color)}>
                                {String(item.value).padStart(2, '0')}
                             </span>
                             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{item.label}</span>
                          </div>
                       ))}
                    </div>

                    {/* Total Days & Progress */}
                    <div className="glass rounded-[40px] border border-white/10 bg-forest/20 p-10 space-y-8 relative overflow-hidden group">
                       <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 rounded-[24px] bg-white/5 flex items-center justify-center text-white/40 shadow-inner">
                                <TrendingDown size={32} strokeWidth={1} />
                             </div>
                             <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">총 대기일</p>
                                <h4 className="text-4xl font-black italic serif text-white tracking-tighter">
                                   D-{timeLeft.totalDays.toLocaleString()}
                                </h4>
                             </div>
                          </div>
                          
                          <div className="text-right">
                             <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">상태 (Status)</p>
                             <div className="flex items-center gap-2 px-6 py-2 bg-lime/10 rounded-full border border-lime/20">
                                <Zap size={10} className="text-lime animate-pulse" />
                                <span className="text-[10px] font-black text-lime uppercase tracking-widest">자동 추적 중</span>
                             </div>
                          </div>
                       </div>

                       {/* Progress Bar decoration */}
                       <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-lime to-emerald-500"
                            animate={{ width: ['0%', '100%'] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                          />
                       </div>

                       {/* Special Message */}
                       <AnimatePresence>
                          {specialMessage && (
                             <motion.div
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               className="flex items-center gap-4 p-6 bg-white/5 rounded-2xl border border-white/5"
                             >
                                <PartyPopper size={24} className="text-lime animate-bounce" />
                                <p className="text-sm font-black text-white/60 leading-relaxed italic">
                                   {specialMessage}
                                </p>
                             </motion.div>
                          )}
                       </AnimatePresence>
                    </div>
                 </motion.div>
              ) : (
                 <motion.div
                   key="idle"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex flex-col items-center justify-center text-center space-y-8"
                 >
                    <div className="w-32 h-32 rounded-[50px] bg-white/[0.03] flex items-center justify-center text-white/10 group-hover:scale-110 transition-transform duration-700">
                       <Timer size={64} strokeWidth={1} />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-2xl font-black italic serif text-white/20 tracking-tight">COUNTDOWN ENGINE IDLE</h3>
                       <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] max-w-[300px] leading-relaxed">
                          생년월일과 은퇴 연령을 입력하여 자유를 향한 여정을 실시간으로 측정하세요
                       </p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <History size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Time Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Freedom Protocol v7.2.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>미래 좌표 동기화 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
