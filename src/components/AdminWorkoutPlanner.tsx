import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Plus, Trash2, Save, 
  RotateCcw, Target, Repeat, Pencil,
  Check, X, Activity, Flame, Trophy,
  ChevronRight, Calendar
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Workout {
  id: string;
  name: string;
  sets: number;
  reps: number;
}

export default function AdminWorkoutPlanner() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Persistence: Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('vibe_workout_planner');
    if (saved) {
      try {
        setWorkouts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse workouts", e);
      }
    }
  }, []);

  // Persistence: Save to localStorage
  useEffect(() => {
    localStorage.setItem('vibe_workout_planner', JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName || !sets || !reps) return;

    const newWorkout: Workout = {
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseName,
      sets: Number(sets),
      reps: Number(reps)
    };

    setWorkouts([...workouts, newWorkout]);
    setExerciseName('');
    setSets('');
    setReps('');
  };

  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts(workouts.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const totalExercises = workouts.length;
  const totalSets = workouts.reduce((acc, w) => acc + w.sets, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">운동 플래너</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">신체 설계 프로토콜 v2.5</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-4 bg-white/5 rounded-2xl border border-white/10">
            <Activity size={16} className="text-lime" />
            <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">활성 항목: {totalExercises}</span>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 px-6 py-4 bg-orange-500/10 rounded-2xl border border-orange-500/10 ring-1 ring-orange-500/20">
            <Flame size={16} className="text-orange-500 animate-pulse" />
            <span className="text-[11px] font-black text-orange-500 uppercase tracking-widest">경험치 고정</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
         <div className="glass rounded-[48px] border border-white/5 p-10 flex flex-col gap-2 bg-forest/20 backdrop-blur-xl">
            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] italic">현재 운동</span>
            <div className="flex items-center gap-4">
               <span className="text-4xl font-black text-white italic tabular-nums leading-none">{totalExercises}</span>
               <Activity size={24} className="text-lime" />
            </div>
         </div>
         <div className="glass rounded-[48px] border border-white/5 p-10 flex flex-col gap-2 bg-forest/20 backdrop-blur-xl">
            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] italic">예상 운동 강도</span>
            <div className="flex items-center gap-4">
               <span className="text-4xl font-black text-white italic tabular-nums leading-none">{totalSets * 10}</span>
               <Flame size={24} className="text-orange-500" />
            </div>
         </div>
         <div className="glass rounded-[48px] border border-white/5 p-10 flex flex-col gap-2 bg-forest/20 backdrop-blur-xl">
            <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.2em] italic">완료 보너스</span>
            <div className="flex items-center gap-4">
               <span className="text-4xl font-black text-white italic tabular-nums leading-none">XP+250</span>
               <Trophy size={24} className="text-yellow-500" />
            </div>
         </div>
      </div>

      {/* Input Section */}
      <div className="glass rounded-[56px] border border-white/10 p-8 sm:p-12 bg-forest/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-lime/10 blur-[120px] -translate-x-10 -translate-y-10" />
        
        <form onSubmit={addWorkout} className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
           <div className="md:col-span-5 space-y-3">
             <label className="text-[11px] font-black text-white/30 uppercase tracking-widest pl-2">운동 이름</label>
             <input
               type="text"
               value={exerciseName}
               onChange={(e) => setExerciseName(e.target.value)}
               placeholder="예: 벤치 프레스"
               className="w-full bg-forest border border-white/10 rounded-[28px] py-6 px-10 text-lg text-white focus:outline-none focus:border-lime transition-all placeholder:text-white/10"
             />
           </div>

           <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">세트</label>
             <input
               type="number"
               value={sets}
               onChange={(e) => setSets(e.target.value)}
               placeholder="세트"
               className="w-full bg-forest border border-white/10 rounded-3xl py-5 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all text-center"
             />
           </div>

           <div className="md:col-span-2 space-y-2">
             <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">횟수</label>
             <input
               type="number"
               value={reps}
               onChange={(e) => setReps(e.target.value)}
               placeholder="횟수"
               className="w-full bg-forest border border-white/10 rounded-3xl py-5 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all text-center"
             />
           </div>

           <div className="md:col-span-3 flex items-end">
             <button
               type="submit"
               disabled={!exerciseName || !sets || !reps}
               className="w-full py-5 bg-lime text-forest font-black rounded-3xl hover:bg-white active:scale-95 transition-all shadow-2xl shadow-lime/20 flex items-center justify-center gap-3 group disabled:opacity-50"
             >
               <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
               <span className="uppercase tracking-widest text-xs">운동 추가</span>
             </button>
           </div>
        </form>
      </div>

      {/* Workout Table/Grid */}
      <div className="space-y-6">
         <div className="flex items-center justify-between px-6">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
               <Target size={14} />
               운동 목록
            </h3>
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{new Date().toLocaleDateString('ko-KR')}</span>
         </div>

         <div className="space-y-4 pb-20">
            <AnimatePresence mode="popLayout">
               {workouts.map((workout) => (
                 <motion.div
                   key={workout.id}
                   layout
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   className="glass rounded-[32px] border border-white/5 p-6 hover:border-white/20 transition-all duration-500 bg-forest/40 group overflow-hidden"
                 >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                       {/* Name & ID */}
                       <div className="md:col-span-5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 flex-shrink-0 group-hover:bg-lime/10 group-hover:text-lime transition-colors">
                             <Dumbbell size={20} />
                          </div>
                          {editingId === workout.id ? (
                             <input
                               autoFocus
                               defaultValue={workout.name}
                               onBlur={(e) => {
                                 updateWorkout(workout.id, { name: e.target.value });
                                 setEditingId(null);
                               }}
                               className="bg-forest border border-lime/30 rounded-xl py-2 px-4 text-xl font-black text-white italic w-full focus:outline-none"
                             />
                          ) : (
                             <div 
                               onClick={() => setEditingId(workout.id)}
                               className="cursor-pointer group/text"
                             >
                                <h4 className="text-xl font-black text-white italic serif tracking-tight group-hover/text:text-lime transition-colors">
                                   {workout.name}
                                </h4>
                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-1">
                                   <Pencil size={8} /> 클릭하여 이름 수정
                                </p>
                             </div>
                          )}
                       </div>

                       {/* Stats */}
                       <div className="md:col-span-4 flex items-center gap-8">
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">세트</span>
                             <div className="flex items-center gap-2">
                                <span className="text-2xl font-black text-white italic tabular-nums">{workout.sets}</span>
                                <div className="flex gap-0.5">
                                   {[...Array(Math.min(5, workout.sets))].map((_, i) => (
                                      <div key={i} className="w-1 h-3 bg-lime rounded-full" />
                                   ))}
                                </div>
                             </div>
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">횟수</span>
                             <div className="flex items-center gap-1">
                                <span className="text-2xl font-black text-white italic tabular-nums">{workout.reps}</span>
                                <Repeat size={14} className="text-white/10" />
                             </div>
                          </div>
                       </div>

                       {/* Actions */}
                       <div className="md:col-span-3 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteWorkout(workout.id)}
                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>

            {workouts.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-white/5 border-2 border-dashed border-white/5 rounded-[48px] gap-4">
                 <Dumbbell size={64} strokeWidth={1} />
                 <p className="text-sm font-black uppercase tracking-[0.4em] italic leading-none">플래너가 비어 있습니다</p>
              </div>
            )}
         </div>
      </div>

      {/* Footer Branding */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center gap-2 pointer-events-none">
         <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-1.5">
               <RotateCcw size={10} />
               <span>자동 저장 활성화됨</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Dumbbell size={10} className="text-lime" />
               <span>근성장 최적화 시스템 v1.0</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
