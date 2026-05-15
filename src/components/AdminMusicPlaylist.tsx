import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, 
  Plus, 
  Play, 
  Pause, 
  X, 
  Volume2, 
  Music2, 
  ListMusic, 
  Disc, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Song {
  id: string;
  title: string;
  url: string;
}

export default function AdminMusicPlaylist() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('vibe_music_playlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('vibe_music_playlist', JSON.stringify(songs));
  }, [songs]);

  const handleAddSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    
    const newSong: Song = {
      id: Math.random().toString(36).substr(2, 9),
      title: title.trim(),
      url: url.trim(),
    };
    
    setSongs([...songs, newSong]);
    setTitle('');
    setUrl('');
  };

  const togglePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = song.url;
        audioRef.current.play();
      }
    }
  };

  const removeSong = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = songs.filter(s => s.id !== id);
    setSongs(updated);
    if (currentSong?.id === id) {
      setCurrentSong(null);
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    }
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">음악 플레이리스트</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Acoustic Protocol v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <ListMusic size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">곡 수: {songs.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
        {/* Left: Player & Form */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-8">
          {/* Audio Player Card */}
          <div className="glass rounded-[40px] border border-white/10 p-8 relative overflow-hidden bg-forest/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] translate-x-12 -translate-y-12" />
            
            <div className="relative z-10 flex flex-col items-center gap-8 text-center">
              <div className="relative">
                <div className={cn(
                  "w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-forest dark:bg-black/40 border-8 border-white/5 flex items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-1000",
                  isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                )}>
                  <Disc size={80} className="text-white/10" strokeWidth={1} />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="w-12 h-12 rounded-full bg-forest border-4 border-white/10 z-20" />
                  </div>
                </div>
                {isPlaying && (
                  <div className="absolute -top-2 -right-2 bg-lime text-forest p-2 rounded-full animate-pulse shadow-lg shadow-lime/20">
                    <Music size={16} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black italic serif text-white tracking-tight truncate max-w-[300px]">
                  {currentSong ? currentSong.title : "재생 중인 곡 없음"}
                </h3>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic">
                  {currentSong ? "Now Streaming..." : "Select a track to start"}
                </p>
              </div>

              <audio 
                ref={audioRef} 
                onEnded={() => setIsPlaying(false)}
                className="hidden"
                controls
              />

              <div className="flex items-center gap-6">
                <button 
                  onClick={() => currentSong && togglePlay(currentSong)}
                  disabled={!currentSong}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all bg-white text-forest shadow-xl hover:scale-110 active:scale-90 disabled:opacity-20",
                  )}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                   <Volume2 size={14} className="text-white/40" />
                   <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={cn("h-full bg-lime transition-all duration-300", isPlaying ? "w-2/3" : "w-0")} />
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Add Song Form */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                <Plus size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">새 노래 추가</h3>
            </div>

            <form onSubmit={handleAddSong} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="노래 제목 (Song Title)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Music2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>
              <div className="relative group">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="오디오 URL (Audio Source URL)"
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                />
                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
              >
                <Plus size={18} className="group-hover:scale-125 transition-transform" />
                <span>플레이리스트에 추가</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right: Songs List */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
           <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Track List</h3>
              <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest">Total {songs.length} Tracks</span>
           </div>

           <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {songs.map((song, i) => (
                  <motion.div
                    key={song.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => togglePlay(song)}
                    className={cn(
                      "group p-5 rounded-[28px] border cursor-pointer transition-all duration-300 flex items-center justify-between",
                      currentSong?.id === song.id 
                        ? "bg-lime border-lime shadow-xl shadow-lime/10" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/[0.08]"
                    )}
                  >
                    <div className="flex items-center gap-5 overflow-hidden">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-colors",
                         currentSong?.id === song.id 
                           ? "bg-forest/10 border-forest/10 text-forest" 
                           : "bg-white/5 border-white/5 text-white/40 group-hover:text-lime group-hover:bg-lime/10"
                       )}>
                          {currentSong?.id === song.id && isPlaying ? (
                            <div className="flex items-end gap-1 h-4">
                               <div className="w-1 bg-current rounded-full animate-[soundbar_0.5s_ease-in-out_infinite]" />
                               <div className="w-1 bg-current rounded-full animate-[soundbar_0.8s_ease-in-out_infinite]" />
                               <div className="w-1 bg-current rounded-full animate-[soundbar_0.4s_ease-in-out_infinite]" />
                            </div>
                          ) : (
                            <Play size={18} fill="currentColor" className={cn(currentSong?.id === song.id ? "opacity-100" : "opacity-40 group-hover:opacity-100")} />
                          )}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "text-base font-black italic serif truncate tracking-tight transition-colors",
                            currentSong?.id === song.id ? "text-forest" : "text-white group-hover:text-lime"
                          )}>
                             {song.title}
                          </span>
                          <span className={cn(
                             "text-[10px] uppercase font-black tracking-widest leading-none mt-1",
                             currentSong?.id === song.id ? "text-forest/40" : "text-white/20"
                          )}>
                             TRACK #{i + 1}
                          </span>
                       </div>
                    </div>
                    
                    <button
                      onClick={(e) => removeSong(e, song.id)}
                      className={cn(
                        "p-3 rounded-full transition-all active:scale-90",
                        currentSong?.id === song.id 
                          ? "hover:bg-forest/10 text-forest" 
                          : "hover:bg-red-500/10 text-white/10 hover:text-red-500"
                      )}
                    >
                      <X size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {songs.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                   <Music2 size={64} strokeWidth={1} />
                   <div>
                     <p className="text-sm font-black uppercase tracking-[0.4em]">플레이리스트가 비어 있습니다</p>
                     <p className="text-[10px] italic font-bold">노래 제목과 URL을 입력하여 나만의 리스트를 만드세요</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Disc size={24} className={cn(isPlaying && "animate-spin-slow")} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Audio Stream Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Sound Architecture v4.2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>Low Latency</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>Local DB Active</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes soundbar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
