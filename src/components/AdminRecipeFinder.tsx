import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Heart, X, BookOpen, Clock, 
  Users, Check, ExternalLink, Loader2, AlertCircle,
  Bookmark, BookmarkCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Recipe {
  id: number;
  title: string;
  image: string;
  summary?: string;
  instructions?: string;
  readyInMinutes?: number;
  servings?: number;
  diets: string[];
}

type DietFilter = 'all' | 'vegetarian' | 'vegan';

export default function AdminRecipeFinder() {
  const [query, setQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [diet, setDiet] = useState<DietFilter>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('vibe_saved_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const searchRecipes = useCallback(async (searchQuery: string, currentDiet: DietFilter) => {
    if (!API_KEY) {
      setError('API Key가 필요합니다. .env 파일에 VITE_SPOONACULAR_API_KEY를 추가해주세요.');
      return;
    }

    if (!searchQuery.trim()) {
      setRecipes([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${encodeURIComponent(searchQuery)}&addRecipeInformation=true&number=12`;
      
      if (currentDiet !== 'all') {
        url += `&diet=${currentDiet}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('레시피를 찾을 수 없거나 API 제한에 도달했습니다.');
      }

      const data = await response.json();
      setRecipes(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Debounce search
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (query.trim()) {
      timerRef.current = setTimeout(() => {
        searchRecipes(query, diet);
      }, 500);
    } else {
      setRecipes([]);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, diet, searchRecipes]);

  const toggleSave = (recipe: Recipe) => {
    setSavedRecipeIds(prev => {
      const isSaved = prev.includes(recipe.id);
      let newIds;
      if (isSaved) {
        newIds = prev.filter(id => id !== recipe.id);
      } else {
        newIds = [...prev, recipe.id];
      }
      localStorage.setItem('vibe_saved_recipes', JSON.stringify(newIds));
      return newIds;
    });
  };

  const isSaved = (id: number) => savedRecipeIds.includes(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-8 py-4 sm:py-10 px-4"
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black italic serif text-white">레시피 찾기</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Smart Kitchen Assistant</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="재료나 요리 이름을 입력하세요..."
              className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20 shadow-inner group-focus-within:border-lime/30"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lime transition-colors" size={18} />
          </div>

          <div className="relative shrink-0">
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value as DietFilter)}
              className="w-full sm:w-40 bg-forest/50 border border-white/10 rounded-2xl py-3.5 px-10 text-xs font-black text-white focus:outline-none focus:border-lime/50 appearance-none cursor-pointer uppercase tracking-widest"
            >
              <option value="all">전체 식단</option>
              <option value="vegetarian">유연한 채식</option>
              <option value="vegan">완전한 채식</option>
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={14} />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
               <div className="w-2 h-2 rounded-full bg-lime/40 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 space-y-4"
          >
            <Loader2 className="animate-spin text-lime" size={48} />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">레시피를 검색하고 있습니다...</p>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 space-y-4 text-center"
          >
            <AlertCircle className="text-red-400" size={48} />
            <p className="text-sm font-bold text-red-400/80">{error}</p>
            {!API_KEY && (
              <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] text-white/40 max-w-sm">
                Spoonacular API 키가 필요합니다. 무료 키를 발급받아 환경변수에 설정해주세요.
              </div>
            )}
          </motion.div>
        ) : recipes.length > 0 ? (
          <motion.div 
            key="grid"
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {recipes.map((recipe) => (
              <motion.div
                key={recipe.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-[32px] border border-white/5 overflow-hidden group hover:border-lime/30 transition-all cursor-pointer"
                onClick={() => setSelectedRecipe(recipe)}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest to-transparent opacity-60" />
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(recipe);
                    }}
                    className={cn(
                      "absolute top-4 right-4 p-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-90",
                      isSaved(recipe.id) 
                        ? "bg-lime text-forest shadow-lg shadow-lime/20" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    )}
                  >
                    {isSaved(recipe.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                  </button>

                  <div className="absolute bottom-4 left-4 flex gap-2">
                    {recipe.readyInMinutes && (
                      <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-black text-white/80 flex items-center gap-1.5 border border-white/5">
                        <Clock size={10} className="text-lime" />
                        {recipe.readyInMinutes}min
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-sm font-black text-white line-clamp-2 min-h-[40px] group-hover:text-lime transition-colors leading-relaxed">
                    {recipe.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.diets.slice(0, 2).map(d => (
                      <span key={d} className="text-[9px] font-bold uppercase tracking-wider text-white/20 border border-white/10 px-2 py-0.5 rounded-md">
                        {d}
                      </span>
                    ))}
                  </div>

                  {isSaved(recipe.id) && (
                    <div className="flex items-center gap-2 text-lime/60 text-[9px] font-black uppercase tracking-widest pt-2 border-t border-white/5">
                      <Check size={10} /> Saved to Favorites
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : query.trim() ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-white/10"
          >
            <Search size={64} className="mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">검색 결과가 없습니다</p>
          </motion.div>
        ) : (
          <motion.div 
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 text-center space-y-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-lime/20 blur-[100px] rounded-full" />
              <BookOpen size={80} className="text-white/5 relative z-10" />
            </div>
            <div className="space-y-2 relative z-10">
              <p className="text-sm font-black text-white/20 uppercase tracking-[0.4em]">Ready to cook something new?</p>
              <p className="text-xs text-white/10 font-bold italic">당신만의 특별한 레시피를 검색해보세요</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistence Info */}
      <div className="flex items-center justify-between gap-4 py-8 border-t border-white/5">
         <div className="flex items-center gap-2 text-white/10">
            <div className="h-[1px] w-8 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Kitchen Intelligence</p>
            <div className="h-[1px] w-8 bg-current" />
         </div>
         <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            {savedRecipeIds.length} Saved Recipes in Browser
         </div>
      </div>

      {/* Recipe Detail Modal */}
      <AnimatePresence>
        {selectedRecipe && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-forest/90 backdrop-blur-xl"
              onClick={() => setSelectedRecipe(null)}
            />
            
            <motion.div
              layoutId={`recipe-${selectedRecipe.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-forest border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="relative h-64 sm:h-80 shrink-0">
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest via-transparent to-transparent" />
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-6 right-6 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-2xl text-white transition-all active:scale-95 border border-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-8 custom-scrollbar">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedRecipe.diets.map(d => (
                      <span key={d} className="px-3 py-1 bg-lime/10 border border-lime/20 rounded-full text-[10px] font-black text-lime uppercase tracking-widest">
                        {d}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black italic serif text-white leading-tight">
                    {selectedRecipe.title}
                  </h2>
                  <div className="flex items-center gap-6 text-white/40">
                    {selectedRecipe.readyInMinutes && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-lime" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedRecipe.readyInMinutes} mins</span>
                      </div>
                    )}
                    {selectedRecipe.servings && (
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-lime" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{selectedRecipe.servings} servings</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  <div className="md:col-span-12 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                      <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                        <BookOpen size={16} />
                      </div>
                      <h3 className="text-xs font-black text-white/60 uppercase tracking-widest">Preparation Steps</h3>
                    </div>
                    
                    <div 
                      className="text-sm sm:text-base text-white/60 leading-relaxed prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions || selectedRecipe.summary || '조리법 정보가 없습니다.' }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 sm:p-10 border-t border-white/5 bg-forest-dark flex items-center justify-between shrink-0">
                <button 
                  onClick={() => setSelectedRecipe(null)}
                  className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white/60 uppercase tracking-widest transition-all"
                >
                  닫기
                </button>
                <button 
                  onClick={() => toggleSave(selectedRecipe)}
                  className={cn(
                    "flex items-center gap-3 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95",
                    isSaved(selectedRecipe.id)
                      ? "bg-white text-forest hover:bg-white/90"
                      : "bg-lime text-forest hover:bg-[#b0f533] shadow-lime/10"
                  )}
                >
                  {isSaved(selectedRecipe.id) ? (
                    <>
                      <Check size={16} />
                      Saved Successfully
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} />
                      Save Recipe
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
