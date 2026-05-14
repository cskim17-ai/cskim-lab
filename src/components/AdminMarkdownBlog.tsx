import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Bold, Italic, Link as LinkIcon, Download, Save, 
  Eye, FileEdit, Layout, Type, Info, CheckCircle2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DEFAULT_MARKDOWN = `# 새로운 블로그 포스트

여기에 내용을 작성해보세요. 마크다운 문법을 지원합니다.

## 기능 특징
- **실시간 미리보기**: 작성과 동시에 오른쪽(또는 아래)에서 확인 가능
- **도구 모음**: 상단 버튼으로 스타일을 빠르게 적용
- **자동 저장**: 작성 중인 내용은 브라우저에 안전하게 보관됩니다.
- **다운로드**: .md 파일로 즉시 저장하세요.

---
> "글쓰기는 생각의 정리입니다."
`;

export default function AdminMarkdownBlog() {
  const [markdown, setMarkdown] = useState<string>(() => {
    const saved = localStorage.getItem('vibe_blog_markdown');
    return saved || DEFAULT_MARKDOWN;
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('vibe_blog_markdown', markdown);
    }, 1000);
    return () => clearTimeout(timer);
  }, [markdown]);

  const handleSave = () => {
    localStorage.setItem('vibe_blog_markdown', markdown);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blog-post-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    
    const newText = text.substring(0, start) + before + selected + after + text.substring(end);
    setMarkdown(newText);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-6 py-4 sm:py-10 px-4 h-[calc(100vh-180px)] flex flex-col"
    >
      {/* Header & Main Toolbar */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between shrink-0">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black italic serif text-white">마크다운 에디터</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Blog Content Creator</p>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center bg-white/5 p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => insertText('**', '**')}
              className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-lime transition-all"
              title="굵게"
            >
              <Bold size={16} />
            </button>
            <button
              onClick={() => insertText('_', '_')}
              className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-lime transition-all"
              title="기울임"
            >
              <Italic size={16} />
            </button>
            <button
              onClick={() => insertText('[', '](https://)')}
              className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-lime transition-all"
              title="링크"
            >
              <LinkIcon size={16} />
            </button>
          </div>

          <div className="h-8 w-[1px] bg-white/10 mx-1" />

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-[10px] font-black text-white/60 hover:text-lime transition-all active:scale-95 shrink-0 uppercase tracking-widest"
          >
            <Download size={14} />
            Download.md
          </button>

          <button
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shrink-0",
              isSaved ? "bg-green-500 text-white" : "bg-lime text-forest hover:bg-[#b0f533]"
            )}
          >
            {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
            {isSaved ? "Saved" : "Save Now"}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Input Pane */}
        <div className="flex flex-col h-full space-y-3">
          <div className="flex items-center gap-2 px-2">
            <FileEdit size={12} className="text-lime" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Code Editor</span>
          </div>
          <div className="flex-1 relative group">
            <textarea
              ref={textareaRef}
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full bg-forest/50 border border-white/10 rounded-[32px] p-8 text-white/80 text-sm font-mono leading-relaxed focus:outline-none focus:border-lime/30 transition-all resize-none shadow-inner custom-scrollbar"
              placeholder="여기에 마크다운을 작성하세요..."
            />
            <div className="absolute top-8 right-8 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity">
              <Type size={40} className="text-white" />
            </div>
          </div>
        </div>

        {/* Preview Pane */}
        <div className="flex flex-col h-full space-y-3">
          <div className="flex items-center gap-2 px-2">
            <Eye size={12} className="text-lime" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Live Preview</span>
          </div>
          <div className="flex-1 bg-white/[0.02] border border-white/10 rounded-[32px] p-8 overflow-y-auto custom-scrollbar shadow-2xl relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 blur-[80px] -translate-y-1/2 translate-x-1/2" />
            <div className="markdown-body prose prose-invert prose-lime max-w-none prose-sm sm:prose-base relative z-10 transition-all duration-300">
              <ReactMarkdown>{markdown || '*미리보기할 내용이 없습니다.*'}</ReactMarkdown>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between gap-4 py-4 shrink-0 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-lime/10 rounded-lg">
            <Info size={10} className="text-lime" />
          </div>
          <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] italic">Vibe Content Engine v2.0</p>
        </div>
        <div className="text-[9px] font-black text-white/10 uppercase tracking-widest tabular-nums italic">
          Chars: {markdown.length} | Lines: {markdown.split('\n').length}
        </div>
      </div>
    </motion.div>
  );
}
