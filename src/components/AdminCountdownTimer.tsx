import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Calendar as CalendarIcon, Plus, Trash2, 
  Bell, Clock, Sparkles, AlertCircle, ChevronRight,
  AlarmClock, PartyPopper, Hourglass
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EventTimer {
  id: string;
  name: string;
  targetDate: Timestamp;
}

export default function AdminCountdownTimer() {
  const [events, setEvents] = useState<EventTimer[]>([]);
  const [eventName, setEventName] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [timeLefts, setTimeLefts] = useState<Record<string, string>>({});
  const notifiedEvents = useRef<Set<string>>(new Set());

  // Load events from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'event_timers'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EventTimer[];
      setEvents(data);
    });

    return () => unsubscribe();
  }, []);

  // Update Countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeLefts: Record<string, string> = {};
      const now = new Date().getTime();

      events.forEach(event => {
        const target = event.targetDate.seconds * 1000;
        const diff = target - now;

        if (diff <= 0) {
          newTimeLefts[event.id] = "종료되었습니다!";
          if (!notifiedEvents.current.has(event.id)) {
             alert(`${event.name} 이벤트가 시작되었습니다!`);
             notifiedEvents.current.add(event.id);
          }
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((diff % (1000 * 60)) / 1000);
          
          newTimeLefts[event.id] = `${days}일 ${hours}시간 ${mins}분 ${secs}초`;
        }
      });

      setTimeLefts(newTimeLefts);
    }, 1000);

    return () => clearInterval(interval);
  }, [events]);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !eventName || !targetDate) return;

    try {
      await addDoc(collection(db, 'event_timers'), {
        userId: user.uid,
        name: eventName,
        targetDate: Timestamp.fromDate(new Date(targetDate)),
        createdAt: serverTimestamp()
      });
      setEventName('');
      setTargetDate('');
    } catch (err) {
      console.error('Failed to add event:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'event_timers', id));
      notifiedEvents.current.delete(id);
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0 min-h-screen"
    >
      {/* Header */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-5xl sm:text-6xl font-black italic serif text-white tracking-tighter">카운트다운</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.6em] font-black mt-2">시간 이벤트 동기화 프로토콜</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
           <Clock size={14} className="text-pink-500" />
           <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">실시간 시계 활성화됨</span>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass rounded-[48px] border border-white/10 p-8 sm:p-12 relative overflow-hidden bg-forest/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/5 blur-[100px] -translate-x-10 -translate-y-10" />
        
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
           <div className="md:col-span-5 space-y-2">
             <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">이벤트 이름</label>
             <div className="relative group">
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="대망의 이벤트 이름..."
                  className="w-full bg-forest border border-white/5 rounded-3xl py-5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-white/10"
                />
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-pink-500 transition-colors" size={18} />
             </div>
           </div>

           <div className="md:col-span-4 space-y-2">
             <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">목표 날짜 및 시간</label>
             <div className="relative group">
                <input
                  type="datetime-local"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-forest border border-white/5 rounded-3xl py-5 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all color-scheme-dark"
                />
             </div>
           </div>

           <div className="md:col-span-3 flex items-end">
             <button
               type="submit"
               className="w-full py-5 bg-pink-500 text-white font-black rounded-3xl hover:bg-pink-400 active:scale-95 transition-all shadow-2xl shadow-pink-500/20 flex items-center justify-center gap-3 group px-4"
             >
               <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
               <span className="uppercase tracking-widest text-xs">이벤트 추가</span>
             </button>
           </div>
        </form>
      </div>

      {/* Timer List */}
      <div className="space-y-8">
         <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
               <Hourglass size={14} />
               활성 타이머
            </h3>
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{events.length}개 타이머</span>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            <AnimatePresence mode="popLayout">
               {events.map((event) => {
                 const isDone = timeLefts[event.id] === "종료되었습니다!" || timeLefts[event.id] === "TIME'S UP!";
                 return (
                   <motion.div
                     key={event.id}
                     layout
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     exit={{ opacity: 0, scale: 0.95 }}
                     className={cn(
                       "glass rounded-[48px] border p-8 sm:p-10 flex flex-col gap-8 relative overflow-hidden group transition-all duration-500",
                       isDone ? "border-pink-500/50 bg-pink-500/10 shadow-[0_0_50px_rgba(236,72,153,0.1)]" : "border-white/5 hover:border-white/20 bg-forest/40"
                     )}
                   >
                     <div className="flex items-start justify-between relative z-10">
                        <div className="space-y-1">
                           <h4 className={cn(
                             "text-xl font-black italic serif underline decoration-pink-500/20 underline-offset-8",
                             isDone ? "text-pink-500" : "text-white"
                           )}>
                             {event.name}
                           </h4>
                           <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest flex items-center gap-2">
                              <CalendarIcon size={10} />
                              {new Date(event.targetDate.seconds * 1000).toLocaleString('ko-KR')}
                           </p>
                        </div>
                        <button 
                          onClick={() => handleDelete(event.id)}
                          className="p-3 rounded-2xl bg-white/5 text-white/20 hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                           <Trash2 size={16} />
                        </button>
                     </div>

                     <div className="relative z-10">
                        <div className="flex items-baseline gap-2">
                           <span className={cn(
                             "text-4xl font-black tracking-tighter tabular-nums italic",
                             isDone ? "text-pink-500 animate-pulse" : "text-white"
                           )}>
                             {timeLefts[event.id] || '---'}
                           </span>
                        </div>
                     </div>

                     {/* Visual Background Decoration */}
                     <div className="absolute bottom-0 right-0 p-6 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                        {isDone ? <PartyPopper size={80} /> : <AlarmClock size={80} />}
                     </div>

                     {/* Progress bar simulation (static or simple) */}
                     <div className="h-1 w-full bg-white/5 rounded-full mt-4 overflow-hidden p-[1px]">
                        <motion.div 
                          className={cn("h-full rounded-full", isDone ? "bg-pink-500" : "bg-white/20")}
                          initial={{ width: "0%" }}
                          animate={{ width: isDone ? "100%" : "30%" }}
                        />
                     </div>
                   </motion.div>
                 );
               })}
            </AnimatePresence>

            {events.length === 0 && (
              <div className="md:col-span-2 py-32 flex flex-col items-center justify-center text-white/5 gap-4">
                 <Timer size={80} strokeWidth={1} />
                 <p className="text-sm font-black uppercase tracking-[0.4em] italic">등록된 이벤트가 없습니다</p>
              </div>
            )}
         </div>
      </div>

      {/* Persistence Protocol Metadata */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 opacity-20 flex flex-col items-center gap-2 pointer-events-none">
         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-1.5">
               <Bell size={10} className="text-pink-500" />
               <span>푸시 알림 엔진 2.0</span>
            </div>
            <div className="flex items-center gap-1.5">
               <AlertCircle size={10} />
               <span>무지연 동기화</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
