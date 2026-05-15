import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Target, 
  CheckCircle2, 
  Timer as TimerIcon,
  Plus,
  Trash2,
  Bell,
  Zap,
  Layout
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Task {
  id: string;
  name: string;
  completedSessions: number;
}

type TimerMode = 'FOCUS' | 'BREAK';

export default function AdminPomodoroTimer() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('vibe_pomodoro_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  
  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Notification sound
  }, []);

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem('vibe_pomodoro_tasks', JSON.stringify(updatedTasks));
  };

  const switchMode = useCallback(() => {
    if (mode === 'FOCUS') {
      // Complete focus session, increment task count
      if (activeTaskId) {
        const updatedTasks = tasks.map(t => 
          t.id === activeTaskId ? { ...t, completedSessions: t.completedSessions + 1 } : t
        );
        saveTasks(updatedTasks);
      }
      setMode('BREAK');
      setTimeLeft(5 * 60);
      setTotalSeconds(5 * 60);
    } else {
      setMode('FOCUS');
      setTimeLeft(25 * 60);
      setTotalSeconds(25 * 60);
    }
    audioRef.current?.play().catch(e => console.log('Audio blocked:', e));
  }, [mode, activeTaskId, tasks]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      switchMode();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, switchMode]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    const initialTime = mode === 'FOCUS' ? 25 * 60 : 5 * 60;
    setTimeLeft(initialTime);
    setTotalSeconds(initialTime);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTaskName.trim(),
      completedSessions: 0
    };
    const updated = [newTask, ...tasks];
    saveTasks(updated);
    if (!activeTaskId) setActiveTaskId(newTask.id);
    setNewTaskName('');
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    if (activeTaskId === id) setActiveTaskId(updated[0]?.id || null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const currentTask = tasks.find(t => t.id === activeTaskId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">작업 뽀모도로</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Efficiency Protocol v3.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Target size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">진행 중인 작업: {tasks.length}개</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Timer Display */}
        <div className={cn(
          "lg:col-span-7 p-12 rounded-[60px] border transition-all duration-700 relative overflow-hidden flex flex-col items-center justify-center space-y-10 group",
          mode === 'FOCUS' 
            ? "glass border-white/10 bg-forest/20" 
            : "bg-lime/20 border-lime/30 shadow-2xl shadow-lime/5"
        )}>
           {/* Mode Indicator */}
           <div className="flex items-center gap-3 px-8 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 relative z-10 transition-all">
              <div className={cn("w-2 h-2 rounded-full animate-pulse", mode === 'FOCUS' ? "bg-blue-400" : "bg-lime")} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em]",
                mode === 'FOCUS' ? "text-blue-400" : "text-lime"
              )}>
                {mode === 'FOCUS' ? 'FOCUS SESSION' : 'BREAK TIME'}
              </span>
           </div>

           {/* Circular Timer Ring */}
           <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-2xl">
                 {/* Track */}
                 <circle
                   cx="50%"
                   cy="50%"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="8"
                   fill="transparent"
                   className="text-white/5"
                 />
                 {/* Progress Ring */}
                 <motion.circle
                   cx="50%"
                   cy="50%"
                   r={radius}
                   stroke="currentColor"
                   strokeWidth="12"
                   fill="transparent"
                   strokeDasharray={circumference}
                   animate={{ strokeDashoffset: offset }}
                   className={cn(
                     "transition-all duration-1000 stroke-linecap-round",
                     mode === 'FOCUS' ? "text-white" : "text-lime"
                   )}
                 />
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <h3 className={cn(
                   "text-7xl sm:text-8xl font-black italic tabular-nums tracking-tighter leading-none mb-2",
                   mode === 'FOCUS' ? "text-white" : "text-forest"
                 )}>
                   {formatTime(timeLeft)}
                 </h3>
                 {currentTask && (
                   <p className={cn(
                     "text-[10px] font-black uppercase tracking-widest opacity-40 px-6 text-center max-w-[200px] truncate",
                     mode === 'FOCUS' ? "text-white" : "text-forest"
                   )}>
                     {currentTask.name}
                   </p>
                 )}
              </div>
           </div>

           {/* Controls */}
           <div className="flex items-center gap-6 relative z-10">
              <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90"
              >
                 <RotateCcw size={20} />
              </button>
              
              <button
                onClick={toggleTimer}
                className={cn(
                  "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all active:scale-95 shadow-2xl",
                  isActive 
                    ? "bg-white text-forest shadow-white/10" 
                    : mode === 'FOCUS' 
                      ? "bg-lime text-forest shadow-lime/20"
                      : "bg-forest text-lime shadow-forest/20"
                )}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <button 
                onClick={switchMode}
                className="w-14 h-14 rounded-2xl bg-white/5 text-white/40 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all active:scale-90"
              >
                 <Coffee size={20} />
              </button>
           </div>
        </div>

        {/* Right: Task Management */}
        <div className="lg:col-span-5 space-y-8">
           {/* Add Task Form */}
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                    <Plus size={16} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">새 작업 추가</h3>
              </div>

              <form onSubmit={handleAddTask} className="space-y-4">
                 <div className="relative group">
                    <input
                      type="text"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      placeholder="수행할 작업을 입력하세요..."
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-5 pl-6 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 font-bold"
                    />
                 </div>
                 <button
                   type="submit"
                   disabled={!newTaskName.trim()}
                   className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group disabled:opacity-20"
                 >
                   <TimerIcon size={18} className="group-hover:rotate-12 transition-transform" />
                   <span>작업 추가하기</span>
                 </button>
              </form>
           </div>

           {/* Tasks List */}
           <div className="space-y-4">
              <div className="flex items-center justify-between px-2 mb-2">
                 <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Task Queue</h3>
                 <Layout size={14} className="text-white/10" />
              </div>

              <div className="space-y-3">
                 <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                       <motion.div
                         key={task.id}
                         layout
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         onClick={() => setActiveTaskId(task.id)}
                         className={cn(
                           "p-6 rounded-[32px] border transition-all duration-300 cursor-pointer relative group",
                           activeTaskId === task.id 
                             ? "bg-white border-white shadow-2xl shadow-white/5" 
                             : "bg-white/5 border-white/5 hover:border-white/10"
                         )}
                       >
                          <div className="flex items-center justify-between">
                             <div className="space-y-2 flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-2">
                                   <div className={cn(
                                     "w-1.5 h-1.5 rounded-full transition-colors",
                                     activeTaskId === task.id ? "bg-forest" : "bg-white/20"
                                   )} />
                                   <p className={cn(
                                     "text-[10px] font-black uppercase tracking-widest transition-colors",
                                     activeTaskId === task.id ? "text-forest/40" : "text-white/20"
                                   )}>
                                      ID: {task.id}
                                   </p>
                                </div>
                                <h4 className={cn(
                                  "text-xl font-black italic tracking-tighter truncate leading-none",
                                  activeTaskId === task.id ? "text-forest" : "text-white"
                                )}>
                                   {task.name}
                                </h4>
                             </div>
                             <div className="flex items-center gap-4">
                                <button
                                  onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                  className={cn(
                                    "p-3 rounded-xl transition-all",
                                    activeTaskId === task.id ? "bg-forest/5 text-red-500 hover:bg-red-500/10" : "bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10"
                                  )}
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>

                          <div className="mt-6 flex flex-wrap items-center gap-2">
                             {Array.from({ length: 8 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                    i < task.completedSessions 
                                      ? activeTaskId === task.id ? "bg-lime text-forest" : "bg-lime text-forest"
                                      : activeTaskId === task.id ? "bg-forest/5 text-forest/10" : "bg-white/5 text-white/5"
                                  )}
                                >
                                   {i < task.completedSessions ? <CheckCircle2 size={14} /> : <span className="font-bold text-[10px] italic">X</span>}
                                </div>
                             ))}
                             {task.completedSessions > 8 && (
                               <span className={cn(
                                 "text-[10px] font-black italic ml-2",
                                 activeTaskId === task.id ? "text-forest" : "text-white/40"
                               )}>
                                 + {task.completedSessions - 8} SESSIONS
                               </span>
                             )}
                          </div>
                       </motion.div>
                    ))}
                 </AnimatePresence>

                 {tasks.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                       <TimerIcon size={64} strokeWidth={1} />
                       <div className="space-y-2">
                         <p className="text-sm font-black uppercase tracking-[0.4em]">큐가 비어 있습니다</p>
                         <p className="text-[10px] italic font-bold opacity-30">생산성을 위해 첫 번째 작업을 추가하세요</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Bell size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Attention Monitoring Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Pomodoro Protocol v3.2.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 동기화</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>오디오 알림 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
