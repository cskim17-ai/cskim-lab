import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Clock, 
  Calendar, 
  X, 
  CheckCircle2, 
  Zap, 
  Share2, 
  Bell, 
  AlertCircle,
  Smartphone,
  Layout,
  History,
  Trash2,
  BellRing
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScheduledPost {
  id: string;
  content: string;
  scheduledTime: string; // ISO string
  createdAt: number;
  notified: boolean;
}

export default function AdminSocialScheduler() {
  const [posts, setPosts] = useState<ScheduledPost[]>(() => {
    const saved = localStorage.getItem('vibe_social_posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [content, setContent] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('vibe_social_posts', JSON.stringify(posts));
  }, [posts]);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      setPermission(res);
    }
  };

  // Scheduler Polling
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      setPosts(prev => {
        let changed = false;
        const next = prev.map(post => {
          const scheduled = new Date(post.scheduledTime);
          if (!post.notified && scheduled <= now) {
            // Trigger Notification
            if (Notification.permission === 'granted') {
              new Notification('예약된 게시물 게시 시간!', {
                body: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
                icon: '/favicon.ico'
              });
            }
            changed = true;
            return { ...post, notified: true };
          }
          return post;
        });
        return changed ? next : prev;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !scheduleDate) return;

    if (permission !== 'granted') {
      requestPermission();
    }

    const newPost: ScheduledPost = {
      id: Math.random().toString(36).substr(2, 9),
      content: content.trim(),
      scheduledTime: new Date(scheduleDate).toISOString(),
      createdAt: Date.now(),
      notified: false
    };

    setPosts(prev => [...prev, newPost].sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    ));
    
    setContent('');
    setScheduleDate('');
  };

  const deletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
    );
  }, [posts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">소셜 미디어 예약</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Social Integrity v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={requestPermission}
            className={cn(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all",
              permission === 'granted' 
                ? "bg-lime/10 border-lime/20 text-lime"
                : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
            )}
          >
             <BellRing size={16} className={cn(permission === 'granted' && "animate-pulse")} />
             <span className="text-[11px] font-black uppercase tracking-widest">
               {permission === 'granted' ? '시스템 알림 활성' : '알림 권한 요청'}
             </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                    <Send size={16} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">새 게시물 예약</h3>
              </div>

              <form onSubmit={handleSchedule} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">게시물 내용 (Content)</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="무슨 생각을 하고 계신가요?"
                      rows={6}
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold resize-none"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">예약 시간 (Schedule)</label>
                    <div className="relative">
                       <input
                         type="datetime-local"
                         value={scheduleDate}
                         onChange={(e) => setScheduleDate(e.target.value)}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold appearance-none cursor-pointer"
                       />
                       <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={16} />
                    </div>
                 </div>

                 <button
                   type="submit"
                   disabled={!content.trim() || !scheduleDate}
                   className="w-full py-5 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20 mt-4"
                 >
                   <Calendar size={18} className="group-hover:rotate-12 transition-transform" />
                   <span className="uppercase tracking-widest text-sm">게시 예약하기</span>
                 </button>
              </form>
           </div>
        </div>

        {/* Right: List Area */}
        <div className="lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                 <History size={18} className="text-white/20" />
                 <h4 className="text-[10px] font-black italic text-white/40 uppercase tracking-[0.3em]">Upcoming Queue</h4>
              </div>
              <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                 <span className="text-[10px] font-black text-lime uppercase tracking-widest">
                    총 {posts.length}개 대기 중
                 </span>
              </div>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                 {sortedPosts.map((post) => {
                    const scheduledDate = new Date(post.scheduledTime);
                    const isOverdue = scheduledDate < new Date() && !post.notified;
                    const isNotified = post.notified;

                    return (
                       <motion.div
                         key={post.id}
                         layout
                         initial={{ opacity: 0, x: -20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className={cn(
                           "glass border p-6 sm:p-8 rounded-[32px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all group overflow-hidden relative",
                           isOverdue ? "border-red-500/20 bg-red-500/5 hover:border-red-500/40" : "border-white/5 bg-white/[0.02] hover:border-white/10",
                           isNotified && "opacity-60 grayscale-[0.5]"
                         )}
                       >
                          <div className="flex items-start gap-6 flex-1">
                             <div className={cn(
                               "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                               isOverdue ? "bg-red-500/10 text-red-500" : isNotified ? "bg-white/5 text-white/20" : "bg-lime/10 text-lime"
                             )}>
                                {isNotified ? <CheckCircle2 size={24} /> : isOverdue ? <AlertCircle size={24} /> : <Clock size={24} />}
                             </div>
                             
                             <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                   <span className={cn(
                                     "text-[10px] font-black uppercase tracking-widest",
                                     isOverdue ? "text-red-500/60" : isNotified ? "text-white/20" : "text-white/40"
                                   )}>
                                      {scheduledDate.toLocaleString()}
                                   </span>
                                   {isOverdue && (
                                     <span className="px-2 py-0.5 bg-red-500 text-white font-black text-[8px] rounded uppercase tracking-widest">Overdue</span>
                                   )}
                                   {isNotified && (
                                     <span className="px-2 py-0.5 bg-white/10 text-white/40 font-black text-[8px] rounded uppercase tracking-widest">Notified</span>
                                   )}
                                </div>
                                <p className="text-sm font-black text-white/80 leading-relaxed max-w-xl">
                                   {post.content}
                                </p>
                             </div>
                          </div>

                          <button
                            onClick={() => deletePost(post.id)}
                            className="p-4 bg-white/0 text-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all self-end sm:self-center"
                          >
                             <X size={20} />
                          </button>

                          {/* Decorative Background Icon */}
                          <div className="absolute -bottom-6 -right-6 opacity-[0.02] pointer-events-none transform rotate-12 group-hover:scale-125 transition-transform duration-1000">
                             <Share2 size={100} />
                          </div>
                       </motion.div>
                    );
                 })}
              </AnimatePresence>

              {posts.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[60px]">
                   <Layout size={64} strokeWidth={1} />
                   <div className="space-y-2">
                     <p className="text-sm font-black uppercase tracking-[0.4em]">Queue Empty</p>
                     <p className="text-[10px] italic font-bold opacity-30 mt-2">예약된 소셜 미디어 게시물이 없습니다</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Smartphone size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Social Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Protocol Social v1.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 스케줄러 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>알림 동기화 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
