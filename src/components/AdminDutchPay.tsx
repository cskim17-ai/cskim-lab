import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Receipt, Wallet, Plus, Trash2, 
  Copy, Share2, CircleDollarSign, ArrowRightLeft,
  CheckCircle2, AlertCircle, Info, Calculator,
  UserPlus, CreditCard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: string;
}

export default function AdminDutchPay() {
  const [people, setPeople] = useState<string[]>([]);
  const [newName, setNewName] = useState('');
  
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');

  const [copySuccess, setCopySuccess] = useState(false);

  // Add Person
  const addPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || people.includes(newName.trim())) return;
    setPeople([...people, newName.trim()]);
    setNewName('');
  };

  // Remove Person
  const removePerson = (name: string) => {
    setPeople(people.filter(p => p !== name));
    setExpenses(expenses.filter(e => e.payer !== name));
    if (payer === name) setPayer('');
  };

  // Add Expense
  const addExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || !payer) return;
    const newExp: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: desc,
      amount: Number(amount),
      payer: payer
    };
    setExpenses([...expenses, newExp]);
    setDesc('');
    setAmount('');
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Calculations
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const perPerson = people.length > 0 ? total / people.length : 0;
    
    const balances = people.map(name => {
      const paid = expenses
        .filter(e => e.payer === name)
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        name,
        paid,
        balance: paid - perPerson
      };
    });

    return { total, perPerson, balances };
  }, [people, expenses]);

  // Copy Summary to Clipboard
  const copySummary = () => {
    const summary = stats.balances.map(b => 
      `${b.name}: ${b.balance > 0 ? '+' : ''}${Math.round(b.balance).toLocaleString()}원 (지불: ${b.paid.toLocaleString()}원)`
    ).join('\n');
    
    const text = `[더치페이 계산 결과]\n총 금액: ${stats.total.toLocaleString()}원\n1인당: ${Math.round(stats.perPerson).toLocaleString()}원\n\n상세 내역:\n${summary}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">더치페이 정산</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">정산 프로토콜 v3.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Setup Side */}
        <div className="lg:col-span-4 space-y-10">
           {/* Section 1: People */}
           <div className="glass rounded-[48px] border border-white/10 p-8 sm:p-10 space-y-8 bg-forest/40 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center text-lime group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">참여 인원</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">인물별 지출액 설정</p>
                </div>
              </div>

              <form onSubmit={addPerson} className="flex flex-col sm:flex-row gap-4">
                 <input
                   type="text"
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   placeholder="이름 입력"
                   className="flex-1 bg-forest/50 border border-white/10 rounded-[24px] py-4 px-6 text-sm text-white focus:outline-none focus:border-lime transition-all placeholder:text-white/10"
                 />
                 <button 
                   type="submit"
                   className="p-4 bg-lime text-forest rounded-[24px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lime/20 flex items-center justify-center"
                 >
                   <UserPlus size={24} />
                 </button>
              </form>

              <div className="flex flex-wrap gap-2 pt-2">
                 <AnimatePresence>
                   {people.map(name => (
                     <motion.span
                       key={name}
                       initial={{ opacity: 0, scale: 0.8 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.8 }}
                       className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white flex items-center gap-2 group"
                     >
                       {name}
                       <button onClick={() => removePerson(name)} className="text-white/20 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                       </button>
                     </motion.span>
                   ))}
                 </AnimatePresence>
                 {people.length === 0 && (
                   <p className="text-[10px] font-bold text-white/10 uppercase italic tracking-widest pt-4">인원을 추가해주세요</p>
                 )}
              </div>
           </div>

           {/* Results Overview Card */}
           <div className="glass rounded-[48px] border border-white/10 p-8 sm:p-10 space-y-10 bg-forest/20 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-400/10 flex items-center justify-center text-sky-400">
                    <Wallet size={24} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">정산 요약</h3>
                    <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">최종 정산 분석</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                 <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">총 지출 금액</span>
                    <span className="text-2xl font-black text-white italic tabular-nums">{stats.total.toLocaleString()}원</span>
                 </div>
                 <div className="p-4 bg-white/5 rounded-3xl border border-white/5 flex flex-col gap-1">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">정산 금액 (1/N)</span>
                    <span className="text-2xl font-black text-lime italic tabular-nums">{Math.round(stats.perPerson).toLocaleString()}원</span>
                 </div>
              </div>

              <button
                onClick={copySummary}
                disabled={people.length === 0}
                className={cn(
                  "w-full py-5 rounded-3xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl",
                  copySuccess ? "bg-green-500 text-white" : "bg-white text-forest hover:bg-white/90"
                )}
              >
                {copySuccess ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                {copySuccess ? "복사 완료!" : "요약 복사하기"}
              </button>
           </div>
        </div>

        {/* Right: Expenses & Balance Table */}
        <div className="lg:col-span-8 space-y-8">
           {/* Section 2: Expense Entry */}
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6 bg-forest/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-400/10 flex items-center justify-center text-orange-400">
                  <Receipt size={20} />
                </div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">지출 내역 추가</h3>
              </div>

              <form onSubmit={addExpense} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">항목 설명</label>
                    <input
                      type="text"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="예: 점심 식사"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-all placeholder:text-white/10"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">금액 (₩)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="금액"
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-all placeholder:text-white/10"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-widest pl-2">결제자</label>
                    <select
                      value={payer}
                      onChange={(e) => setPayer(e.target.value)}
                      className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-4 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-all appearance-none"
                    >
                      <option value="">결제자 선택</option>
                      {people.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                 </div>
                 <button
                   type="submit"
                   disabled={!desc || !amount || !payer}
                   className="w-full py-4 bg-orange-400 text-forest font-black rounded-2xl hover:bg-orange-300 active:scale-95 transition-all shadow-xl shadow-orange-400/10 flex items-center justify-center gap-2 group disabled:opacity-50"
                 >
                   <Plus size={18} className="group-hover:scale-125 transition-transform" />
                   <span className="uppercase text-xs tracking-widest">기록</span>
                 </button>
              </form>

              {/* Expense List Mini */}
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                 {expenses.map(e => (
                   <div key={e.id} className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <CreditCard size={14} className="text-white/10" />
                        <div>
                          <p className="text-xs font-black text-white italic">{e.description}</p>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{e.payer}가 지불</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-black text-white tabular-nums">{e.amount.toLocaleString()}원</span>
                        <button onClick={() => removeExpense(e.id)} className="text-white/10 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                           <X size={14} />
                        </button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Section 3: Final Balance Table */}
           <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 bg-forest/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">개인별 정산표</h3>
                    <p className="text-[9px] text-white/20 uppercase tracking-[0.2em]">최종 정산 분석</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-white/5">
                          <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest">이름</th>
                          <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest">총 지불</th>
                          <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest">정산 목표</th>
                          <th className="pb-4 text-[10px] font-black text-white/20 uppercase tracking-widest text-right">잔액</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {stats.balances.map((b) => (
                          <tr key={b.name} className="group hover:bg-white/[0.02] transition-colors">
                             <td className="py-5 font-black text-white italic">{b.name}</td>
                             <td className="py-5 text-sm font-bold text-white/40 tabular-nums">{b.paid.toLocaleString()}원</td>
                             <td className="py-5 text-sm font-bold text-white/40 tabular-nums">{Math.round(stats.perPerson).toLocaleString()}원</td>
                             <td className="py-5 text-right">
                                <span className={cn(
                                   "text-lg font-black italic tabular-nums px-4 py-1.5 rounded-2xl",
                                   b.balance > 0 ? "bg-lime/10 text-lime" : b.balance < 0 ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/40"
                                )}>
                                   {b.balance > 0 ? '+' : ''}{Math.round(b.balance).toLocaleString()}원
                                </span>
                             </td>
                          </tr>
                       ))}
                       {stats.balances.length === 0 && (
                          <tr>
                             <td colSpan={4} className="py-20 text-center text-[10px] font-black text-white/10 uppercase tracking-[0.3em] italic">
                                데이터가 없습니다. 인원과 지출을 추가해주세요.
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-white/5 text-white/10">
         <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-current" />
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">바이브 원장 프로토콜</p>
            <div className="h-[1px] w-8 bg-current" />
         </div>
         <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest italic">
            <div className="flex items-center gap-1.5">
               <CircleDollarSign size={10} className="text-lime" />
               <span>정산 금액 동기화</span>
            </div>
            <div className="flex items-center gap-1.5">
               <Calculator size={10} />
               <span>정밀 부동소수점 v1</span>
            </div>
         </div>
      </div>
    </motion.div>
  );
}

function X({ size }: { size?: number }) {
  return (
    <svg 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
