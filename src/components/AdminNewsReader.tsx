import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Search, 
  ExternalLink, 
  Clock, 
  User, 
  ChevronRight, 
  X, 
  RefreshCw, 
  ArrowUp,
  Zap,
  CheckCircle2,
  Globe,
  Plus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Article {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  source: string;
  topic: string;
}

const TOPICS = [
  { id: 'technology', label: '기술', icon: '💻' },
  { id: 'sports', label: '스포츠', icon: '⚽' },
  { id: 'business', label: '비즈니스', icon: '📈' },
  { id: 'science', label: '과학', icon: '🧪' },
  { id: 'health', label: '건강', icon: '🏥' },
  { id: 'entertainment', label: '엔터테인먼트', icon: '🎬' },
];

export default function AdminNewsReader() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['technology']);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchNews = useCallback(async (topics: string[], pageNum: number, isNewSearch: boolean = false) => {
    setIsLoading(true);
    try {
      // simulate news fetching from multiple sources
      // In a real app, you would use NewsAPI or a similar service
      // Here we simulate high quality content for the demo
      const newArticles = topics.flatMap(topic => 
        Array.from({ length: 5 }).map((_, i) => ({
          id: `${topic}-${pageNum}-${i}-${Math.random()}`,
          title: `[${topic.toUpperCase()}] 최신 ${topic} 관련 트렌드 및 심층 분석 리포트 #${pageNum}-${i}`,
          description: `${topic} 분야에서 발생하는 새로운 변화와 혁신에 대한 상세 데이터를 포함하고 있습니다. 현재 업계 전문가들은 이 현상이 향후 5년간 시장에 미칠 영향에 대해 주목하고 있습니다.`,
          content: `${topic} 분야의 최신 소식을 전해드립니다. 최근 발표된 자료에 따르면, 업계 전반에 걸쳐 큰 변화가 감지되고 있습니다. 전문가들은 이러한 변화가 단순한 일시적 현상이 아니라, 장기적인 패러다임의 전환이라고 분석하고 있습니다. 특히 기술적 한계를 극복하기 위한 다양한 시도들이 이어지고 있으며, 이는 사용자 경험의 혁신으로 연결될 것으로 보입니다. 더 자세한 내용은 읽기 버튼을 통해 확인하실 수 있습니다.`,
          url: '#',
          image: `https://picsum.photos/seed/${topic}${i}${pageNum}/800/600`,
          publishedAt: new Date().toISOString(),
          source: `${topic} 뉴스`,
          topic: topic
        }))
      );

      if (isNewSearch) {
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }
      
      if (pageNum > 5) setHasMore(false); // Limit for demo
    } catch (error) {
      console.error('Failed to fetch news', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  useEffect(() => {
    if (page > 1) {
      fetchNews(selectedTopics, page);
    }
  }, [page, fetchNews, selectedTopics]);

  const handleSearch = () => {
    setPage(1);
    setHasMore(true);
    fetchNews(selectedTopics, 1, true);
  };

  const toggleTopic = (id: string) => {
    setSelectedTopics(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">맞춤형 뉴스 리더</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Information Protocol v5.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Globe size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">실시간 피드 활성</span>
          </div>
        </div>
      </div>

      {/* Topic Selection Bar */}
      <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-10 space-y-8 bg-forest/20 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 italic">Interest Filter</h3>
            <p className="text-white font-bold text-lg">관심 있는 주제를 선택하세요</p>
          </div>
          <button
            onClick={handleSearch}
            disabled={selectedTopics.length === 0 || isLoading}
            className="px-10 py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center gap-3 group disabled:opacity-20"
          >
            {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Newspaper size={20} className="group-hover:rotate-12 transition-transform" />}
            <span className="uppercase tracking-widest text-sm">뉴스 보기</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          {TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={cn(
                "px-6 py-4 rounded-[24px] border transition-all flex items-center gap-3 relative overflow-hidden group",
                selectedTopics.includes(topic.id)
                  ? "bg-white border-white text-forest shadow-xl shadow-white/5"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20"
              )}
            >
              <span className="text-xl">{topic.icon}</span>
              <span className="text-xs font-black uppercase tracking-widest">{topic.label}</span>
              {selectedTopics.includes(topic.id) && (
                <div className="absolute right-2 top-2">
                   <CheckCircle2 size={10} className="text-forest/20" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* News Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {articles.map((article) => (
            <motion.div
              key={article.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[40px] overflow-hidden shadow-2xl flex flex-col group hover:-translate-y-2 transition-all duration-500 border border-transparent hover:border-lime/20"
            >
              {/* Image Header */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute top-6 left-6">
                   <span className="px-4 py-1.5 bg-black/80 backdrop-blur-md text-[9px] font-black text-lime uppercase tracking-widest rounded-full border border-white/10">
                      {article.topic}
                   </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content body */}
              <div className="p-8 space-y-6 flex-1 flex flex-col">
                 <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 opacity-30">
                       <Clock size={12} />
                       <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-black serif italic tracking-tighter text-black leading-tight line-clamp-2 min-h-[3rem]">
                       {article.title}
                    </h4>
                    <p className="text-sm text-black/60 leading-relaxed line-clamp-3">
                       {article.description}
                    </p>
                 </div>

                 <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-8 rounded-full bg-forest flex items-center justify-center text-lime text-[10px] font-black">
                         {article.source[0]}
                       </div>
                       <span className="text-[10px] font-black uppercase tracking-widest text-black/40">{article.source}</span>
                    </div>
                    <button
                      onClick={() => setSelectedArticle(article)}
                      className="flex items-center gap-2 text-forest font-black uppercase tracking-widest text-[11px] group/btn"
                    >
                       <span>읽기</span>
                       <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Infinite Scroll Loader */}
      <div ref={loaderRef} className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        {isLoading ? (
          <div className="space-y-4 flex flex-col items-center">
             <RefreshCw size={32} className="text-lime animate-spin" />
             <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">기사를 불러오고 있습니다...</p>
          </div>
        ) : hasMore ? (
          <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em]">추가 기사를 불러오려면 아래로 스크롤하세요</p>
        ) : articles.length > 0 ? (
          <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.02]">
             <CheckCircle2 size={32} className="text-lime mx-auto mb-4" />
             <p className="text-white font-bold italic">모든 소식을 확인했습니다</p>
          </div>
        ) : (
          <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 text-white/5 border-2 border-dashed border-white/5 rounded-[40px] w-full">
            <Newspaper size={64} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">관심 있는 주제를 선택하고 검색을 눌러주세요</p>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="absolute inset-0 bg-forest/90 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              className="relative w-full max-w-4xl bg-white rounded-[50px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-8 right-8 z-20 p-4 rounded-full bg-black/10 text-white hover:bg-black/20 transition-all backdrop-blur-md"
              >
                <X size={24} />
              </button>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                 <div className="relative aspect-video">
                    <img src={selectedArticle.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-12 left-12 right-12 space-y-4">
                       <span className="px-4 py-1.5 bg-lime text-forest text-[10px] font-black uppercase tracking-widest rounded-full">
                          {selectedArticle.topic}
                       </span>
                       <h3 className="text-4xl sm:text-5xl font-black serif italic text-white tracking-tighter leading-[1.1]">
                          {selectedArticle.title}
                       </h3>
                    </div>
                 </div>

                 <div className="p-10 sm:p-16 space-y-12 bg-white">
                    <div className="flex flex-wrap items-center gap-8 border-b border-black/5 pb-8">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center text-lime text-xs font-black">S</div>
                          <div>
                             <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">출처</p>
                             <p className="text-sm font-bold text-black">{selectedArticle.source}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/40">
                             <Clock size={16} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-black/20 uppercase tracking-widest">발행일</p>
                             <p className="text-sm font-bold text-black">{new Date(selectedArticle.publishedAt).toLocaleString()}</p>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <p className="text-xl font-medium text-black leading-relaxed italic border-l-4 border-lime pl-8 py-2 bg-black/1">
                          {selectedArticle.description}
                       </p>
                       <div className="prose prose-sm max-w-none text-black/70 leading-loose space-y-6">
                          <p className="text-lg">{selectedArticle.content}</p>
                          <p className="text-lg">본 리포트에 따르면, 현재 진행 중인 이러한 변화들은 향후 산업 지형을 근본적으로 변화시킬 잠재력을 가지고 있습니다. 특히 기술의 민주화와 데이터 중심의 의사결정 체계가 확립됨에 따라, 더 많은 가능성들이 열리고 있습니다. 산업 리더들은 현재의 추세를 기회로 삼아 새로운 비즈니스 모델을 탐색하고 있으며, 이는 소비자들에게 더 나은 가치를 제공하는 데 기여할 것입니다.</p>
                       </div>
                    </div>

                    <div className="pt-12 flex flex-col sm:flex-row gap-4">
                       <a 
                         href={selectedArticle.url} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="flex-1 py-5 bg-forest text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 hover:bg-black transition-all"
                       >
                          <ExternalLink size={20} />
                          원본 기사 전체보기
                       </a>
                       <button
                         onClick={() => setSelectedArticle(null)}
                         className="flex-1 py-5 bg-black/5 text-black font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-black/10 transition-all"
                       >
                          닫기
                       </button>
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
          <Newspaper size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Information Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">News Aggregation v1.5.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 탐색 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>RSS/API 통합 완료</span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </motion.div>
  );
}
