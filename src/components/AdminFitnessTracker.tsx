import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Footprints, Flame, Timer, Plus, Save, 
  TrendingUp, Activity, Calendar, Info, 
  ChevronRight, ArrowUpRight, BarChart3,
  Dumbbell, Target, Zap, CheckCircle2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface FitnessLog {
  id: string;
  steps: number;
  calories: number;
  minutes: number;
  date: Timestamp;
}

export default function AdminFitnessTracker() {
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [formData, setFormData] = useState({
    steps: '',
    calories: '',
    minutes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load logs from Firebase (Last 30 days)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'fitness_logs'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FitnessLog[];
      setLogs(data);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || isSaving) return;
    if (!formData.steps || !formData.calories || !formData.minutes) return;

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'fitness_logs'), {
        userId: user.uid,
        steps: Number(formData.steps),
        calories: Number(formData.calories),
        minutes: Number(formData.minutes),
        date: serverTimestamp()
      });
      setFormData({ steps: '', calories: '', minutes: '' });
    } catch (err) {
      console.error('Failed to save fitness log:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Stats Logic
  const stats = useMemo(() => {
    const last7Days = logs.slice(0, 7);
    if (last7Days.length === 0) return { avgSteps: 0, avgCal: 0, avgMin: 0, totalSteps: 0 };

    const total = last7Days.reduce((acc, curr) => ({
      steps: acc.steps + curr.steps,
      calories: acc.calories + curr.calories,
      minutes: acc.minutes + curr.minutes
    }), { steps: 0, calories: 0, minutes: 0 });

    return {
      avgSteps: Math.round(total.steps / last7Days.length),
      avgCal: Math.round(total.calories / last7Days.length),
      avgMin: Math.round(total.minutes / last7Days.length),
      totalSteps: total.steps
    };
  }, [logs]);

  // Chart Data Preparation (Last 7 Logs)
  const chartData = useMemo(() => {
    return [...logs]
      .slice(0, 7)
      .reverse()
      .map(log => ({
        name: new Date(log.date.seconds * 1000).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        steps: log.steps,
      }));
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6 md:px-0 min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">피트니스 트래커</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">신체 능력 엔진 v2.4</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
             <Activity size={14} className="text-lime" />
             <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">생체 데이터 동기화 활성</span>
          </div>
        </div>
      </div>

      {/* Top Cards: Grid 1 in row on Desktop, stacked on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Steps Card */}
        <motion.div whileHover={{ y: -5 }} className="glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden group bg-forest/40">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] translate-x-12 -translate-y-12" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="w-12 h-12 bg-lime/10 rounded-2xl flex items-center justify-center text-lime group-hover:scale-110 transition-transform">
              <Footprints size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">오늘의 걸음</p>
              <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                {logs[0]?.steps.toLocaleString() || '0'} 
                <span className="text-xs text-white/20 ml-2 font-bold uppercase tracking-widest italic">보</span>
              </h3>
            </div>
            <div className="text-[9px] font-bold text-lime/60 uppercase tracking-widest flex items-center gap-2 italic">
               <ArrowUpRight size={10} /> 활동 대사 활성
            </div>
          </div>
        </motion.div>

        {/* Calories Card */}
        <motion.div whileHover={{ y: -5 }} className="glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden group bg-forest/40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/5 blur-[60px] translate-x-12 -translate-y-12" />
           <div className="relative z-10 flex flex-col gap-4">
             <div className="w-12 h-12 bg-orange-400/10 rounded-2xl flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
               <Flame size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">소모 칼로리</p>
               <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                 {logs[0]?.calories.toLocaleString() || '0'}
                 <span className="text-xs text-white/20 ml-2 font-bold uppercase tracking-widest italic">kcal</span>
               </h3>
             </div>
             <div className="text-[9px] font-bold text-orange-400/60 uppercase tracking-widest flex items-center gap-2 italic">
                <ArrowUpRight size={10} /> 지방 연소 v2
             </div>
           </div>
        </motion.div>

        {/* Time Card */}
        <motion.div whileHover={{ y: -5 }} className="glass rounded-[40px] p-8 border border-white/5 relative overflow-hidden group bg-forest/40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-sky-400/5 blur-[60px] translate-x-12 -translate-y-12" />
           <div className="relative z-10 flex flex-col gap-4">
             <div className="w-12 h-12 bg-sky-400/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
               <Timer size={24} />
             </div>
             <div>
               <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">운동 시간</p>
               <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                 {logs[0]?.minutes || '0'}
                 <span className="text-xs text-white/20 ml-2 font-bold uppercase tracking-widest italic">분</span>
               </h3>
             </div>
             <div className="text-[9px] font-bold text-sky-400/60 uppercase tracking-widest flex items-center gap-2 italic">
                <Target size={10} /> 뉴럴 포커스 세션
             </div>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form & Averages */}
        <div className="lg:col-span-4 space-y-8">
           {/* Add Log Form */}
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                  <Plus size={16} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">새 활동 기록</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                 <div className="relative group">
                    <input
                      type="number"
                      value={formData.steps}
                      onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                      placeholder="걸음수 (Steps)"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                    />
                    <Footprints className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                 </div>
                 <div className="relative group">
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      placeholder="칼로리 (kcal)"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                    />
                    <Flame className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-orange-400 transition-colors" size={18} />
                 </div>
                 <div className="relative group">
                    <input
                      type="number"
                      value={formData.minutes}
                      onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                      placeholder="시간 (minutes)"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                    />
                    <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-sky-400 transition-colors" size={18} />
                 </div>

                 <button
                   type="submit"
                   disabled={isSaving}
                   className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
                 >
                   <Save size={18} className="group-hover:scale-125 transition-transform" />
                   <span>기록 저장하기</span>
                 </button>
              </form>
           </div>

           {/* Last 7 Days Averages */}
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6 bg-forest/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-400/10 flex items-center justify-center text-sky-400">
                  <BarChart3 size={16} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">주간 분석</h3>
              </div>

              <div className="space-y-4">
                 {[
                   { label: '평균 걸음', value: stats.avgSteps, unit: '보', color: 'text-lime' },
                   { label: '평균 칼로리', value: stats.avgCal, unit: 'kcal', color: 'text-orange-400' },
                   { label: '평균 시간', value: stats.avgMin, unit: '분', color: 'text-sky-400' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.label}</span>
                      <div className="flex items-baseline gap-1.5">
                         <span className={cn("text-lg font-black italic tabular-nums", item.color)}>{item.value.toLocaleString()}</span>
                         <span className="text-[9px] font-bold text-white/10 uppercase italic">{item.unit}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <div className="pt-4 border-t border-white/5 text-center">
                 <p className="text-[9px] font-bold text-white/10 uppercase tracking-[0.2em] italic">최근 7개 항목을 기반으로 계산됨</p>
              </div>
           </div>
        </div>

        {/* Right: Charts Area */}
        <div className="lg:col-span-8 space-y-8">
           <div className="glass rounded-[40px] border border-white/10 p-8 min-h-[500px]">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime border border-lime/20">
                       <TrendingUp size={20} />
                    </div>
                    <div>
                       <h3 className="text-sm font-black text-white uppercase tracking-widest">신체 발달 기록</h3>
                       <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mt-0.5">걸음수 활동 트렌드</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="px-3 py-1.5 bg-lime/20 rounded-full border border-lime/30">
                       <span className="text-[10px] font-black text-lime uppercase tracking-widest">7일 주기</span>
                    </div>
                 </div>
              </div>

               <div className="flex-1 w-full min-h-[350px] sm:min-h-[400px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={chartData}>
                          <defs>
                             <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#A3E635" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#A3E635" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis 
                             dataKey="name" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' }} 
                             dy={10}
                          />
                          <YAxis 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 'bold' }} 
                          />
                          <Tooltip 
                             contentStyle={{ 
                                backgroundColor: '#1E293B', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                color: '#fff'
                             }}
                             itemStyle={{ color: '#A3E635' }}
                          />
                          <Area 
                             type="monotone" 
                             dataKey="steps" 
                             stroke="#A3E635" 
                             strokeWidth={4}
                             fillOpacity={1} 
                             fill="url(#colorSteps)" 
                             animationDuration={1500}
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/5 space-y-4">
                       <BarChart3 size={80} strokeWidth={1} />
                       <p className="text-sm font-black uppercase tracking-[0.3em]">활동 데이터 없음</p>
                       <p className="text-[10px] italic">첫 번째 기록을 추가하여 그래프를 확인하세요</p>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">총 활동 걸음 수</p>
                     <p className="text-xl font-black text-white italic tabular-nums">{stats.totalSteps.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">효율 등급</p>
                     <p className="text-xl font-black text-lime italic tabular-nums">98.2<span className="text-xs ml-1">%</span></p>
                  </div>
               </div>
            </div>

            {/* History List Mini */}
            <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                        <Calendar size={16} />
                     </div>
                     <h3 className="text-xs font-black text-white uppercase tracking-widest">최근 기록</h3>
                  </div>
               </div>

               <div className="space-y-3 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-forest-dark flex items-center justify-center text-[10px] font-black text-white/20 flex-col leading-tight">
                             <span>{new Date(log.date.seconds * 1000).getDate()}</span>
                             <span className="uppercase text-[8px]">{new Date(log.date.seconds * 1000).toLocaleDateString('ko-KR', { month: 'short' })}</span>
                          </div>
                          <div>
                             <p className="text-xs font-black text-white italic">{log.steps.toLocaleString()} 걸음</p>
                             <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{log.minutes}분 기록</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-xs font-black text-orange-400 italic">{log.calories} kcal</p>
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                             <CheckCircle2 size={10} className="text-lime" />
                             <span className="text-[8px] font-black text-white/10 uppercase italic">기록됨</span>
                          </div>
                       </div>
                    </div>
                  ))}
                  {logs.length === 0 && (
                    <div className="py-12 text-center text-[10px] font-black text-white/10 uppercase tracking-widest italic">
                       기록이 없습니다
                    </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* Footer Meta */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-white/5 text-white/10">
         <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe 피트니스 인텔리전스</p>
            <div className="h-[1px] w-8 bg-current" />
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-1.5">
               <Zap size={10} className="text-lime" />
               <span>클라우드 지표 동기화</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Dumbbell size={10} />
               <span>생체 인식 v4.5</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
