import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Terminal, 
  BookMarked, 
  Sparkles, 
  Trash2, 
  MessageSquarePlus,
  Zap,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Prompt {
  id: string;
  title: string;
  text: string;
  category?: string;
}

export default function AdminPromptLibrary() {
  const [prompts, setPrompts] = useState<Prompt[]>(() => {
    const saved = localStorage.getItem('vibe_prompt_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vibe_prompt_library', JSON.stringify(prompts));
  }, [prompts]);

  const handleAddPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !text.trim()) return;

    const newPrompt: Prompt = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      text: text.trim(),
    };

    setPrompts([newPrompt, ...prompts]);
    setTitle('');
    setText('');
  };

  const handleCopy = async (prompt: Prompt) => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopiedId(prompt.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const deletePrompt = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const filteredPrompts = useMemo(() => {
    return prompts.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [prompts, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">프롬프트 라이브러리</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Linguistic Protocol v4.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <BookMarked size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">저장됨: {prompts.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Search & Add Form */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
          {/* Search Box */}
          <div className="glass rounded-[32px] border border-white/10 p-6 bg-forest/20">
             <div className="relative group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="프롬프트 검색..."
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                   <Filter size={14} className="text-white/20" />
                </div>
             </div>
          </div>

          {/* Add Form */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                <MessageSquarePlus size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">새 프롬프트 추가</h3>
            </div>

            <form onSubmit={handleAddPrompt} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="프롬프트 제목 (Prompt Title)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 font-bold"
                />
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>
              <div className="relative group">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="프롬프트 내용을 입력하세요... (Prompt Content)"
                  rows={6}
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl p-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 resize-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span>라이브러리에 추가</span>
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 px-8 py-6 rounded-[32px] bg-white/[0.02] border border-white/5 opacity-40">
             <Sparkles size={20} className="text-lime shrink-0" />
             <p className="text-[11px] font-bold leading-relaxed italic">자주 사용하는 명령어나 AI 지침을 보관하고 필요할 때마다 즉시 복사하여 사용하세요.</p>
          </div>
        </div>

        {/* Right: Prompt List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Linguistic Archive</h3>
            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest font-mono">
              Displaying {filteredPrompts.length} of {prompts.length} Items
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPrompts.map((prompt) => (
                <motion.div
                  key={prompt.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group p-6 rounded-[32px] border border-white/10 bg-white/5 hover:border-lime/30 transition-all duration-300 relative"
                >
                   <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="space-y-1 flex-1 min-w-0">
                         <h4 className="text-xl font-black serif italic tracking-tighter text-white truncate">
                            {prompt.title}
                         </h4>
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest font-mono">ID: {prompt.id}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <button
                           onClick={() => handleCopy(prompt)}
                           className={cn(
                             "flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                             copiedId === prompt.id 
                               ? "bg-lime text-forest" 
                               : "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-900/40"
                           )}
                         >
                            {copiedId === prompt.id ? (
                               <>
                                  <Check size={14} />
                                  <span>복사됨!</span>
                               </>
                            ) : (
                               <>
                                  <Copy size={14} />
                                  <span>복사하기</span>
                               </>
                            )}
                         </button>
                         <button
                           onClick={() => deletePrompt(prompt.id)}
                           className="p-3 rounded-2xl bg-white/5 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                         >
                            <Trash2 size={16} />
                         </button>
                      </div>
                   </div>

                   <div className="relative">
                      <div className="absolute inset-0 bg-transparent pointer-events-none group-hover:bg-lime/5 transition-colors rounded-2xl" />
                      <div className="p-5 bg-black/40 rounded-2xl border border-white/5 group-hover:border-lime/10 transition-all">
                        <p className="text-sm text-white/60 leading-relaxed font-mono whitespace-pre-wrap line-clamp-3 group-hover:line-clamp-none transition-all cursor-text select-all">
                           {prompt.text}
                        </p>
                      </div>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPrompts.length === 0 && (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                 <Terminal size={64} strokeWidth={1} />
                 <div>
                   <p className="text-sm font-black uppercase tracking-[0.4em]">프롬프트를 찾을 수 없습니다</p>
                   <p className="text-[10px] italic font-bold max-w-[200px] mx-auto opacity-50 mt-2">검색어를 수정하거나 새로운 프롬프트를 추가하여 라이브러리를 구축하세요.</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Terminal size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Linguistic Asset Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Knowledge Base v1.2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>Sync Status: Green</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
