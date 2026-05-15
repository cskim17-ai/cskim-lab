import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, ChevronRight, Maximize2, 
  Image as ImageIcon, Download, Share2, Info,
  Search, Grid3X3, Layers
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ArtPiece {
  id: number;
  url: string;
  title: string;
  artist: string;
  category: string;
}

const GALLERY_IMAGES: ArtPiece[] = [
  { id: 1, url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop', title: 'Eternal Bloom', artist: 'Elena Rose', category: 'Abstract' },
  { id: 2, url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=1000&auto=format&fit=crop', title: 'City of Gold', artist: 'Marcus Vain', category: 'Urban' },
  { id: 3, url: 'https://images.unsplash.com/photo-1501472312651-726afe119ff1?q=80&w=1000&auto=format&fit=crop', title: 'Silent Peak', artist: 'Hana Lee', category: 'Nature' },
  { id: 4, url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=1000&auto=format&fit=crop', title: 'Nebula Drift', artist: 'Orion Sky', category: 'Cosmic' },
  { id: 5, url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1000&auto=format&fit=crop', title: 'Neon Pulse', artist: 'Cyber D.', category: 'Future' },
  { id: 6, url: 'https://images.unsplash.com/photo-1515405299443-673bb958b9ad?q=80&w=1000&auto=format&fit=crop', title: 'Oceanic Whisp', artist: 'Marina Blue', category: 'Abstract' },
  { id: 7, url: 'https://images.unsplash.com/photo-1459749411177-042180ec75ff?q=80&w=1000&auto=format&fit=crop', title: 'Urban Jungle', artist: 'Leo Green', category: 'Urban' },
  { id: 8, url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop', title: 'Sunset Echo', artist: 'Sarah Sun', category: 'Nature' },
  { id: 9, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop', title: 'Glass Garden', artist: 'Iris Flow', category: 'Abstract' },
  { id: 10, url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', title: 'Monochrome Shift', artist: 'Gray Scale', category: 'Minimal' },
  { id: 11, url: 'https://images.unsplash.com/photo-1547891301-15a50bcee24e?q=80&w=1000&auto=format&fit=crop', title: 'Digital Era', artist: 'Bit Master', category: 'Tech' },
  { id: 12, url: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=1000&auto=format&fit=crop', title: 'Vivid Mind', artist: 'Nova Red', category: 'Abstract' },
];

export default function AdminVirtualGallery() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...new Set(GALLERY_IMAGES.map(img => img.category))];
  const filteredImages = filter === 'All' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(img => img.category === filter);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % filteredImages.length);
  }, [selectedIndex, filteredImages.length]);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + filteredImages.length) % filteredImages.length);
  }, [selectedIndex, filteredImages.length]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    if (e.key === 'Escape') setSelectedIndex(null);
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
  }, [selectedIndex, handleNext, handlePrev]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6 md:px-0 min-h-screen"
    >
      {/* Header & Filter */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">가상 갤러리</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">몰입형 예술 경험 v1.2</p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 bg-white/5 p-2 rounded-2xl sm:rounded-3xl border border-white/10 shrink-0 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setSelectedIndex(null);
              }}
              className={cn(
                "px-5 py-3 rounded-xl sm:rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                filter === cat ? "bg-lime text-forest shadow-xl shadow-lime/20 scale-105" : "text-white/40 hover:text-white/60 hover:bg-white/5"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredImages.map((img, index) => (
          <motion.div
            key={img.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="group relative glass rounded-[32px] border border-white/5 overflow-hidden cursor-pointer aspect-square"
            onClick={() => setSelectedIndex(index)}
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
            
            <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-[10px] font-black text-lime uppercase tracking-widest mb-1">{img.category}</p>
              <h3 className="text-sm font-black text-white italic leading-tight">{img.title}</h3>
              <p className="text-[10px] text-white/40 font-bold mt-1">by {img.artist}</p>
            </div>

            <div className="absolute top-6 right-6 p-2.5 bg-black/40 backdrop-blur-md rounded-2xl text-white opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 border border-white/10">
              <Maximize2 size={16} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-12 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-forest/95 backdrop-blur-2xl"
              onClick={() => setSelectedIndex(null)}
            />

            <button 
              onClick={() => setSelectedIndex(null)}
              className="absolute top-8 right-8 z-[110] p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl text-white transition-all active:scale-90"
            >
              <X size={24} />
            </button>

            {/* Navigation */}
            <div className="absolute left-4 sm:left-12 top-1/2 -translate-y-1/2 z-[110]">
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                className="p-5 bg-white/5 hover:bg-lime hover:text-forest border border-white/10 rounded-full text-white transition-all active:scale-90 backdrop-blur-md shadow-2xl"
              >
                <ChevronLeft size={32} strokeWidth={3} />
              </button>
            </div>
            
            <div className="absolute right-4 sm:right-12 top-1/2 -translate-y-1/2 z-[110]">
              <button 
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="p-5 bg-white/5 hover:bg-lime hover:text-forest border border-white/10 rounded-full text-white transition-all active:scale-90 backdrop-blur-md shadow-2xl"
              >
                <ChevronRight size={32} strokeWidth={3} />
              </button>
            </div>

            <motion.div
              key={filteredImages[selectedIndex].id}
              initial={{ opacity: 0, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: -20 }}
              className="relative z-[105] w-full h-full flex flex-col items-center justify-center gap-8 pointer-events-none"
            >
              <div className="relative group/main max-w-full max-h-[70vh] pointer-events-auto shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
                <img 
                  src={filteredImages[selectedIndex].url} 
                  alt={filteredImages[selectedIndex].title}
                  className="max-w-full max-h-[70vh] object-contain rounded-2xl"
                />
              </div>

              <div className="text-center space-y-2 max-w-xl pointer-events-auto">
                <p className="text-xs font-black text-lime uppercase tracking-[0.4em] mb-4">선택된 작품</p>
                <h2 className="text-3xl sm:text-5xl font-black italic serif text-white tracking-tighter">
                  {filteredImages[selectedIndex].title}
                </h2>
                <div className="flex items-center justify-center gap-4 text-white/40">
                  <span className="h-[1px] w-8 bg-current" />
                  <p className="text-xs font-bold uppercase tracking-widest">{filteredImages[selectedIndex].artist}</p>
                  <span className="h-[1px] w-8 bg-current" />
                </div>
                <div className="pt-8 flex items-center justify-center gap-4">
                  <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] font-black text-white/20 uppercase tracking-widest tabular-nums">
                    {selectedIndex + 1} / {filteredImages.length}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Bottom Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5 z-[110]">
               <motion.div 
                 className="h-full bg-lime shadow-[0_0_20px_rgba(163,230,53,0.5)]"
                 initial={{ width: 0 }}
                 animate={{ width: `${((selectedIndex + 1) / filteredImages.length) * 100}%` }}
               />
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-white/5 text-white/10">
         <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Visual Curation</p>
            <div className="h-[1px] w-8 bg-current" />
         </div>
         <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-1.5">
               <Grid3X3 size={10} />
               <span>Dynamic Grid Active</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Layers size={10} />
               <span>Layer Engine v2.4</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
