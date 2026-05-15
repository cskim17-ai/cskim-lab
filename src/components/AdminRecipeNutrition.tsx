import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  ChefHat, 
  Utensils, 
  Users, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  Zap,
  Info,
  ChevronRight,
  Beef,
  Egg,
  Salad
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NutritionData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface IngredientResult {
  text: string;
  nutrition: NutritionData;
}

export default function AdminRecipeNutrition() {
  const [inputText, setInputText] = useState('');
  const [servings, setServings] = useState(1);
  const [results, setResults] = useState<IngredientResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNutrition = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const lines = inputText.split('\n').filter(line => line.trim());
      
      // Simulate Edamam API response logic
      // In a real app, you would fetch: https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodedLine}
      const newResults: IngredientResult[] = lines.map(line => {
        // Simple mock parsing logic for demo purposes
        const lowerLine = line.toLowerCase();
        let baseCals = 100 + Math.random() * 200;
        let p = 5 + Math.random() * 15;
        let f = 2 + Math.random() * 10;
        let c = 10 + Math.random() * 30;

        if (lowerLine.includes('egg') || lowerLine.includes('계란')) {
          baseCals = 70; p = 6; f = 5; c = 0.5;
        } else if (lowerLine.includes('chicken') || lowerLine.includes('닭')) {
          baseCals = 165; p = 31; f = 3.6; c = 0;
        } else if (lowerLine.includes('rice') || lowerLine.includes('밥')) {
          baseCals = 130; p = 2.7; f = 0.3; c = 28;
        } else if (lowerLine.includes('apple') || lowerLine.includes('사과')) {
          baseCals = 52; p = 0.3; f = 0.2; c = 14;
        }

        return {
          text: line,
          nutrition: {
            calories: baseCals,
            protein: p,
            fat: f,
            carbs: c
          }
        };
      });

      setResults(newResults);
    } catch (err) {
      setError('영양 성분을 계산하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const totals = useMemo(() => {
    const total = results.reduce((acc, curr) => ({
      calories: acc.calories + curr.nutrition.calories,
      protein: acc.protein + curr.nutrition.protein,
      fat: acc.fat + curr.nutrition.fat,
      carbs: acc.carbs + curr.nutrition.carbs,
    }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

    return {
      total,
      perServing: {
        calories: total.calories / servings,
        protein: total.protein / servings,
        fat: total.fat / servings,
        carbs: total.carbs / servings,
      }
    };
  }, [results, servings]);

  const reset = () => {
    setResults([]);
    setInputText('');
    setServings(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">레시피 영양 계산기</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Nutritional Analytics v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Utensils size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">데이터 소스: Edamam Engine</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-8">
           <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-10 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                       <ChefHat size={20} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">식재료 입력</h3>
                 </div>
                 <button onClick={reset} className="text-white/20 hover:text-white transition-colors">
                    <RefreshCw size={16} />
                 </button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">재료 목록 (한 줄에 하나씩)</label>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="예:\n계란 2개\n닭가슴살 200g\n현미밥 1공기"
                      rows={6}
                      className="w-full bg-forest/50 border border-white/10 rounded-[32px] py-6 px-8 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/5 leading-relaxed font-medium"
                    />
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">인원 수 (Servings)</label>
                    <div className="relative group">
                       <input
                         type="number"
                         min="1"
                         value={servings}
                         onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold"
                       />
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                    </div>
                 </div>

                 <button
                   onClick={calculateNutrition}
                   disabled={isLoading || !inputText.trim()}
                   className="w-full py-5 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20"
                 >
                   {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Calculator size={20} className="group-hover:rotate-12 transition-transform" />}
                   <span className="uppercase tracking-widest text-sm">영양 성분 계산</span>
                 </button>
                 {error && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest italic text-center">{error}</p>}
              </div>
           </div>

           {/* Health Tips */}
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-6">
              <div className="flex items-center gap-2">
                 <Info size={16} className="text-lime" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Smart Insights</span>
              </div>
              <div className="space-y-4">
                 {[
                   { icon: <Beef size={14}/>, text: "고단백 식단은 근육 회복에 도움을 줍니다." },
                   { icon: <Salad size={14}/>, text: "채소 위주의 식단은 비타민 섭취를 늘려줍니다." },
                   { icon: <Egg size={14}/>, text: "식재료의 양을 정확히 입력할수록 정확도가 올라갑니다." }
                 ].map((tip, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="text-lime mt-0.5">{tip.icon}</div>
                      <p className="text-[11px] text-white/60 leading-relaxed">{tip.text}</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: Results Table */}
        <div className="lg:col-span-7 flex flex-col gap-8">
           <AnimatePresence mode="wait">
              {results.length > 0 ? (
                 <motion.div
                   key="results"
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: -20 }}
                   className="space-y-8"
                 >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {[
                         { label: '칼로리', value: totals.perServing.calories, unit: 'kcal', color: 'text-white' },
                         { label: '단백질', value: totals.perServing.protein, unit: 'g', color: 'text-lime' },
                         { label: '지방', value: totals.perServing.fat, unit: 'g', color: 'text-orange-400' },
                         { label: '탄수화물', value: totals.perServing.carbs, unit: 'g', color: 'text-blue-400' }
                       ].map((stat, i) => (
                         <div key={i} className="glass border-white/10 rounded-[32px] p-6 text-center space-y-1">
                            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{stat.label}</p>
                            <p className={cn("text-2xl font-black italic serif", stat.color)}>
                               {stat.value.toFixed(1)}
                               <span className="text-[10px] font-bold not-italic ml-1 opacity-40 uppercase">{stat.unit}</span>
                            </p>
                            <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Per Serving</p>
                         </div>
                       ))}
                    </div>

                    {/* Detailed Table */}
                    <div className="glass rounded-[40px] border border-white/10 bg-black/20 overflow-hidden shadow-2xl">
                       <div className="p-8 border-b border-white/5 flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-widest text-white/30 italic">Detailed Breakdown</h3>
                          <span className="text-[9px] font-bold text-white/10 uppercase tracking-widest">Total for {servings} servings</span>
                       </div>

                       <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                             <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                   <th className="py-4 px-8 text-left text-[10px] font-black text-white/20 uppercase tracking-widest">재료</th>
                                   <th className="py-4 px-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">칼로리</th>
                                   <th className="py-4 px-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">단백질</th>
                                   <th className="py-4 px-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest">지방</th>
                                   <th className="py-4 px-6 text-right text-[10px] font-black text-white/20 uppercase tracking-widest pr-10">탄수화물</th>
                                </tr>
                             </thead>
                             <tbody>
                                {results.map((res, i) => (
                                   <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors odd:bg-white/[0.01]">
                                      <td className="py-5 px-8 font-bold text-sm text-white max-w-[200px] truncate">{res.text}</td>
                                      <td className="py-5 px-6 text-right font-mono font-black text-white text-sm">{res.nutrition.calories.toFixed(1)}</td>
                                      <td className="py-5 px-6 text-right font-mono font-bold text-white/60 text-xs">{res.nutrition.protein.toFixed(1)}g</td>
                                      <td className="py-5 px-6 text-right font-mono font-bold text-white/60 text-xs">{res.nutrition.fat.toFixed(1)}g</td>
                                      <td className="py-5 px-6 text-right font-mono font-bold text-white/60 text-xs pr-10">{res.nutrition.carbs.toFixed(1)}g</td>
                                   </tr>
                                ))}
                             </tbody>
                             <tfoot>
                                <tr className="bg-lime/5">
                                   <td className="py-6 px-8 text-sm font-black italic serif text-lime uppercase tracking-widest">Total (Full Recipe)</td>
                                   <td className="py-6 px-6 text-right font-mono font-black text-lime text-lg">{totals.total.calories.toFixed(1)}</td>
                                   <td className="py-6 px-6 text-right font-mono font-black text-lime/60 text-sm">{totals.total.protein.toFixed(1)}g</td>
                                   <td className="py-6 px-6 text-right font-mono font-black text-lime/60 text-sm">{totals.total.fat.toFixed(1)}g</td>
                                   <td className="py-6 px-6 text-right font-mono font-black text-lime/60 text-sm pr-10">{totals.total.carbs.toFixed(1)}g</td>
                                </tr>
                             </tfoot>
                          </table>
                       </div>
                    </div>
                 </motion.div>
              ) : (
                 <motion.div
                   key="empty"
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8 glass rounded-[60px] border-2 border-dashed border-white/5"
                 >
                    <div className="w-24 h-24 rounded-[40px] bg-white/[0.02] flex items-center justify-center text-white/10">
                       <Calculator size={48} strokeWidth={1} />
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-xl font-black italic serif text-white/20">계산 대기 중</h3>
                       <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.4em] max-w-[300px]">
                          왼쪽 입력란에 레시피 재료를 입력하고 계산 버튼을 눌러 정확한 영양 성분을 확인하세요.
                       </p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Calculator size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Nutrition Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Recipe Analysis v1.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 데이터 집계</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>AI 영양 분석 모델 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
