import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Copy, 
  Check, 
  Code2, 
  Trash2, 
  Terminal, 
  Hash, 
  Zap, 
  CheckCircle2,
  Filter,
  FileCode,
  Layout,
  Command
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: number;
}

const LANGUAGES = [
  { name: 'JavaScript', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { name: 'TypeScript', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  { name: 'Python', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  { name: 'HTML/CSS', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  { name: 'JSON', color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  { name: 'Shell', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20' },
  { name: 'Other', color: 'text-white/40 bg-white/5 border-white/10' },
];

export default function AdminSnippetManager() {
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const saved = localStorage.getItem('vibe_code_snippets');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [code, setCode] = useState('');
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem('vibe_code_snippets', JSON.stringify(snippets));
  }, [snippets]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const newSnippet: Snippet = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      language,
      code: code.trim(),
      createdAt: Date.now(),
    };

    setSnippets([newSnippet, ...snippets]);
    setTitle('');
    setCode('');
  };

  const deleteSnippet = (id: string) => {
    setSnippets(prev => prev.filter(s => s.id !== id));
  };

  const copyToClipboard = (snippet: Snippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopyStates({ ...copyStates, [snippet.id]: true });
    setTimeout(() => {
      setCopyStates(prev => ({ ...prev, [snippet.id]: false }));
    }, 2000);
  };

  const filteredSnippets = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return snippets.filter(s => 
      s.title.toLowerCase().includes(query) || 
      s.code.toLowerCase().includes(query) ||
      s.language.toLowerCase().includes(query)
    );
  }, [snippets, searchQuery]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">코드 조각 관리자</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Snippet Protocol v2.5</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Terminal size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">개발자 라이브러리 활성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                    <Plus size={16} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">새 조각 등록</h3>
              </div>

              <form onSubmit={handleSave} className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">제목 (Title)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="예: API 파서 로직"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">언어 (Language)</label>
                    <div className="relative group">
                       <select
                         value={language}
                         onChange={(e) => setLanguage(e.target.value)}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold appearance-none cursor-pointer"
                       >
                          {LANGUAGES.map(lang => (
                             <option key={lang.name} value={lang.name}>{lang.name}</option>
                          ))}
                       </select>
                       <FileCode className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={16} />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">코드 (Source)</label>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="// 여기에 코드를 붙여넣으세요..."
                      rows={8}
                      className="w-full bg-black/40 border border-white/10 rounded-3xl py-6 px-6 text-xs text-lime font-mono focus:outline-none focus:border-lime/50 transition-all resize-none leading-relaxed"
                    />
                 </div>

                 <button
                   type="submit"
                   disabled={!title.trim() || !code.trim()}
                   className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group disabled:opacity-20 mt-4"
                 >
                   <Code2 size={18} className="group-hover:rotate-12 transition-transform" />
                   <span>조각 저장하기</span>
                 </button>
              </form>
           </div>
        </div>

        {/* Right: Content Area */}
        <div className="lg:col-span-8 space-y-8">
           {/* Search & Filter */}
           <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center text-white/20 group-focus-within:text-lime transition-colors">
                 <Search size={20} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="제목, 내용 또는 언어로 검색..."
                className="w-full bg-white/[0.03] border border-white/5 rounded-[32px] py-6 pl-16 pr-8 text-sm text-white focus:outline-none focus:border-white/10 focus:bg-white/[0.05] transition-all"
              />
              <div className="absolute inset-y-0 right-6 flex items-center gap-2">
                 <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black text-white/20 uppercase tracking-widest">
                    <Command size={10} className="inline mr-1" /> F
                 </div>
              </div>
           </div>

           {/* Masonry-style Grid */}
           <div className="columns-1 md:columns-2 gap-6 space-y-6">
              <AnimatePresence mode="popLayout">
                 {filteredSnippets.map((snippet) => {
                    const langInfo = LANGUAGES.find(l => l.name === snippet.language) || LANGUAGES[LANGUAGES.length - 1];
                    const isCopied = copyStates[snippet.id];
                    
                    return (
                       <motion.div
                         key={snippet.id}
                         layout
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.9 }}
                         className="break-inside-avoid glass border border-white/5 bg-forest/20 p-8 rounded-[40px] space-y-6 hover:border-white/10 transition-all group relative overflow-hidden flex flex-col"
                       >
                          <div className="flex items-start justify-between">
                             <div className="space-y-2 max-w-[70%]">
                                <p className={cn("inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", langInfo.color)}>
                                   {snippet.language}
                                </p>
                                <h4 className="text-xl font-black italic serif text-white leading-tight">
                                   {snippet.title}
                                </h4>
                             </div>
                             <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteSnippet(snippet.id)}
                                  className="p-3 bg-red-500/0 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                   <Trash2 size={16} />
                                </button>
                             </div>
                          </div>

                          <div className="relative group/code">
                             <div className="bg-black/60 rounded-3xl p-6 text-[11px] font-mono leading-relaxed text-lime/80 overflow-hidden max-h-[300px] relative scrollbar-hide">
                                <pre className="whitespace-pre-wrap">{snippet.code}</pre>
                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                             </div>
                             
                             <button
                               onClick={() => copyToClipboard(snippet)}
                               className={cn(
                                 "absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl transition-all shadow-xl font-black text-[10px] uppercase tracking-widest border",
                                 isCopied 
                                   ? "bg-lime border-lime text-forest" 
                                   : "bg-white/10 border-white/10 text-white/40 hover:bg-white/20 hover:text-white"
                               )}
                             >
                                {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                <span>{isCopied ? '복사됨!' : 'Copy'}</span>
                             </button>
                          </div>

                          <div className="flex items-center justify-between px-2 text-[9px] font-bold text-white/10 uppercase tracking-[0.2em]">
                             <span>ID_{snippet.id}</span>
                             <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                          </div>

                          {/* Decorative Watermark */}
                          <div className="absolute -bottom-8 -right-8 opacity-[0.03] pointer-events-none transform rotate-12 group-hover:scale-125 transition-transform duration-1000">
                             <Hash size={120} />
                          </div>
                       </motion.div>
                    );
                 })}
              </AnimatePresence>

              {filteredSnippets.length === 0 && (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[60px]">
                   <Layout size={64} strokeWidth={1} />
                   <div className="space-y-2">
                     <p className="text-sm font-black uppercase tracking-[0.4em]">Snippet Library Empty</p>
                     <p className="text-[10px] italic font-bold opacity-30 mt-2">저장된 코드 조각이 없거나 검색 결과가 없습니다</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Code2 size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Developer Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Codebase Protocol v1.2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>로컬 스토리지 동기화 완료</span>
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </motion.div>
  );
}
