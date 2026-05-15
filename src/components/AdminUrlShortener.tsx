import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  Zap, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle,
  Scissors,
  CheckCircle2,
  Globe,
  Share2,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminUrlShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShorten = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!longUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setShortUrl('');
    setCopied(false);

    try {
      // Using TinyURL API (CORS might be an issue with direct browser calls, but many open APIs work)
      // Fallback to a proxy if needed, but TinyURL usually works via direct fetch for simple use cases
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      
      if (!response.ok) {
        throw new Error('URL 단축 중 오류가 발생했습니다.');
      }

      const data = await response.text();
      setShortUrl(data);
    } catch (err) {
      console.error(err);
      setError('서비스 연결에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!shortUrl) return;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10 text-center lg:text-left">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">URL 단축키</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Link Compressor v2.0</p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Scissors size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">압축 엔진 활성</span>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl glass rounded-[48px] border border-white/10 p-8 sm:p-12 space-y-10 bg-forest/20 shadow-2xl relative overflow-hidden group">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-lime/10 rounded-full blur-[80px] group-hover:bg-lime/20 transition-colors" />
          
          <div className="space-y-6 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                <Link2 size={20} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">링크 압축기</h3>
            </div>

            <form onSubmit={handleShorten} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">원본 URL (Long URL)</label>
                <div className="relative">
                  <input
                    type="url"
                    required
                    value={longUrl}
                    onChange={(e) => setLongUrl(e.target.value)}
                    placeholder="https://example.com/very/long/url/path..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold"
                  />
                  <Globe className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !longUrl.trim()}
                className="w-full py-5 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20"
              >
                {isLoading ? (
                  <Zap size={18} className="animate-spin" />
                ) : (
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                )}
                <span className="uppercase tracking-widest text-sm">단축하기 (Shorten)</span>
              </button>
            </form>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500"
                >
                  <AlertCircle size={18} />
                  <p className="text-xs font-bold">{error}</p>
                </motion.div>
              )}

              {shortUrl && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 pt-6 border-t border-white/5"
                >
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-lime ml-2">단축된 URL (Short URL)</label>
                    <div 
                      onClick={copyToClipboard}
                      className="group/url w-full bg-lime/10 border border-lime/30 rounded-2xl py-5 px-6 text-sm text-lime font-black cursor-pointer hover:bg-lime/20 transition-all flex items-center justify-between shadow-inner"
                    >
                      <span className="truncate mr-4">{shortUrl}</span>
                      <div className="flex items-center gap-3 shrink-0">
                         {copied ? (
                           <div className="flex items-center gap-2 text-white bg-lime px-3 py-1 rounded-lg text-[9px] uppercase tracking-widest">
                             <Check size={12} />
                             <span>복사됨!</span>
                           </div>
                         ) : (
                           <Copy size={16} className="opacity-40 group-hover/url:opacity-100 transition-opacity" />
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <a 
                      href={shortUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                      <ExternalLink size={12} />
                      새 탭에서 열기
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Share2 size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Link Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Protocol Shorten v1.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>API 실시간 응답 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>복사 동기화 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
