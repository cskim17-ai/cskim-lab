import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  X, 
  Filter, 
  Maximize2, 
  Trash2, 
  Layers,
  Zap,
  CheckCircle2,
  Camera
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Photo {
  id: string;
  src: string;
  category: string;
  timestamp: number;
}

export default function AdminPhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('vibe_photo_gallery');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadSrc, setUploadSrc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('vibe_photo_gallery', JSON.stringify(photos));
  }, [photos]);

  const categories = useMemo(() => {
    const cats = new Set(photos.map(p => p.category));
    return ['All', ...Array.from(cats)].sort();
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'All') return photos;
    return photos.filter(p => p.category === activeFilter);
  }, [photos, activeFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadSrc) return;

    const newPhoto: Photo = {
      id: Math.random().toString(36).substr(2, 9),
      src: uploadSrc,
      category: uploadCategory.trim() || 'General',
      timestamp: Date.now()
    };

    setPhotos([newPhoto, ...photos]);
    setUploadSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deletePhoto = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setPhotos(prev => prev.filter(p => p.id !== id));
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">사진 갤러리</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Visual Archive v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <ImageIcon size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">이미지: {photos.length}개</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload Form & Category Filters */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
          {/* Upload Form */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6 bg-forest/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                <Upload size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">새 이미지 업로드</h3>
            </div>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative group cursor-pointer border-2 border-dashed border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-lime/50 hover:bg-lime/5 transition-all overflow-hidden"
              >
                {uploadSrc ? (
                  <img src={uploadSrc} alt="Preview" className="w-full h-48 object-cover rounded-2xl" />
                ) : (
                  <>
                    <Camera size={32} className="text-white/20 group-hover:text-lime transition-colors" />
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">이미지를 선택하거나 클릭하세요</p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="relative group">
                <input
                  type="text"
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  placeholder="카테고리 (예: 풍경, 인물...)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>

              <button
                type="submit"
                disabled={!uploadSrc}
                className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group disabled:opacity-20"
              >
                <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                <span>갤러리에 추가</span>
              </button>
            </form>
          </div>

          {/* Category Filters */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                <Filter size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">카테고리 필터</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                    activeFilter === cat 
                      ? "bg-blue-400 border-blue-400 text-white shadow-lg shadow-blue-400/20" 
                      : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Gallery Grid */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Photo Archive</h3>
            <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Viewing {activeFilter} Content</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredPhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group aspect-square rounded-[32px] overflow-hidden relative border border-white/5 cursor-pointer shadow-xl hover:border-lime/30 transition-all duration-500"
                >
                  <img 
                    src={photo.src} 
                    alt={photo.category} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <p className="text-[8px] font-black text-lime uppercase tracking-widest">{photo.category}</p>
                           <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{new Date(photo.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button
                             onClick={(e) => deletePhoto(e, photo.id)}
                             className="p-2 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 transition-colors"
                           >
                              <Trash2 size={12} />
                           </button>
                           <div className="p-2 rounded-lg bg-white/10 text-white">
                              <Maximize2 size={12} />
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredPhotos.length === 0 && (
              <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                 <ImageIcon size={64} strokeWidth={1} />
                 <div>
                   <p className="text-sm font-black uppercase tracking-[0.4em]">이미지가 없습니다</p>
                   <p className="text-[10px] italic font-bold opacity-30 mt-2">새로운 추억을 업로드하여 갤러리를 채워보세요</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPhoto(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-2xl pointer-events-auto"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full max-h-full flex flex-col items-center pointer-events-auto"
            >
              <button 
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-16 right-0 p-4 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X size={24} />
              </button>

              <div className="relative group rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
                <img 
                  src={selectedPhoto.src} 
                  alt="Full Review" 
                  className="max-w-full max-h-[70vh] object-contain"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <span className="px-3 py-1 bg-lime text-forest text-[9px] font-black uppercase tracking-widest rounded-full">{selectedPhoto.category}</span>
                         <h4 className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2">Uploaded on {new Date(selectedPhoto.timestamp).toLocaleString()}</h4>
                      </div>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-2 text-white/20 text-[9px] font-black uppercase tracking-[0.2em]">
                            <Zap size={10} className="text-lime" />
                            <span>v1.0 Protocol</span>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Camera size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Visual Intelligence Archive</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Gallery Protocol v2.1.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>GPU Accelerated Rendering</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>Asset Integrity Verified</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
