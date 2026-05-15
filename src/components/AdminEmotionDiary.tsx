import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  Save, 
  Heart, 
  Zap, 
  CheckCircle2, 
  Smile, 
  Frown, 
  Meh, 
  Angry, 
  Star,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DiaryEntry {
  date: string; // YYYY-MM-DD
  text: string;
  emoji: string;
  timestamp: number;
}

const EMOJIS = ['😊', '🥰', '😐', '😔', '😢', '😠', '🥳', '😴'];

export default function AdminEmotionDiary() {
  const [entries, setEntries] = useState<Record<string, DiaryEntry>>(() => {
    const saved = localStorage.getItem('vibe_emotion_diary');
    return saved ? JSON.parse(saved) : {};
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [diaryText, setDiaryText] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😊');
  const [isViewOnly, setIsViewOnly] = useState(false);

  useEffect(() => {
    localStorage.setItem('vibe_emotion_diary', JSON.stringify(entries));
  }, [entries]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push(dateStr);
    }
    
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const openAddModal = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (entries[dateStr]) {
      // If already exists, open view
      openViewModal(dateStr);
    } else {
      setSelectedDate(dateStr);
      setDiaryText('');
      setSelectedEmoji('😊');
      setIsViewOnly(false);
      setIsModalOpen(true);
    }
  };

  const openViewModal = (dateStr: string) => {
    const entry = entries[dateStr];
    if (entry) {
      setSelectedDate(dateStr);
      setDiaryText(entry.text);
      setSelectedEmoji(entry.emoji);
      setIsViewOnly(true);
      setIsModalOpen(true);
    } else {
      setSelectedDate(dateStr);
      setDiaryText('');
      setSelectedEmoji('😊');
      setIsViewOnly(false);
      setIsModalOpen(true);
    }
  };

  const handleSave = () => {
    if (!selectedDate || (!diaryText.trim() && isViewOnly)) return;

    const newEntry: DiaryEntry = {
      date: selectedDate,
      text: diaryText,
      emoji: selectedEmoji,
      timestamp: Date.now()
    };

    setEntries(prev => ({ ...prev, [selectedDate]: newEntry }));
    setIsModalOpen(false);
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">감정 다이어리</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Emotional Protocol v1.0</p>
        </div>
        
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="uppercase tracking-widest text-sm">새 일기 작성</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="glass rounded-[40px] border border-white/10 overflow-hidden bg-forest/20 shadow-2xl">
        {/* Calendar Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-lime">
                <CalendarIcon size={24} />
             </div>
             <div>
                <h3 className="text-2xl font-black italic serif text-white">
                  {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                </h3>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-3 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {weekDays.map((day, i) => (
            <div key={day} className={cn(
              "py-4 text-center text-[10px] font-black uppercase tracking-[0.3em]",
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-white/20"
            )}>
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr min-h-[400px] sm:min-h-[500px]">
          {calendarDays.map((dateStr, i) => {
            if (!dateStr) return <div key={`empty-${i}`} className="border-r border-b border-white/5 bg-black/5" />;
            
            const day = dateStr.split('-')[2];
            const entry = entries[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <motion.button
                key={dateStr}
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.03)" }}
                onClick={() => openViewModal(dateStr)}
                className={cn(
                  "border-r border-b border-white/5 p-4 flex flex-col items-center justify-center relative transition-all group overflow-hidden",
                  i % 7 === 6 ? "border-r-0" : ""
                )}
              >
                <span className={cn(
                  "absolute top-3 left-3 text-[10px] font-black tabular-nums transition-colors",
                  isToday ? "text-lime" : "text-white/10 group-hover:text-white/30"
                )}>
                  {day}
                </span>

                <AnimatePresence mode="wait">
                  {entry && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl sm:text-4xl drop-shadow-lg"
                    >
                      {entry.emoji}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isToday && (
                  <div className="absolute bottom-2 w-1 h-1 rounded-full bg-lime" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-forest/80 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white/10 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden glass"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] translate-x-12 -translate-y-12" />
              
              <div className="p-8 sm:p-12 space-y-10 relative z-10">
                {/* Modal Header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <Clock size={14} className="text-lime" />
                       <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{selectedDate}</span>
                    </div>
                    <h3 className="text-2xl font-black italic serif text-white">
                      {isViewOnly ? "이날의 기억" : "오늘 하루는 어땠나요?"}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-3 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Emoji Selection */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">오늘의 감정</p>
                  <div className="flex flex-wrap items-center gap-3">
                    {EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        disabled={isViewOnly}
                        onClick={() => setSelectedEmoji(emoji)}
                        className={cn(
                          "w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl transition-all",
                          selectedEmoji === emoji 
                            ? "bg-lime scale-110 shadow-lg shadow-lime/20 border-2 border-white/20" 
                            : "bg-white/5 hover:bg-white/10 border border-white/5",
                          isViewOnly && selectedEmoji !== emoji ? "opacity-20 grayscale" : ""
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Area */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">오늘의 한 줄</p>
                  <textarea
                    readOnly={isViewOnly}
                    value={diaryText}
                    onChange={(e) => setDiaryText(e.target.value)}
                    placeholder="감정의 조각들을 기록해 보세요..."
                    rows={6}
                    className={cn(
                      "w-full rounded-3xl p-6 text-sm font-medium transition-all resize-none focus:outline-none",
                      isViewOnly 
                        ? "bg-white/5 text-white/60 border border-white/5" 
                        : "bg-forest/50 border border-white/10 text-white focus:border-lime/50 placeholder:text-white/5"
                    )}
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-6 border-t border-white/5 flex gap-4">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 text-white/40 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
                  >
                    {isViewOnly ? "닫기" : "취소"}
                  </button>
                  {!isViewOnly && (
                    <button
                      onClick={handleSave}
                      className="flex-1 py-4 bg-lime text-forest font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
                    >
                      <Save size={16} />
                      저장하기
                    </button>
                  )}
                  {isViewOnly && (
                    <button
                      onClick={() => setIsViewOnly(false)}
                      className="flex-1 py-4 bg-white text-forest font-black text-[11px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-lime transition-all"
                    >
                      수정하기
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Heart size={24} className="text-red-400" />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Emotional Intelligence Hub</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Diary Protocol v1.0.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 저장</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>데이터 보안 암호화</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
