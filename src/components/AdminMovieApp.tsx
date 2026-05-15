import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Heart, Star, Sparkles, Filter, 
  RefreshCcw, Film, Clapperboard, Play,
  TrendingUp, Info, AlertCircle, X,
  CheckCircle2, ChevronRight, HeartOff
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Movie {
  id: string;
  title: string;
  poster: string;
  genres: string[];
  rating: number;
  year: string;
  overview: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export default function AdminMovieApp() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [favorites, setFavorites] = useState<Movie[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load Favorites from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'movie_favorites'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        ...doc.data().movie,
        firestoreId: doc.id
      })) as any[];
      setFavorites(data);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, []);

  // Update recommendations when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      generateRecommendations();
    }
  }, [favorites.length]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusMessage(null);
    try {
      const prompt = `Search for movies matching "${searchQuery}". 
      Return a JSON array of up to 10 movie objects. Each object MUST have:
      id (string), title (string), poster (URL to a high quality placeholder if unknown), 
      genres (string array), rating (number out of 10), year (string), overview (string).
      Return ONLY the JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });
      
      const movies = JSON.parse(result.text || '[]');
      setSearchResults(movies);
      if (movies.length === 0) setStatusMessage("검색 결과가 없어요. 다른 키워드로 검색해볼까요?");
    } catch (err) {
      console.error("Search failed:", err);
      setStatusMessage("앗! 영화 정보를 가져오는데 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleFavorite = async (movie: Movie) => {
    const user = auth.currentUser;
    if (!user) return;

    const existing = favorites.find(f => f.id === movie.id);
    if (existing) {
      // @ts-ignore
      await deleteDoc(doc(db, 'movie_favorites', existing.firestoreId));
    } else {
      await addDoc(collection(db, 'movie_favorites'), {
        userId: user.uid,
        movie: movie,
        createdAt: serverTimestamp()
      });
    }
  };

  const generateRecommendations = async () => {
    if (favorites.length === 0) return;
    setIsRecommending(true);
    try {
      const favTitles = favorites.map(f => f.title).join(", ");
      const favGenres = Array.from(new Set(favorites.flatMap(f => f.genres))).join(", ");

      const prompt = `Based on these favorite movies: [${favTitles}] 
      in genres: [${favGenres}], recommend 4 new movies the user might like. 
      Return a JSON array of objects. Each object MUST have:
      id (string), title (string), poster (URL), genres (string array), rating (number), year (string), overview (string).
      Return ONLY the JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const recs = JSON.parse(result.text || '[]');
      setRecommendations(recs);
    } catch (err) {
      console.error("Recommendation failed:", err);
    } finally {
      setIsRecommending(false);
    }
  };

  const topGenres = useMemo(() => {
    const counts: Record<string, number> = {};
    favorites.flatMap(f => f.genres).forEach(g => {
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);
  }, [favorites]);

  const MovieCard = ({ movie, isFavorite }: { movie: Movie, isFavorite?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative glass rounded-[32px] overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 bg-forest/40"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img 
          src={movie.poster || `https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400`} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        {/* Actions Overlay */}
        <div className="absolute inset-0 p-4 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-end">
            <button 
              onClick={() => toggleFavorite(movie)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-95",
                isFavorite 
                  ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/20" 
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              )}
            >
              <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map(g => (
                <span key={g} className="px-2 py-0.5 bg-lime text-forest text-[8px] font-black uppercase rounded-full">
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-black text-white truncate italic serif">{movie.title}</h4>
          <span className="text-[10px] font-bold text-white/20">{movie.year}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={10} className="text-lime fill-lime" />
          <span className="text-[10px] font-black text-lime tabular-nums tracking-tighter italic">
            {movie.rating} 
            <span className="text-white/20 ml-0.5 font-bold uppercase tracking-widest leading-none">점</span>
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0 min-h-screen"
    >
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h2 className="text-5xl sm:text-6xl font-black italic serif text-white tracking-tighter">영화 추천 시스템</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">시네마틱 인텔리전스 엔진 v4</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="px-6 py-4 bg-white/5 rounded-[24px] border border-white/5 flex flex-col gap-1 min-w-[140px]">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">내가 찜한 영화</span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white italic tabular-nums">{favorites.length}</span>
              <Heart size={14} className="text-red-400 animate-pulse" fill="currentColor" />
            </div>
          </div>
          <div className="px-6 py-4 bg-white/5 rounded-[24px] border border-white/5 flex flex-col gap-1 min-w-[200px]">
            <span className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">선호 장르</span>
            <div className="flex gap-2">
              {topGenres.length > 0 ? topGenres.map(g => (
                <span key={g} className="text-[10px] font-black text-lime italic uppercase">{g}</span>
              )) : <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest italic">데이터 없음</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto relative group">
        <form onSubmit={handleSearch} className="relative z-10 flex flex-col sm:block">
          <div className="absolute left-6 top-8 sm:top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime transition-colors hidden sm:block">
            <Search size={24} strokeWidth={3} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="영화 제목, 감독, 또는 배우 기입..."
            className="w-full bg-forest/60 border border-white/10 rounded-[24px] sm:rounded-[40px] py-6 sm:py-8 px-6 sm:pl-18 sm:pr-40 text-lg font-bold text-white focus:outline-none focus:border-lime transition-all placeholder:text-white/10"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="mt-4 sm:mt-0 sm:absolute sm:right-4 sm:top-4 sm:bottom-4 bg-lime text-forest px-8 py-5 sm:py-0 rounded-[24px] font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lime/20 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isSearching ? <RefreshCcw size={16} className="animate-spin" /> : <Clapperboard size={18} strokeWidth={2.5} />}
            <span>검색하기</span>
          </button>
        </form>
        <div className="absolute inset-0 bg-lime/10 blur-[100px] -z-1 opacity-0 group-focus-within:opacity-100 transition-opacity" />
      </div>

      {/* Recommendations Banner */}
      <AnimatePresence>
        {recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime/10 rounded-xl text-lime">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest italic">AI 영화 추천</h3>
                  <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">당신의 취향을 분석한 영화 추천</p>
                </div>
              </div>
              <button 
                onClick={generateRecommendations}
                disabled={isRecommending}
                className="text-[10px] font-black text-lime uppercase tracking-widest flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                {isRecommending && <RefreshCcw size={12} className="animate-spin" />}
                새로고침
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map(movie => (
                <MovieCard key={movie.id} movie={movie} isFavorite={favorites.some(f => f.id === movie.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty States / Messages */}
      {!isSearching && searchResults.length === 0 && !statusMessage && favorites.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center space-y-6">
           <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center text-white/10 group hover:bg-lime/5 transition-all duration-700">
              <Film size={48} className="group-hover:rotate-12 transition-transform" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-white italic serif tracking-tight">좋아하는 영화를 찾아보세요!</h3>
              <p className="max-w-md text-sm font-medium text-white/20 leading-relaxed">
                검색창에 영화 제목을 입력하면 맞춤 정보를 불러옵니다. <br/>
                즐겨찾기를 추가하면 취향에 맞는 영화를 추천해 드릴게요.
              </p>
           </div>
        </div>
      )}

      {statusMessage && (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
           <AlertCircle size={32} className="text-lime/40" />
           <p className="text-sm font-bold text-lime/60 italic uppercase tracking-widest leading-relaxed">
             {statusMessage}
           </p>
        </div>
      )}

      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between px-2">
               <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                  <TrendingUp size={14} />
                  검색 결과
               </h3>
               <button 
                 onClick={() => setSearchResults([])}
                 className="text-white/20 hover:text-white transition-colors"
                >
                 <X size={18} />
               </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {searchResults.map(movie => (
                <MovieCard key={movie.id} movie={movie} isFavorite={favorites.some(f => f.id === movie.id)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div className="space-y-8 pt-10 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
              <Star size={18} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest italic">내 즐겨찾기</h3>
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">저장된 시네마 수집함</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {favorites.map(movie => (
              <MovieCard key={movie.id} movie={movie} isFavorite={true} />
            ))}
          </div>
        </div>
      )}

      {/* Footer Meta */}
      <div className="pt-20 pb-10 flex flex-col items-center gap-6 opacity-20 pointer-events-none sticky bottom-0 bg-gradient-to-t from-forest to-transparent">
         <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
               <Play size={12} fill="currentColor" />
               <span className="text-[9px] font-black uppercase tracking-widest">메타데이터 동기화 v2</span>
            </div>
            <div className="flex items-center gap-2">
               <Filter size={12} />
               <span className="text-[9px] font-black uppercase tracking-widest">뉴럴 추천 엔진</span>
            </div>
         </div>
         <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] italic leading-none">바이브 무비 프로토콜 1.0</p>
            <div className="h-[1px] w-12 bg-current" />
         </div>
      </div>
    </motion.div>
  );
}
