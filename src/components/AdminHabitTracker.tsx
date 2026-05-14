import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, CheckCircle2, Circle, Flame, 
  Calendar, Info, AlertCircle, TrendingUp, X,
  ChevronRight, Trophy, Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Habit {
  id: string;
  name: string;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: number;
}

const getTodayStr = () => new Date().toISOString().split('T')[0];
const getYesterdayStr = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
};

export default function AdminHabitTracker() {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('vibe_habit_data');
    return saved ? JSON.parse(saved) : [];
  });
  const [newHabitName, setNewHabitName] = useState('');

  useEffect(() => {
    localStorage.setItem('vibe_habit_data', JSON.stringify(habits));
  }, [habits]);

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: Habit = {
      id: Date.now().toString(),
      name: newHabitName.trim(),
      completedDates: [],
      createdAt: Date.now()
    };

    setHabits([newHabit, ...habits]);
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabit = (id: string) => {
    const today = getTodayStr();
    setHabits(prev => prev.map(habit => {
      if (habit.id === id) {
        const isCompletedToday = habit.completedDates.includes(today);
        if (isCompletedToday) {
          return {
            ...habit,
            completedDates: habit.completedDates.filter(d => d !== today)
          };
        } else {
          return {
            ...habit,
            completedDates: [...habit.completedDates, today]
          };
        }
      }
      return habit;
    }));
  };

  // Calculate Streak
  const calculateStreak = (completedDates: string[]) => {
    if (completedDates.length === 0) return 0;

    const sortedDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
    const today = getTodayStr();
    const yesterday = getYesterdayStr();

    // If not completed today and not yesterday, streak is 0
    if (!sortedDates.includes(today) && !sortedDates.includes(yesterday)) {
      return 0;
    }

    let streak = 0;
    let checkDate = sortedDates.includes(today) ? new Date(today) : new Date(yesterday);

    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sortedDates.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  // Get last 7 days for mini calendar
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' })
      };
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 py-4 sm:py-10 px-4"
    >
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black italic serif text-white">습관 관리 도구</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Consistency Wins The Game</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
            <Trophy size={14} className="text-lime" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Habits: {habits.length}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-lime/10 rounded-2xl border border-lime/10 ring-1 ring-lime/20">
            <Flame size={14} className="text-lime animate-pulse" />
            <span className="text-[10px] font-black text-lime uppercase tracking-widest">Keep It Up!</span>
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      <div className="glass rounded-[32px] border border-white/10 p-6 flex flex-col sm:flex-row gap-4">
        <form onSubmit={addHabit} className="flex-1 flex gap-3">
          <div className="relative flex-1 group">
             <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="매일 수행할 새로운 습관을 입력하세요..."
              className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20 shadow-inner"
            />
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime transition-colors" size={18} />
          </div>
          <button
            type="submit"
            className="px-8 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 shrink-0 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            <span className="hidden sm:inline">습관 추가</span>
          </button>
        </form>
      </div>

      {/* Habit List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {habits.map((habit) => {
            const streak = calculateStreak(habit.completedDates);
            const isDoneToday = habit.completedDates.includes(getTodayStr());

            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={cn(
                  "glass rounded-[32px] border transition-all duration-500 overflow-hidden group",
                  isDoneToday ? "border-lime/30 bg-lime/5" : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                  {/* Left: Check & Name */}
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 relative overflow-hidden group/btn",
                        isDoneToday ? "bg-lime text-forest" : "bg-white/5 text-white/20 hover:bg-white/10"
                      )}
                    >
                      {isDoneToday ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                    </button>
                    
                    <div className="flex flex-col gap-1 min-w-0">
                      <h3 className={cn(
                        "text-lg font-black truncate transition-all leading-tight",
                        isDoneToday ? "text-lime italic" : "text-white/80"
                      )}>
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Flame size={12} className={cn(streak > 0 ? "text-orange-400" : "text-white/10")} />
                          <span className={cn("text-[10px] font-black uppercase tracking-widest tabular-nums", streak > 0 ? "text-orange-400" : "text-white/10")}>
                            {streak} Day Streak
                          </span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-white/10" />
                        <span className="text-[10px] font-bold text-white/20 italic">
                          Start date: {new Date(habit.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: 7 Day Calendar */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Last 7 Days</span>
                    </div>
                    <div className="flex gap-2">
                      {last7Days.map(({ dateStr, dayName }) => {
                        const isDone = habit.completedDates.includes(dateStr);
                        const isToday = dateStr === getTodayStr();
                        
                        return (
                          <div key={dateStr} className="flex flex-col items-center gap-1.5">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center transition-all border",
                              isDone 
                                ? "bg-lime/20 border-lime/40 text-lime" 
                                : isToday 
                                  ? "bg-white/5 border-white/20 text-white/40 animate-pulse" 
                                  : "bg-white/5 border-white/5 text-white/10"
                            )}>
                              {isDone && <CheckCircle2 size={12} strokeWidth={3} />}
                              {!isDone && isToday && <div className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                            </div>
                            <span className={cn(
                              "text-[8px] font-black uppercase",
                              isToday ? "text-lime" : "text-white/20"
                            )}>{dayName}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Delete */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="p-3 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {habits.length === 0 && (
          <div className="py-20 text-center space-y-6">
            <div className="relative inline-block">
               <div className="absolute inset-0 bg-lime/10 blur-[80px] rounded-full scale-150" />
               <Calendar size={80} className="text-white/5 relative z-10" />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-sm font-black text-white/20 uppercase tracking-[0.4em]">습관 목록이 비어있습니다</p>
              <p className="text-xs text-white/10 font-bold italic">작은 습관이 모여 위대한 변화를 만듭니다</p>
            </div>
          </div>
        )}
      </div>

      {/* Persistence Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-white/5 text-white/10">
         <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Routine Intelligence</p>
            <div className="h-[1px] w-8 bg-current" />
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-lime" />
              <span>Local Storage Active</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={10} />
              <span>Streak Engine v1.2</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
