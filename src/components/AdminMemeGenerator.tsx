import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Download, 
  Image as ImageIcon, 
  Type, 
  RefreshCw, 
  CheckCircle2, 
  Zap,
  Layout,
  Upload,
  DownloadCloud
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminMemeGenerator() {
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateMeme = () => {
    if (!image || !canvasRef.current) return;
    
    setIsGenerating(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image;
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const maxWidth = 800;
      const scale = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      // Draw Image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Text Styles
      const fontSize = Math.floor(canvas.width / 12);
      ctx.font = `black ${fontSize}px Impact, sans-serif`;
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = fontSize / 15;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Draw Top Text
      if (topText) {
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      }

      // Draw Bottom Text
      ctx.textBaseline = 'bottom';
      if (bottomText) {
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      }
      
      setIsGenerating(false);
    };
    imageRef.current = img;
  };

  const downloadMeme = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'meme.png';
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  useEffect(() => {
    if (image) {
      generateMeme();
    }
  }, [image, topText, bottomText]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">사진 밈 생성기</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Meme Engine v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <ImageIcon size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">크리에이티브 스튜디오 활성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Controls */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-10 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                    <Plus size={20} />
                 </div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">밈 제작 설정</h3>
              </div>

              <div className="space-y-6">
                 {/* Image Upload */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">이미지 선택</label>
                    <label className="w-full flex flex-col items-center justify-center gap-4 py-8 bg-black/20 border-2 border-dashed border-white/5 hover:border-lime/30 rounded-[32px] cursor-pointer transition-all group overflow-hidden relative">
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                       <Upload className="text-white/20 group-hover:text-lime transition-colors" size={32} />
                       <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                          {image ? '다른 이미지 선택' : '클릭하여 이미지 업로드'}
                       </span>
                       {image && <div className="absolute inset-0 bg-lime/5 pointer-events-none" />}
                    </label>
                 </div>

                 {/* Text Inputs */}
                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">상단 텍스트 (Top Text)</label>
                       <div className="relative group">
                          <input
                            type="text"
                            value={topText}
                            onChange={(e) => setTopText(e.target.value)}
                            placeholder="상단에 들어갈 문구를 입력하세요"
                            className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 font-bold"
                          />
                          <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">하단 텍스트 (Bottom Text)</label>
                       <div className="relative group">
                          <input
                            type="text"
                            value={bottomText}
                            onChange={(e) => setBottomText(e.target.value)}
                            placeholder="하단에 들어갈 문구를 입력하세요"
                            className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 font-bold"
                          />
                          <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={generateMeme}
                      disabled={!image || isGenerating}
                      className="flex-1 py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20"
                    >
                      {isGenerating ? <RefreshCw size={20} className="animate-spin" /> : <Zap size={20} className="group-hover:rotate-12 transition-transform" />}
                      <span>밈 재생성</span>
                    </button>
                    <button
                      onClick={downloadMeme}
                      disabled={!image || isGenerating}
                      className="flex-1 py-4 bg-white text-forest font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 group disabled:opacity-20"
                    >
                      <DownloadCloud size={20} className="group-hover:translate-y-1 transition-transform" />
                      <span>다운로드</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Canvas Preview */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
           <div className="w-full relative group">
              {/* Canvas Preview Container */}
              <div className="glass rounded-[60px] border border-white/10 bg-black/40 p-10 flex flex-col items-center justify-center min-h-[500px] overflow-hidden relative shadow-2xl">
                 <AnimatePresence mode="wait">
                    {image ? (
                       <motion.div
                         key="canvas-container"
                         initial={{ opacity: 0, scale: 0.95 }}
                         animate={{ opacity: 1, scale: 1 }}
                         exit={{ opacity: 0, scale: 0.95 }}
                         className="relative w-full flex items-center justify-center"
                       >
                          <canvas 
                            ref={canvasRef} 
                            className="max-w-full h-auto rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/10"
                          />
                          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                                <Activity size={10} className="text-lime animate-pulse" />
                                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">렌더링 준비됨</span>
                             </div>
                          </div>
                       </motion.div>
                    ) : (
                       <motion.div
                         key="empty"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="flex flex-col items-center justify-center text-center space-y-8"
                       >
                          <div className="w-32 h-32 rounded-[50px] bg-white/[0.03] flex items-center justify-center text-white/10 group-hover:scale-110 transition-transform duration-700">
                             <ImageIcon size={64} strokeWidth={1} />
                          </div>
                          <div className="space-y-4">
                             <h3 className="text-2xl font-black italic serif text-white/20 tracking-tight">PREVIEW ENGINE IDLE</h3>
                             <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] max-w-[300px] leading-relaxed">
                                이미지를 업로드하고 텍스트를 입력하여 나만의 커스텀 밈을 실시간으로 확인하세요
                             </p>
                          </div>
                       </motion.div>
                    )}
                 </AnimatePresence>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-6 -right-6 flex items-center gap-4 pointer-events-none opacity-20">
                 <Layout size={100} strokeWidth={0.5} className="text-white" />
              </div>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Download size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Creative Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Meme Synthesis v1.5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 캔버스 렌더링 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>PNG 내보내기 프로토콜 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const Activity = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);
