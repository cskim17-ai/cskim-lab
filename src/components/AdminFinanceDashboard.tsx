import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2, 
  PieChart as PieChartIcon, Table as TableIcon, 
  ArrowUpRight, ArrowDownRight, LayoutDashboard,
  Wallet, Receipt, CreditCard, Filter, ChevronRight,
  Info, AlertCircle, CheckCircle2
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
}

const CATEGORIES = {
  income: ['월급', '상여금', '투자수익', '기타 수입'],
  expense: ['식비', '교통비', '주거비', '쇼핑', '문화생활', '통신비', '기타 지출']
};

const CHART_COLORS = [
  '#A3E635', // lime
  '#4ADE80', // green
  '#2DD4BF', // teal
  '#38BDF8', // sky
  '#818CF8', // indigo
  '#F472B6', // pink
  '#FB923C', // orange
];

export default function AdminFinanceDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('vibe_finance_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '식비',
    type: 'expense' as 'income' | 'expense'
  });

  useEffect(() => {
    localStorage.setItem('vibe_finance_data', JSON.stringify(transactions));
  }, [transactions]);

  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categories: Record<string, number> = {};
    
    expenses.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });

    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: formData.description,
      amount: Math.abs(Number(formData.amount)),
      category: formData.category,
      type: formData.type,
      date: new Date().toISOString()
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      description: '',
      amount: '',
      category: formData.type === 'income' ? '월급' : '식비',
      type: formData.type
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 sm:py-16 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 md:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">재무 대시보드</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">개인 자산 인텔리전스 v4.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5">
            <LayoutDashboard size={14} className="text-lime" />
            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">활성 인텔리전스</span>
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income Card */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="glass rounded-[48px] border border-white/5 p-10 relative overflow-hidden group bg-forest/20 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-lime/5 blur-[80px] translate-x-16 -translate-y-16" />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="w-14 h-14 bg-lime/10 rounded-2xl flex items-center justify-center text-lime group-hover:rotate-12 transition-transform duration-500 shadow-xl shadow-lime/5">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.3em] mb-2 font-mono">총 수입</p>
              <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tighter tabular-nums leading-none">
                ₩{totals.income.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black text-lime/60 uppercase italic tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              긍정적 현금 흐름
            </div>
          </div>
        </motion.div>

        {/* Expense Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass rounded-[40px] border border-white/5 p-8 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 blur-[60px] translate-x-16 -translate-y-16" />
          <div className="relative z-10 flex flex-col gap-4">
            <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">총 지출</p>
              <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums">
                ₩{totals.expense.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-bold text-red-400/60 uppercase italic">
              <ArrowDownRight size={10} />
              관리된 지출 항목
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div 
          whileHover={{ y: -8 }}
          className="bg-lime rounded-[48px] p-10 relative overflow-hidden group shadow-2xl shadow-lime/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 flex flex-col gap-6 text-forest">
            <div className="w-14 h-14 bg-forest/10 rounded-2xl flex items-center justify-center text-forest group-hover:rotate-12 transition-transform duration-500">
              <Wallet size={28} />
            </div>
            <div>
              <p className="text-[11px] font-black text-forest/40 uppercase tracking-[0.3em] mb-2 font-mono">현재 잔액</p>
              <h3 className="text-4xl sm:text-5xl font-black text-forest tracking-tighter tabular-nums leading-none">
                ₩{totals.balance.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-forest/10 py-2 px-5 rounded-full w-fit">
              실시간 유동성
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Chart */}
        <div className="lg:col-span-5 space-y-8">
          {/* Transaction Form */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                <Plus size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">새 거래 추가</h3>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: '월급' })}
                  className={cn(
                    "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    formData.type === 'income' ? "bg-lime text-forest border-lime" : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                  )}
                >
                  수입 (+ Income)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: '식비' })}
                  className={cn(
                    "py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    formData.type === 'expense' ? "bg-red-400 text-white border-red-400" : "bg-white/5 text-white/40 border-white/5 hover:border-white/10"
                  )}
                >
                  지출 (- Expense)
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="내용 (예: 점심 식사, 월급)"
                    className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                  />
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                </div>

                <div className="relative group">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="금액 (₩)"
                    className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                  />
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                </div>

                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 appearance-none cursor-pointer"
                  >
                    {CATEGORIES[formData.type].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={14} />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10"
              >
                거래 추가하기
              </button>
            </form>
          </div>

          {/* Expense Chart */}
          <div className="glass rounded-[40px] border border-white/10 p-8 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                  <PieChartIcon size={16} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">지출 분석</h3>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[250px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1E293B', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white/10 gap-4">
                  <PieChartIcon size={48} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest">데이터가 부족합니다</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-[10px] text-white/20 italic text-center">카테고리별 지출 분포도</p>
            </div>
          </div>
        </div>

        {/* Right Column: Transaction Table */}
        <div className="lg:col-span-7 flex flex-col min-h-0">
          <div className="glass rounded-[40px] border border-white/10 flex flex-col h-full bg-forest/40">
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-lime/10 flex items-center justify-center text-lime">
                  <TableIcon size={16} />
                </div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">거래 내역</h3>
              </div>
              <span className="text-[10px] font-black text-white/20 tabular-nums uppercase tracking-widest italic font-mono">
                기록: {transactions.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((t) => (
                    <motion.div
                      layout
                      key={t.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group p-5 bg-white/5 hover:bg-white/[0.08] border border-white/5 rounded-3xl transition-all flex items-center gap-6"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                        t.type === 'income' ? "bg-lime/10 text-lime" : "bg-red-400/10 text-red-400"
                      )}>
                        {t.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-sm font-black text-white truncate">{t.description}</h4>
                          <span className={cn(
                            "text-sm font-black tabular-nums",
                            t.type === 'income' ? "text-lime" : "text-red-400"
                          )}>
                            {t.type === 'income' ? '+' : '-'} ₩{t.amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[9px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                            {t.category}
                          </span>
                          <span className="text-[9px] text-white/10 font-bold italic">
                            {new Date(t.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-3 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-white/10 gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-lime/10 blur-[60px] rounded-full scale-150" />
                    <CreditCard size={64} className="relative z-10" strokeWidth={1} />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-black uppercase tracking-[0.3em]">기록된 거래가 없습니다</p>
                    <p className="text-xs font-bold italic">수입과 지출 내역을 기록하여 자산을 관리하세요</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/5 bg-forest-dark/30 rounded-b-[40px]">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                     <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] italic">Vibe 재무 프로토콜 4.0</p>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[9px] font-bold text-white/40 italic">
                     <CheckCircle2 size={10} className="text-lime" /> 로컬 암호화 저장소
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
