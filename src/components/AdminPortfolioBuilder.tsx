import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, Plus, Trash2, 
  ExternalLink, Layout, Eye, Settings,
  ArrowRight, Github, Globe, Linkedin,
  ChevronRight, Smartphone, Monitor,
  Sparkles, MousePointer2, Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
}

export default function AdminPortfolioBuilder() {
  const [name, setName] = useState('내 이름');
  const [bio, setBio] = useState('가치 있는 애플리케이션을 만드는 열정적인 개발자입니다.');
  const [projects, setProjects] = useState<Project[]>([
    { id: '1', title: '예시 프로젝트', description: '제가 만든 놀라운 프로젝트에 대한 간략한 설명입니다.', link: '#' }
  ]);

  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjLink, setNewProjLink] = useState('');

  const introRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addProject = () => {
    if (!newProjTitle || !newProjDesc) return;
    const newProj: Project = {
      id: Math.random().toString(36).substr(2, 9),
      title: newProjTitle,
      description: newProjDesc,
      link: newProjLink || '#'
    };
    setProjects([...projects, newProj]);
    setNewProjTitle('');
    setNewProjDesc('');
    setNewProjLink('');
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-forest/20 rounded-[48px] overflow-hidden border border-white/5">
      
      {/* Sidebar Editor */}
      <aside className="w-full lg:w-[400px] border-r border-white/5 flex flex-col bg-forest/40">
        <div className="p-8 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-pink-500/20 rounded-xl text-pink-500">
                <Settings size={20} />
             </div>
             <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest italic">포트폴리오 에디터</h3>
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">실시간 커스터마이징</p>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
           {/* Section: Profile */}
           <div className="space-y-6">
              <div className="flex items-center gap-2 px-2">
                 <User size={14} className="text-white/20" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">기본 정보</span>
              </div>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">표시 이름</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="이름을 입력하세요"
                      className="w-full bg-forest border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">자기 소개</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="간단한 소개 문구를 입력하세요..."
                      rows={3}
                      className="w-full bg-forest border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section: Project Forge */}
           <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 px-2">
                 <Briefcase size={14} className="text-white/20" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">프로젝트 생성</span>
              </div>
              <div className="space-y-4">
                 <input
                   type="text"
                   value={newProjTitle}
                   onChange={(e) => setNewProjTitle(e.target.value)}
                   placeholder="프로젝트 제목"
                   className="w-full bg-forest border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                 />
                 <textarea
                   value={newProjDesc}
                   onChange={(e) => setNewProjDesc(e.target.value)}
                   placeholder="짧은 설명"
                   rows={2}
                   className="w-full bg-forest border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all resize-none"
                 />
                 <input
                   type="text"
                   value={newProjLink}
                   onChange={(e) => setNewProjLink(e.target.value)}
                   placeholder="링크 (Github/라이브)"
                   className="w-full bg-forest border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all"
                 />
                 <button
                   onClick={addProject}
                   className="w-full py-4 bg-pink-500 text-white font-black rounded-2xl hover:bg-pink-400 active:scale-95 transition-all shadow-xl shadow-pink-500/20 flex items-center justify-center gap-3 group"
                 >
                   <Plus size={20} className="group-hover:rotate-90 transition-transform duration-500" />
                   <span className="uppercase tracking-widest text-xs">프로젝트 추가</span>
                 </button>
              </div>
           </div>

           {/* Active Projects List Mini */}
           <div className="space-y-3">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">활성 프로젝트 목록</span>
              <AnimatePresence>
                {projects.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex justify-between items-center p-3 bg-white/5 rounded-2xl border border-white/5 group"
                  >
                    <span className="text-xs font-bold text-white/60 italic px-2 truncate">{p.title}</span>
                    <button onClick={() => removeProject(p.id)} className="p-2 text-white/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                       <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
           </div>
        </div>
      </aside>

      {/* Preview Area */}
      <main className="flex-1 overflow-y-auto relative bg-[#0a0a0a] min-h-[600px] flex flex-col group/preview">
        {/* Preview Frame Decoration */}
        <div className="sticky top-0 z-50 w-full bg-black/40 backdrop-blur-md border-b border-white/5 flex flex-col sm:flex-row items-center justify-between px-6 sm:px-10 py-4 gap-4">
           <div className="flex items-center gap-6 sm:gap-8">
              <button onClick={() => scrollTo(introRef)} className="text-[11px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors italic">소개</button>
              <button onClick={() => scrollTo(projectsRef)} className="text-[11px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors italic">프로젝트</button>
           </div>
           <div className="flex items-center gap-4 text-white/20">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">라이브 브로드캐스트</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <Monitor size={16} />
              </div>
           </div>
        </div>

        {/* Portfolio Content */}
        <div className="flex-1 max-w-4xl mx-auto w-full py-16 sm:py-24 px-6 sm:px-10 space-y-24 sm:space-y-32">
           
           {/* Section 1: Intro */}
           <motion.section 
             ref={introRef}
             layout
             className="space-y-8 flex flex-col items-center text-center"
           >
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-tr from-pink-500 to-violet-500 rounded-full flex items-center justify-center border-4 border-white/10 shadow-3xl relative overflow-hidden group">
                 <User size={56} className="text-white group-hover:scale-110 transition-transform duration-700" />
                 <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              
              <div className="space-y-6">
                 <motion.h1 
                    layout
                    className="text-5xl sm:text-7xl font-black italic serif text-white tracking-tighter"
                 >
                    {name || '내 이름'}
                 </motion.h1>
                 <motion.p 
                    layout
                    className="text-lg sm:text-2xl text-white/40 font-medium max-w-2xl leading-relaxed"
                 >
                    {bio || '소개 미리보기...'}
                 </motion.p>
              </div>

              <div className="flex items-center gap-6 pt-4">
                 <Github size={20} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
                 <Globe size={20} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
                 <Linkedin size={20} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
              </div>
           </motion.section>

           {/* Section 2: Projects */}
           <motion.section 
             ref={projectsRef}
             layout
             className="space-y-12"
           >
              <div className="flex items-end justify-between border-b border-white/10 pb-6">
                 <div>
                    <h2 className="text-3xl font-black italic serif text-white tracking-tight">최근 작업물</h2>
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold mt-2">엄선된 프로젝트 하이라이트</p>
                 </div>
                 <div className="text-pink-500">
                    <Layers size={24} />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <AnimatePresence mode="popLayout">
                    {projects.map((proj) => (
                      <motion.div
                        key={proj.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group bg-white/5 rounded-[32px] p-8 border border-white/5 hover:border-pink-500/30 transition-all duration-500 flex flex-col justify-between min-h-[220px] relative overflow-hidden"
                      >
                        <div className="space-y-4 relative z-10">
                           <h4 className="text-2xl font-black italic serif text-white underline decoration-pink-500/20 underline-offset-8">
                              {proj.title}
                           </h4>
                           <p className="text-sm font-medium text-white/40 leading-relaxed">
                              {proj.description}
                           </p>
                        </div>
                        
                        <div className="pt-8 relative z-10">
                           <a 
                             href={proj.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase text-white tracking-widest hover:bg-white/10 transition-colors"
                           >
                             프로젝트 보기
                             <ExternalLink size={12} className="text-pink-500" />
                           </a>
                        </div>

                        {/* Decoration */}
                        <div className="absolute top-0 right-0 p-8 text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                           <Briefcase size={80} strokeWidth={1} />
                        </div>
                      </motion.div>
                    ))}
                 </AnimatePresence>
                 
                 {projects.length === 0 && (
                   <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/5 border-2 border-dashed border-white/5 rounded-[48px]">
                      <Layout size={64} strokeWidth={1} />
                      <p className="text-sm font-black uppercase tracking-[0.4em] mt-4 italic">표시할 프로젝트가 없습니다</p>
                   </div>
                 )}
              </div>
           </motion.section>
        </div>

        {/* Bottom Banner */}
        <footer className="mt-auto py-20 px-10 border-t border-white/5 flex flex-col items-center text-center space-y-8 bg-black/20">
           <div className="space-y-2">
              <h3 className="text-xl font-black italic serif text-white">함께 멋진 미래를 만들어가요.</h3>
              <p className="text-[10px] text-white/20 uppercase tracking-widest">지금 바로 연락주세요</p>
           </div>
           <div className="flex flex-wrap justify-center gap-4">
              <div className="px-8 py-4 bg-pink-500 text-white font-black rounded-3xl text-xs uppercase tracking-widest shadow-2xl shadow-pink-500/20">
                 문의하기
              </div>
           </div>
        </footer>

        {/* Mouse Tip (Visual) */}
        <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 opacity-20 pointer-events-none">
           <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-widest italic">커서 포커스 프로토콜</span>
              <MousePointer2 size={12} />
           </div>
           <p className="text-[10px] font-bold text-white/40">캔버스 상호작용 활성화됨</p>
        </div>
      </main>

    </div>
  );
}
