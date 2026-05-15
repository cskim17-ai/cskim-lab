import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Wallet, TrendingUp, TrendingDown, 
  PieChart as PieChartIcon, Calendar, Tag, DollarSign,
  AlertCircle, ChevronDown, Save, Edit3, X
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
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
  note: string;
}

const CATEGORIES = {
  income: ['월급', '보너스', '투자', '기타 수입'],
  expense: ['식비', '교통', '쇼핑', '주거', '교육', '의료', '취미', '기타 지출']
};

const COLORS = ['#A3E635', '#22C55E', '#3B82F6', '#6366F1', '#A855F7', '#EC4899', '#EF4444', '#F59E0B'];

export default function AdminFinanceManager() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('vibe_finance_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    amount: '',
    category: CATEGORIES.expense[0],
    date: new Date().toISOString().split('T')[0],
    type: 'expense' as 'income' | 'expense',
    note: ''
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('vibe_finance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  const balance = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return curr.type === 'income' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }, [transactions]);

  const incomeTotal = useMemo(() => {
    return transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const expenseTotal = useMemo(() => {
    return transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  }, [transactions]);

  const chartData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || isNaN(Number(formData.amount))) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: Math.abs(Number(formData.amount)),
      category: formData.category,
      date: formData.date,
      type: formData.type,
      note: formData.note || formData.category
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      ...formData,
      amount: '',
      note: ''
    });
  };

  const handleDelete = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleEditStart = (id: string, value: number) => {
    setEditingId(id);
    setEditValue(value.toString());
  };

  const handleEditSave = (id: string) => {
    const newVal = Number(editValue);
    if (!isNaN(newVal)) {
      setTransactions(transactions.map(t => t.id === id ? { ...t, amount: Math.abs(newVal) } : t));
    }
    setEditingId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header & Balance Cards */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">자산 관리자</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">개인 자산 프로토콜 v1.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-[40px] border border-white/10 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-white/40">
              <Wallet size={18} className="text-lime" />
              <span className="text-xs font-black uppercase tracking-widest">총 잔액</span>
            </div>
            <div className={cn(
              "text-4xl font-black italic serif tabular-nums tracking-tighter",
              balance >= 0 ? "text-white" : "text-red-400"
            )}>
              ₩{balance.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass rounded-[40px] border border-white/10 p-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-white/40">
              <TrendingUp size={18} className="text-green-400" />
              <span className="text-xs font-black uppercase tracking-widest">총 수입</span>
            </div>
            <div className="text-3xl font-black italic serif tabular-nums tracking-tighter text-green-400">
              +₩{incomeTotal.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass rounded-[40px] border border-white/10 p-8 relative overflow-hidden group">
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3 text-white/40">
              <TrendingDown size={18} className="text-red-400" />
              <span className="text-xs font-black uppercase tracking-widest">총 지출</span>
            </div>
            <div className="text-3xl font-black italic serif tabular-nums tracking-tighter text-red-400">
              -₩{expenseTotal.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form & List */}
        <div className="lg:col-span-8 space-y-8">
          {/* Add Transaction Form */}
          <div className="glass rounded-[40px] border border-white/10 p-8">
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">구분</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any, category: CATEGORIES[e.target.value as 'income' | 'expense'][0] })}
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 appearance-none cursor-pointer"
                >
                  <option value="expense">지출</option>
                  <option value="income">수입</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">금액</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3 px-4 pl-8 text-sm text-white focus:outline-none focus:border-lime/50"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 text-xs">₩</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">카테고리</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50 appearance-none cursor-pointer"
                >
                  {CATEGORIES[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">날짜</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3 space-y-2">
                <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-2">메모 (선택)</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="메모를 입력하세요..."
                  className="w-full bg-forest/50 border border-white/10 rounded-2xl py-3 px-4 text-sm text-white focus:outline-none focus:border-lime/50"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full h-[50px] bg-lime text-forest font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10"
                >
                  <Plus size={18} />
                  추가하기
                </button>
              </div>
            </form>
          </div>

          {/* Transactions Table */}
          <div className="glass rounded-[40px] border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60">최근 거래 내역</h3>
              <span className="text-[10px] font-bold text-white/20 italic">도움말: 금액을 더블클릭하여 수정</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] font-black text-white/20 uppercase tracking-widest text-left">
                    <th className="px-6 py-4">날짜</th>
                    <th className="px-6 py-4">카테고리</th>
                    <th className="px-6 py-4">메모</th>
                    <th className="px-6 py-4 text-right">금액</th>
                    <th className="px-6 py-4 text-center">동작</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {transactions.map((t) => (
                      <motion.tr
                        key={t.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="group hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 text-xs text-white/60 tabular-nums">{t.date}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-full text-[10px] font-bold",
                            t.type === 'income' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          )}>
                            {t.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-white/40 italic">{t.note}</td>
                        <td className="px-6 py-4 text-right">
                          {editingId === t.id ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                autoFocus
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleEditSave(t.id)}
                                onBlur={() => handleEditSave(t.id)}
                                className="w-24 bg-white/10 border border-lime/50 rounded-lg px-2 py-1 text-xs text-white text-right focus:outline-none"
                              />
                            </div>
                          ) : (
                            <div 
                              onDoubleClick={() => handleEditStart(t.id, t.amount)}
                              className={cn(
                                "text-sm font-black tabular-nums cursor-pointer hover:scale-105 transition-transform",
                                t.type === 'income' ? "text-green-400" : "text-white"
                              )}
                            >
                              {t.type === 'income' ? '+' : '-'}₩{t.amount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(t.id)}
                            className="p-2 text-white/10 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-white/10">
                          <AlertCircle size={48} />
                          <p className="text-sm font-bold uppercase tracking-widest">거래 내역이 없습니다</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Chart Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass rounded-[40px] border border-white/10 p-8 h-full min-h-[400px] flex flex-col">
            <div className="flex items-center gap-3 text-white/40 mb-8">
              <PieChartIcon size={18} className="text-lime" />
              <span className="text-xs font-black uppercase tracking-widest">지출 상세 분석</span>
            </div>
            
            <div className="flex-1 w-full min-h-[300px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', border: 'none', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-[10px] font-bold text-white/60 ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-white/10 text-center">
                  <PieChartIcon size={64} />
                  <p className="text-xs font-bold uppercase tracking-widest px-8">지출 내역을 추가하면 통계가 표시됩니다</p>
                </div>
              )}
            </div>

            <div className="mt-8 p-6 bg-white/5 rounded-[32px] border border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Category Top List</p>
              <div className="space-y-3">
                {chartData.sort((a, b) => b.value - a.value).slice(0, 3).map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-xs font-bold text-white/60">{item.name}</span>
                    </div>
                    <span className="text-xs font-black text-white tabular-nums">₩{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-2 py-6 text-white/10">
        <div className="h-[1px] w-8 bg-current" />
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Personal Finance Service</p>
        <div className="h-[1px] w-8 bg-current" />
      </div>
    </motion.div>
  );
}
