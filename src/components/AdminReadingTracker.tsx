import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Book, 
  Hash, 
  TrendingUp, 
  Library,
  Trash2,
  Edit3,
  Zap,
  Bookmark
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RecordedBook {
  id: string;
  title: string;
  totalPages: number;
  readPages: number;
}

export default function AdminReadingTracker() {
  const [books, setBooks] = useState<RecordedBook[]>(() => {
    const saved = localStorage.getItem('vibe_reading_tracker');
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [updateVal, setUpdateVal] = useState('');

  useEffect(() => {
    localStorage.setItem('vibe_reading_tracker', JSON.stringify(books));
  }, [books]);

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !totalPages || Number(totalPages) <= 0) return;

    const newBook: RecordedBook = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      totalPages: Number(totalPages),
      readPages: 0,
    };

    setBooks([newBook, ...books]);
    setTitle('');
    setTotalPages('');
  };

  const handleUpdateProgress = (id: string) => {
    const readToday = Number(updateVal);
    if (isNaN(readToday) || readToday < 0) return;

    setBooks(prev => prev.map(book => {
      if (book.id === id) {
        const nextPages = Math.min(book.totalPages, book.readPages + readToday);
        return { ...book, readPages: nextPages };
      }
      return book;
    }));
    
    setIsUpdating(null);
    setUpdateVal('');
  };

  const deleteBook = (id: string) => {
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">독서 기록 관리기</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Knowledge Protocol v3.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Library size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">보유 도서: {books.length}권</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Add Book Form */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                <Plus size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">새 도서 추가</h3>
            </div>

            <form onSubmit={handleAddBook} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="도서 제목 (Book Title)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Book className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>
              <div className="relative group">
                <input
                  type="number"
                  value={totalPages}
                  onChange={(e) => setTotalPages(e.target.value)}
                  placeholder="전체 페이지 (Total Pages)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
              >
                <BookOpen size={18} className="group-hover:scale-125 transition-transform" />
                <span>도서 목록에 추가</span>
              </button>
            </form>
          </div>

          <div className="glass rounded-[40px] border border-white/10 p-8 bg-forest/20 space-y-4">
             <div className="flex items-center gap-3">
               <TrendingUp size={16} className="text-sky-400" />
               <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">지식 습득 엔진 통계</p>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">총 완독</p>
                   <p className="text-2xl font-black text-white italic">{books.filter(b => b.readPages >= b.totalPages && b.totalPages > 0).length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                   <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">진행 중</p>
                   <p className="text-2xl font-black text-lime italic">{books.filter(b => b.readPages < b.totalPages).length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Books List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Library Index</h3>
            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Manage your cognitive assets</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {books.map((book) => {
                const isFinished = book.readPages >= book.totalPages && book.totalPages > 0;
                const progress = Math.min(100, (book.readPages / book.totalPages) * 100);

                return (
                  <motion.div
                    key={book.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "p-6 rounded-[32px] border transition-all duration-300 relative group flex flex-col justify-between min-h-[220px]",
                      isFinished 
                        ? "bg-white border-white shadow-xl shadow-white/5" 
                        : "bg-forest/40 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-start justify-between">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <Bookmark size={14} className={cn(isFinished ? "text-forest" : "text-lime")} />
                             <span className={cn("text-[9px] font-black uppercase tracking-widest", isFinished ? "text-forest/40" : "text-white/20")}>
                                {isFinished ? "COMPLETED" : "IN PROGRESS"}
                             </span>
                          </div>
                          <h4 className={cn("text-xl font-black serif italic tracking-tighter leading-tight", isFinished ? "text-forest" : "text-white")}>
                             {book.title}
                          </h4>
                       </div>
                       {isFinished && (
                          <div className="w-10 h-10 rounded-full bg-lime border-4 border-white flex items-center justify-center text-forest animate-bounce">
                             <CheckCircle2 size={24} strokeWidth={3} />
                          </div>
                       )}
                    </div>

                    <div className="space-y-4">
                       <div className="flex items-end justify-between">
                          <div className="space-y-1">
                             <p className={cn("text-[8px] font-black uppercase tracking-widest", isFinished ? "text-forest/20" : "text-white/10")}>성취도</p>
                             <p className={cn("text-lg font-black tabular-nums italic", isFinished ? "text-forest" : "text-lime")}>
                                {book.readPages} <span className="text-[10px] opacity-40 font-bold not-italic">/ {book.totalPages} pages</span>
                             </p>
                          </div>
                          <span className={cn("text-[10px] font-black italic", isFinished ? "text-forest/40" : "text-white/20")}>
                             {Math.round(progress)}%
                          </span>
                       </div>

                       <div className={cn("h-2 rounded-full overflow-hidden", isFinished ? "bg-forest/5" : "bg-white/5")}>
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             className={cn("h-full transition-all duration-1000", isFinished ? "bg-forest" : "bg-lime")} 
                          />
                       </div>

                       <div className="flex items-center gap-2">
                          <button
                            onClick={() => setIsUpdating(book.id)}
                            className={cn(
                              "flex-1 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2",
                              isFinished 
                                ? "bg-forest/5 text-forest hover:bg-forest/10" 
                                : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/5"
                            )}
                          >
                             <Edit3 size={14} />
                             업데이트
                          </button>
                          <button
                            onClick={() => deleteBook(book.id)}
                            className={cn(
                               "w-12 py-3 rounded-2xl transition-all active:scale-95 flex items-center justify-center",
                               isFinished 
                                 ? "bg-red-50 text-red-500 hover:bg-red-100" 
                                 : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            )}
                          >
                             <Trash2 size={14} />
                          </button>
                       </div>
                    </div>

                    <AnimatePresence>
                       {isUpdating === book.id && (
                          <motion.div
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="absolute inset-0 z-20 bg-forest/95 backdrop-blur-md rounded-[32px] p-8 flex flex-col justify-center items-center text-center space-y-6"
                          >
                             <div className="space-y-1">
                                <h5 className="text-white font-black text-lg">오늘 얼마나 읽으셨나요?</h5>
                                <p className="text-[10px] text-white/30 uppercase tracking-widest">읽은 페이지 수를 입력하세요</p>
                             </div>
                             <input
                               autoFocus
                               type="number"
                               value={updateVal}
                               onChange={(e) => setUpdateVal(e.target.value)}
                               placeholder="예: 25"
                               className="w-full max-w-[120px] bg-white/5 border border-white/10 rounded-2xl py-4 text-center text-2xl font-black text-white focus:outline-none focus:border-lime/50"
                             />
                             <div className="flex items-center gap-2 w-full">
                                <button
                                  onClick={() => setIsUpdating(null)}
                                  className="flex-1 py-4 bg-white/5 text-white/40 font-black text-[10px] uppercase tracking-widest rounded-2xl"
                                >
                                   취소
                                </button>
                                <button
                                  onClick={() => handleUpdateProgress(book.id)}
                                  className="flex-1 py-4 bg-lime text-forest font-black text-[10px] uppercase tracking-widest rounded-2xl"
                                >
                                   저장
                                </button>
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {books.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                 <BookOpen size={64} strokeWidth={1} />
                 <div>
                   <p className="text-sm font-black uppercase tracking-[0.4em]">도서 목록이 비어 있습니다</p>
                   <p className="text-[10px] italic font-bold">첫 번째 독서 기록을 추가해 보세요</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Book size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Cognitive Asset Manager</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Reading Protocol v3.0.1</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>로컬 스토리지 동기화</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>자동 세이브 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
