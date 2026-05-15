import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Pencil, 
  Eraser, 
  Trash2, 
  Download, 
  Undo, 
  RotateCcw,
  Palette,
  Droplets,
  Zap,
  CheckCircle2,
  Brush,
  DownloadCloud,
  Maximize,
  History
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = [
  '#ffffff', // White
  '#b1ff1a', // Lime (Vibe color)
  '#3b82f6', // Blue
  '#f87171', // Red
  '#fbbf24', // Amber
  '#8b5cf6', // Violet
  '#2dd4bf', // Teal
  '#ec4899', // Pink
];

export default function AdminWhiteboard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [color, setColor] = useState('#b1ff1a');
  const [history, setHistory] = useState<string[]>([]);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle high DPI screens
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      contextRef.current = ctx;
      
      // Initial white background if needed (optional, keeping it transparent/dark)
      // ctx.fillStyle = '#0a0a0a';
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const handleResize = () => {
      const newRect = canvas.getBoundingClientRect();
      const tempImage = canvas.toDataURL();
      
      canvas.width = newRect.width * 2;
      canvas.height = newRect.height * 2;
      canvas.style.width = `${newRect.width}px`;
      canvas.style.height = `${newRect.height}px`;
      
      const newCtx = canvas.getContext('2d');
      if (newCtx) {
        newCtx.scale(2, 2);
        newCtx.lineCap = 'round';
        newCtx.lineJoin = 'round';
        contextRef.current = newCtx;
        
        const img = new Image();
        img.src = tempImage;
        img.onload = () => {
          newCtx.drawImage(img, 0, 0, newRect.width, newRect.height);
        };
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync Context with State
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      contextRef.current?.closePath();
      setIsDrawing(false);
      saveToHistory();
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    if ('nativeEvent' in e && e.nativeEvent instanceof MouseEvent) {
      return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    } else {
      const touch = (e as React.TouchEvent).touches[0];
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return { offsetX: 0, offsetY: 0 };
      return {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top
      };
    }
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      setHistory(prev => [...prev, canvas.toDataURL()].slice(-20));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHistory([]);
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas with a solid background for the download
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Draw background
    tempCtx.fillStyle = '#0a0a0a';
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    // Draw content
    tempCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = 'whiteboard.png';
    link.href = tempCanvas.toDataURL('image/png');
    link.click();
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">가상 화이트보드</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Creative Canvas v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Brush size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">브러시 엔진 활성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Toolbar */}
        <div className="lg:col-span-3 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                    <Palette size={16} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">캔버스 도구</h3>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">색상 선택</label>
                 <div className="grid grid-cols-4 gap-3">
                    {COLORS.map((c) => (
                       <button
                         key={c}
                         onClick={() => setColor(c)}
                         className={cn(
                           "w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 active:scale-95",
                           color === c ? "border-white" : "border-transparent"
                         )}
                         style={{ backgroundColor: c }}
                       />
                    ))}
                 </div>
              </div>

              {/* Brush Size */}
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">브러시 크기 (px)</label>
                 <div className="space-y-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={lineWidth}
                      onChange={(e) => setLineWidth(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-lime"
                    />
                    <div className="flex items-center justify-between px-2">
                       <span className="text-[10px] font-mono text-white/20">1px</span>
                       <span className="text-sm font-black text-lime">{lineWidth}px</span>
                       <span className="text-[10px] font-mono text-white/20">50px</span>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                 <button
                   onClick={clearCanvas}
                   className="w-full py-4 bg-white/5 text-white/60 hover:text-red-500 hover:bg-red-500/10 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 group"
                 >
                    <Trash2 size={16} className="group-hover:rotate-12 transition-transform" />
                    지우기
                 </button>
                 <button
                   onClick={downloadCanvas}
                   className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
                 >
                    <DownloadCloud size={18} className="group-hover:translate-y-1 transition-transform" />
                    다운로드
                 </button>
              </div>
           </div>

           {/* Canvas Stats */}
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <History size={16} className="text-lime" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">History Log</span>
                 </div>
                 <span className="text-[10px] font-black uppercase text-lime">{history.length} / 20</span>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/30 uppercase">Status</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Right: Canvas Area */}
        <div className="lg:col-span-9 space-y-6">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/20 italic">Live Stream</span>
                 </div>
              </div>
              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/10">
                 <span>{color}</span>
                 <div className="w-px h-2 bg-white/5" />
                 <span>{lineWidth}PX</span>
              </div>
           </div>

           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-lime/20 via-blue-500/10 to-purple-500/10 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative bg-[#0a0a0a] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden cursor-crosshair">
                 <canvas
                   ref={canvasRef}
                   onMouseDown={startDrawing}
                   onMouseMove={draw}
                   onMouseUp={stopDrawing}
                   onMouseLeave={stopDrawing}
                   onTouchStart={startDrawing}
                   onTouchMove={draw}
                   onTouchEnd={stopDrawing}
                   className="w-full h-[600px]"
                 />
                 
                 {/* Canvas Watermark */}
                 <div className="absolute bottom-8 right-10 pointer-events-none select-none flex items-center gap-3 opacity-10 grayscale">
                    <Maximize size={24} className="text-white" />
                    <div className="text-right">
                       <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Infinite Canvas v1.0</p>
                       <p className="text-[8px] font-bold text-white uppercase tracking-[0.3em]">AI Studio Build</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Droplets size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Canvas Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Drawing Protocol v3.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 렌더링 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>레이어 합성 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
