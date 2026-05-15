import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRightLeft, 
  Coins, 
  TrendingUp, 
  Globe, 
  RefreshCcw, 
  ChevronDown,
  Zap,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ExchangeRates {
  [key: string]: number;
}

export default function AdminCurrencyConverter() {
  const [amount, setAmount] = useState<string>('1');
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('KRW');
  const [rates, setRates] = useState<ExchangeRates>({});
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial currency list
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Using exchangerate-api for stability in demos
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
        const data = await res.json();
        setRates(data.rates);
        setCurrencies(Object.keys(data.rates).sort());
      } catch (err) {
        setError('환율 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleConvert = async () => {
    if (!amount || isNaN(Number(amount))) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
      const data = await res.json();
      const rate = data.rates[toCurrency];
      setResult(Number(amount) * rate);
    } catch (err) {
      setError('변환 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0 flex flex-col items-center"
    >
      {/* Header */}
      <div className="flex flex-col items-center space-y-4 text-center pb-10 border-b border-white/5 w-full">
        <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">환율 변환기</h2>
        <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Currency Exchange Protocol v1.0</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl glass rounded-[40px] border border-white/10 p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-forest/40 to-black/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime/5 blur-[80px] translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/5 blur-[80px] -translate-x-12 translate-y-12" />

        <div className="relative z-10 space-y-10">
          {/* Amount Input */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">변환할 금액</label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-forest/50 border border-white/10 rounded-2xl py-6 pl-16 pr-8 text-3xl font-black text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/5 tabular-nums"
              />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lime">
                <DollarSign size={24} />
              </div>
            </div>
          </div>

          {/* Currencies Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">나가는 통화</label>
              <div className="relative">
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white appearance-none focus:outline-none focus:border-lime/50 cursor-pointer"
                >
                  {currencies.map(code => (
                    <option key={code} value={code} className="bg-forest text-white">{code}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>

            <button 
              onClick={swapCurrencies}
              className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-lime hover:border-lime hover:bg-lime/10 transition-all active:scale-90 mt-6 sm:mt-6"
            >
              <ArrowRightLeft size={20} />
            </button>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">받는 통화</label>
              <div className="relative">
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold text-white appearance-none focus:outline-none focus:border-lime/50 cursor-pointer"
                >
                  {currencies.map(code => (
                    <option key={code} value={code} className="bg-forest text-white">{code}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <button
            onClick={handleConvert}
            disabled={isLoading}
            className="w-full py-5 bg-lime text-forest font-black rounded-[24px] hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <RefreshCcw size={20} className={cn(isLoading && "animate-spin")} />
            <span className="uppercase tracking-[0.2em]">환율 변환하기</span>
          </button>

          {/* Result Area */}
          <AnimatePresence>
            {result !== null && !isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pt-8 border-t border-white/5 text-center space-y-2"
              >
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">변환 결과</p>
                <div className="flex flex-col items-center">
                  <h3 className="text-5xl font-black text-white italic tracking-tighter tabular-nums">
                    {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                  <p className="text-xl font-black text-lime uppercase tracking-widest mt-1">{toCurrency}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p className="text-center text-red-400 text-[10px] font-black uppercase tracking-widest italic">{error}</p>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30 w-full">
        <div className="flex items-center gap-3">
          <Globe size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Global Exchange Feed</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Economic Protocol v4.0.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 시세 반영</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>보안 커넥션 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
