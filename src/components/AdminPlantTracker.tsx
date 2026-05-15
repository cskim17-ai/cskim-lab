import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Droplets, 
  Calendar, 
  Trash2, 
  Camera, 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Sprout, 
  Thermometer, 
  Wind,
  Zap,
  Leaf,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Plant {
  id: string;
  name: string;
  imageUrl: string;
  interval: number; // days
  lastWatered: number; // timestamp
  createdAt: number;
}

export default function AdminPlantTracker() {
  const [plants, setPlants] = useState<Plant[]>(() => {
    const saved = localStorage.getItem('vibe_plant_tracker');
    return saved ? JSON.parse(saved) : [];
  });

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [interval, setIntervalDays] = useState(3);
  const [notificationGranted, setNotificationGranted] = useState(false);

  useEffect(() => {
    localStorage.setItem('vibe_plant_tracker', JSON.stringify(plants));
  }, [plants]);

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationGranted(true);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') setNotificationGranted(true);
        });
      }
    }
  }, []);

  const handleAddPlant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPlant: Plant = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      imageUrl: imageUrl.trim() || `https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=200&h=200&auto=format&fit=crop`,
      interval: interval,
      lastWatered: Date.now(),
      createdAt: Date.now(),
    };

    setPlants([newPlant, ...plants]);
    setName('');
    setImageUrl('');
    setIntervalDays(3);
  };

  const waterPlant = (id: string) => {
    setPlants(prev => prev.map(p => 
      p.id === id ? { ...p, lastWatered: Date.now() } : p
    ));
  };

  const deletePlant = (id: string) => {
    setPlants(prev => prev.filter(p => p.id !== id));
  };

  const getPlantStatus = (plant: Plant) => {
    const nextWateringDate = plant.lastWatered + (plant.interval * 24 * 60 * 60 * 1000);
    const isOverdue = Date.now() > nextWateringDate;
    const daysRemaining = Math.ceil((nextWateringDate - Date.now()) / (1000 * 60 * 60 * 24));
    
    return { isOverdue, daysRemaining };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">가상 식물 관리기</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Botanical Protocol v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={cn(
             "flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all",
             notificationGranted ? "bg-lime/10 border-lime/20 text-lime" : "bg-white/5 border-white/10 text-white/40"
          )}>
             <Bell size={16} />
             <span className="text-[11px] font-black uppercase tracking-widest">
               {notificationGranted ? '알림 활성화됨' : '알림 비활성'}
             </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Add Plant Form */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 bg-forest/20 shadow-2xl">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                   <Plus size={16} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">새 식물 등록</h3>
             </div>

             <form onSubmit={handleAddPlant} className="space-y-5">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">식물 이름</label>
                   <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="예: 몬스테라, 산세베리아"
                     className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 font-bold"
                   />
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">사진 URL (선택)</label>
                   <div className="relative group">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                      />
                      <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">물 주기 간격 (일)</label>
                   <div className="relative group">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={interval}
                        onChange={(e) => setIntervalDays(parseInt(e.target.value) || 1)}
                        className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold"
                      />
                      <Droplets className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                   </div>
                   <p className="text-[9px] text-white/20 italic px-2">권장: 허브류 2-3일, 다육이 14-21일</p>
                </div>

                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group disabled:opacity-20 mt-4"
                >
                  <Leaf size={18} className="group-hover:rotate-12 transition-transform" />
                  <span>식물 추가하기</span>
                </button>
             </form>
          </div>

          {/* Quick Stats */}
          <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Wind size={16} className="text-lime" />
                   <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">환경 상태</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-lime">
                   <Zap size={10} />
                   <span>Optimal</span>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Temperature</p>
                   <p className="text-sm font-black text-white">24°C</p>
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Humidity</p>
                   <p className="text-sm font-black text-white">65%</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Plants Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">My Garden</h3>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">충분함</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20">부족함</span>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                 {plants.map((plant) => {
                    const { isOverdue, daysRemaining } = getPlantStatus(plant);
                    return (
                       <motion.div
                         key={plant.id}
                         layout
                         initial={{ opacity: 0, scale: 0.9 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className={cn(
                           "p-8 rounded-[48px] border transition-all duration-500 group relative overflow-hidden flex flex-col items-center text-center space-y-6",
                           isOverdue 
                             ? "bg-red-500/5 border-red-500/40 shadow-2xl shadow-red-500/5" 
                             : "glass border-white/10 bg-forest/20 hover:border-lime/30"
                         )}
                       >
                          {/* Image */}
                          <div className="relative">
                             <div className={cn(
                               "w-32 h-32 rounded-full p-2 border-4 transition-all duration-700 overflow-hidden",
                               isOverdue ? "border-red-500/20" : "border-lime/10"
                             )}>
                                <img 
                                  src={plant.imageUrl} 
                                  alt={plant.name} 
                                  className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-700" 
                                />
                             </div>
                             {isOverdue && (
                                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg animate-bounce">
                                   <AlertCircle size={16} />
                                </div>
                             )}
                          </div>

                          <div className="space-y-4 w-full">
                             <div className="space-y-1">
                                <h4 className="text-2xl font-black italic serif tracking-tighter text-white leading-none">
                                   {plant.name}
                                </h4>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">
                                   {plant.interval} DAYS INTERVAL
                                </p>
                             </div>

                             <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                <div className="space-y-1">
                                   <div className="flex items-center justify-center gap-1.5 text-white/20">
                                      <Clock size={10} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">상태</span>
                                   </div>
                                   <p className={cn(
                                      "text-xs font-black uppercase tracking-widest",
                                      isOverdue ? "text-red-500" : "text-lime"
                                   )}>
                                      {isOverdue ? 'Overdue' : 'Healthy'}
                                   </p>
                                </div>
                                <div className="space-y-1">
                                   <div className="flex items-center justify-center gap-1.5 text-white/20">
                                      <Calendar size={10} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">남은 기간</span>
                                   </div>
                                   <p className="text-xs font-black uppercase tracking-widest text-white">
                                      {isOverdue ? 'Need Water' : `${daysRemaining} Days`}
                                   </p>
                                </div>
                             </div>

                             <div className="flex gap-4 pt-2">
                                <button
                                  onClick={() => waterPlant(plant.id)}
                                  className={cn(
                                    "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                                    isOverdue 
                                      ? "bg-red-500 text-white shadow-xl shadow-red-500/20" 
                                      : "bg-lime text-forest shadow-xl shadow-lime/10"
                                  )}
                                >
                                   <Droplets size={14} className="animate-pulse" />
                                   물 주기
                                </button>
                                <button
                                  onClick={() => deletePlant(plant.id)}
                                  className="w-12 h-12 rounded-2xl bg-white/5 text-white/20 hover:text-red-500 hover:bg-red-500/10 border border-white/5 transition-all flex items-center justify-center"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>

                          {/* Decorative Watermark */}
                          <div className="absolute -bottom-10 -right-10 opacity-5 pointer-events-none group-hover:scale-125 transition-transform duration-1000">
                             <Sprout size={160} />
                          </div>
                       </motion.div>
                    );
                 })}
              </AnimatePresence>

              {plants.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[60px]">
                   <Sprout size={64} strokeWidth={1} />
                   <div className="space-y-2">
                     <p className="text-sm font-black uppercase tracking-[0.4em]">정원이 비어 있습니다</p>
                     <p className="text-[10px] italic font-bold opacity-30 mt-2">반려 식물을 등록하고 건강하게 관리해 보세요</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Droplets size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Botanical Intelligence Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Gardening Protocol v1.5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>수분 상태 지능형 감지</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>자동 알림 시스템 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
