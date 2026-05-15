import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fuel, Plus, Search, Trash2, Calendar, 
  ChevronLeft, ChevronRight, Download, Loader2, MapPin, CreditCard, Droplets,
  RotateCcw, Camera, History, ChevronRight as ChevronRightIcon, X, Check, Save, ArrowLeft
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI, Type } from "@google/genai";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GasReceipt {
  id: string;
  date: string;
  stationName: string;
  amount: number;
  liters: number;
  fuelType: string;
  unitPrice: number;
  createdAt: any;
  userId: string;
}

type ViewMode = 'DASHBOARD' | 'CAMERA' | 'LIST' | 'FORM';

export default function AdminGasReceipts({ 
  showAlert, 
  showConfirm 
}: { 
  showAlert: (msg: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
}) {
  const [receipts, setReceipts] = useState<GasReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Summary State
  const [summaryPeriod, setSummaryPeriod] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  });

  // Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    stationName: '',
    amount: '',
    liters: '',
    fuelType: 'Gasoline',
    unitPrice: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'gas_receipts'),
      orderBy('date', 'desc'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as GasReceipt[];
      setReceipts(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'gas_receipts');
    });

    return () => unsubscribe();
  }, []);

  const handleAddReceipt = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!formData.stationName || !formData.amount || !formData.date) {
      showAlert('필수 항목을 입력해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      const receiptsRef = collection(db, 'gas_receipts');
      const newDocRef = doc(receiptsRef);
      await setDoc(newDocRef, {
        id: newDocRef.id,
        ...formData,
        amount: Number(formData.amount),
        liters: formData.liters ? Number(formData.liters) : 0,
        unitPrice: formData.unitPrice ? Number(formData.unitPrice) : 0,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      
      showAlert('영수증이 등록되었습니다.');
      setViewMode('DASHBOARD');
      setFormData({
        date: new Date().toISOString().split('T')[0],
        stationName: '',
        amount: '',
        liters: '',
        fuelType: 'Gasoline',
        unitPrice: ''
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'gas_receipts');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('정말 이 영수증을 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'gas_receipts', id));
        showAlert('영수증이 삭제되었습니다.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'gas_receipts');
      }
    });
  };

  // Summary Logic
  const allAvailablePeriods = React.useMemo(() => {
    const periods = new Set<string>();
    
    // Always include current month so user can see empty current state
    const now = new Date();
    periods.add(`${now.getFullYear()}-${now.getMonth() + 1}`);

    receipts.forEach(r => {
      // Use string splitting for timezone safety (YYYY-MM-DD)
      const parts = r.date.split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        if (!isNaN(y) && !isNaN(m)) {
          periods.add(`${y}-${m}`);
        }
      }
    });
    
    // Sort ascending (Oldest to Newest)
    return Array.from(periods).sort((a, b) => {
      const [ay, am] = a.split('-').map(Number);
      const [by, bm] = b.split('-').map(Number);
      if (ay !== by) return ay - by;
      return am - bm;
    });
  }, [receipts]);

  const fuelTypeMap: Record<string, string> = {
    'Gasoline': '휘발유',
    'Diesel': '경유',
    'LPG': 'LPG',
    'Premium': '고급휘발유'
  };

  const currentSelectionKey = `${summaryPeriod.year}-${summaryPeriod.month}`;
  const currentIndex = allAvailablePeriods.indexOf(currentSelectionKey);

  const navigateMonth = (direction: 'prev' | 'next') => {
    let { year, month } = summaryPeriod;
    const currentTotal = year * 12 + month;

    const periodsWithTotal = allAvailablePeriods.map(p => {
      const [y, m] = p.split('-').map(Number);
      return { y, m, total: y * 12 + m };
    });

    if (direction === 'prev') {
      const prevData = periodsWithTotal
        .filter(p => p.total < currentTotal)
        .sort((a, b) => b.total - a.total)[0];
      
      if (prevData) {
        setSummaryPeriod({ year: prevData.y, month: prevData.m });
      } else {
        month--;
        if (month < 1) { month = 12; year--; }
        setSummaryPeriod({ year, month });
      }
    } else {
      const nextData = periodsWithTotal
        .filter(p => p.total > currentTotal)
        .sort((a, b) => a.total - b.total)[0];
      
      if (nextData) {
        setSummaryPeriod({ year: nextData.y, month: nextData.m });
      } else {
        month++;
        if (month > 12) { month = 1; year++; }
        setSummaryPeriod({ year, month });
      }
    }
  };

  // Sync summaryPeriod: Default to newest available month (usually today) on first load
  useEffect(() => {
    if (allAvailablePeriods.length > 0 && currentIndex === -1) {
      // If current system date month isn't in recorded data (rare with our add-now logic),
      // jump to the newest month that actually has data or the current month we added.
      const lastPeriod = allAvailablePeriods[allAvailablePeriods.length - 1];
      const [y, m] = lastPeriod.split('-').map(Number);
      setSummaryPeriod({ year: y, month: m });
    }
  }, [allAvailablePeriods, currentIndex]);

  const monthString = `${summaryPeriod.year}-${String(summaryPeriod.month).padStart(2, '0')}`;
  const filteredForSummary = receipts.filter(r => r.date.startsWith(monthString));
  const totalMonthAmount = filteredForSummary.reduce((sum, r) => sum + r.amount, 0);
  const totalMonthCount = filteredForSummary.length;

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // 1. Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const pureBase64 = base64.split(',')[1];

      // 2. AI Extraction
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            { inlineData: { data: pureBase64, mimeType: file.type } },
            { text: "Extract the following information from this gas receipt: date(YYYY-MM-DD), stationName(string), amount(integer), fuelType (one of Gasoline, Diesel, LPG, Premium), liters(number), and unitPrice(number). If fuelType is unclear, default to Gasoline. Return ONLY a valid JSON object matching the schema." }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              stationName: { type: Type.STRING },
              amount: { type: Type.INTEGER },
              fuelType: { type: Type.STRING },
              liters: { type: Type.NUMBER },
              unitPrice: { type: Type.NUMBER },
            },
            required: ["date", "stationName", "amount"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setFormData({
        date: result.date || new Date().toISOString().split('T')[0],
        stationName: result.stationName || '',
        amount: result.amount?.toString() || '',
        liters: result.liters?.toString() || '',
        fuelType: ['Gasoline', 'Diesel', 'LPG', 'Premium'].includes(result.fuelType) ? result.fuelType : 'Gasoline',
        unitPrice: result.unitPrice?.toString() || ''
      });
      setViewMode('FORM');
    } catch (error) {
      console.error('AI Processing Error:', error);
      showAlert('영수증 분석 중 오류가 발생했습니다. 수동으로 입력해주세요.');
      setViewMode('FORM');
    } finally {
      setIsProcessing(false);
      // Clear file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Helper for year/month selection part removed replaced by useMemo above

  return (
    <div className="min-h-screen bg-transparent text-white font-sans pb-24 px-4 sm:px-6 md:px-0">
      {/* Header */}
      <div className="flex items-center justify-between py-10 max-w-2xl mx-auto border-b border-white/5 mb-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-lime p-3 rounded-2xl text-forest shadow-[0_0_30px_rgba(163,230,53,0.4)]">
              <Fuel size={28} />
            </div>
            <h1 className="text-3xl sm:text-5xl font-black italic serif tracking-tighter">주유 영수증</h1>
          </div>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black">AI 주유 기록 프로토콜 v2.5</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-4 bg-white/5 border border-white/10 rounded-3xl shadow-sm hover:bg-white/10 transition-all text-white/60 active:scale-90"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'DASHBOARD' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 max-w-2xl mx-auto space-y-8"
          >
            {/* Dashboard Header */}
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic serif">반가워요!</h2>
                <p className="text-white/40 font-medium tracking-tight text-xs">간편하게 기록을 관리하세요.</p>
              </div>

              {/* Compact Camera Button */}
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  ref={fileInputRef}
                  disabled={isProcessing}
                />
                <button className="w-14 h-14 bg-lime rounded-2xl flex items-center justify-center text-forest shadow-xl hover:scale-105 active:scale-95 transition-all">
                  {isProcessing ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Camera size={24} strokeWidth={2.5} />
                  )}
                  
                  {!isProcessing && (
                    <motion.div 
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-lime/30 rounded-2xl -z-10"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className="glass bg-white/5 rounded-[40px] p-8 shadow-2xl border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-lime opacity-10 blur-[80px]"></div>
               
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-white/30 uppercase">지출 요약</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateMonth('prev');
                      }}
                      className="relative z-30 p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all active:scale-75 cursor-pointer"
                      aria-label="이전 달"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex gap-2 items-center px-3 py-1.5 bg-white/10 border border-white/10 rounded-2xl min-w-[110px] justify-center select-none">
                      <span className="text-[11px] font-black text-white/90">{summaryPeriod.year}년</span>
                      <div className="w-px h-3 bg-white/20" />
                      <span className="text-[11px] font-black text-white/90">{summaryPeriod.month}월</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateMonth('next');
                      }}
                      className="relative z-30 p-2.5 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-all active:scale-75 cursor-pointer"
                      aria-label="다음 달"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
               </div>

               <div className="flex items-end justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white">
                      <span className="text-2xl mr-1.5 text-lime font-medium">₩</span>
                      {totalMonthAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-inner">
                    <span className="text-[10px] font-black text-lime pb-0.5">{totalMonthCount}건</span>
                  </div>
               </div>

               <p className="text-[11px] text-white/30 font-medium">
                 선택한 년월의 총 주유 금액입니다.
               </p>
            </div>

            {/* Monthly History List */}
            <div className="space-y-5">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">주유 내역</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-lime opacity-50 bg-lime/10 px-2.5 py-1 rounded-full">{totalMonthCount}건</span>
                  </div>
               </div>

               <div className="space-y-4">
                  {filteredForSummary.length === 0 ? (
                    <div className="py-20 text-center space-y-4 bg-white/5 rounded-[40px] border border-white/5 shadow-inner">
                       <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/5">
                          <History size={32} />
                       </div>
                       <p className="text-[11px] text-white/10 font-medium tracking-tight uppercase tracking-[0.1em]">내역이 없습니다</p>
                    </div>
                  ) : (
                    filteredForSummary.map(r => (
                      <div key={r.id} className="glass bg-white/5 rounded-[32px] p-6 border border-white/10 group relative transition-all active:scale-[0.98]">
                         <div className="flex items-start justify-between mb-4">
                            <div className="space-y-1.5">
                               <div className="flex items-center gap-1.5 opacity-30">
                                 <Calendar size={10} className="text-lime" />
                                 <p className="text-[9px] font-black tracking-widest uppercase">{r.date.split('-').slice(1).join('.')}</p>
                               </div>
                               <h4 className="font-bold text-white text-base tracking-tight">{r.stationName}</h4>
                            </div>
                            <button 
                              onClick={() => handleDelete(r.id)}
                              className="p-2 text-white/5 hover:text-red-500/40 transition-all rounded-full hover:bg-red-500/5"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                         <div className="flex items-end justify-between">
                            <div className="flex flex-wrap gap-2">
                               <span className="bg-white/10 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border border-white/10">{fuelTypeMap[r.fuelType] || r.fuelType}</span>
                               {r.liters > 0 && (
                                 <span className="bg-white/10 text-white/90 px-3 py-1.5 rounded-xl text-[10px] font-black border border-white/10">{r.liters}L</span>
                               )}
                               {r.unitPrice > 0 && (
                                 <span className="bg-lime/20 text-lime px-3 py-1.5 rounded-xl text-[10px] font-black border border-lime/10">₩{r.unitPrice.toLocaleString()}</span>
                               )}
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-black text-white">
                                <span className="text-sm mr-0.5 opacity-20 font-medium">₩</span>
                                {r.amount.toLocaleString()}
                              </p>
                            </div>
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'FORM' && (
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-6 max-w-2xl mx-auto space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
               <button onClick={() => setViewMode('DASHBOARD')} className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white transition-all">
                  <ArrowLeft size={20} />
               </button>
               <h2 className="text-xl font-bold serif italic">주유 정보 확인</h2>
            </div>

            <div className="glass bg-white/5 rounded-[32px] p-6 border border-white/10 space-y-5 shadow-2xl">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">주유일자</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-lime outline-none transition-all text-white"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">주유소명</label>
                <input 
                  type="text"
                  placeholder="주유소 이름 입력"
                  value={formData.stationName}
                  onChange={(e) => setFormData({...formData, stationName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-lime outline-none transition-all text-white placeholder:text-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">유종</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({...formData, fuelType: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-lime outline-none transition-all text-white appearance-none"
                  >
                    <option value="Gasoline" className="bg-forest">휘발유</option>
                    <option value="Premium" className="bg-forest">고급휘발유</option>
                    <option value="Diesel" className="bg-forest">경유</option>
                    <option value="LPG" className="bg-forest">LPG</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">결제금액</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-lime focus:border-lime outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">주유량 (L)</label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.liters}
                    onChange={(e) => setFormData({...formData, liters: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-lime outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30 ml-1">단가 (원/L)</label>
                  <input 
                    type="number"
                    placeholder="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:border-lime outline-none transition-all"
                  />
                </div>
              </div>

              <button
                onClick={() => handleAddReceipt()}
                disabled={isSaving}
                className="w-full bg-lime text-forest py-5 rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                영수증 기록 저장
              </button>
            </div>
          </motion.div>
        )}

        {viewMode === 'LIST' && (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-6 max-w-2xl mx-auto space-y-5"
          >
             <div className="flex items-center gap-3 mb-2">
               <button onClick={() => setViewMode('DASHBOARD')} className="p-2.5 bg-white/5 border border-white/10 rounded-full text-white/40 hover:text-white transition-all">
                  <ArrowLeft size={20} />
               </button>
               <h2 className="text-xl font-bold serif italic">주유 내역 보기</h2>
            </div>
            
            <div className="space-y-4">
              {receipts.length === 0 ? (
                <div className="py-24 text-center space-y-6 bg-white/5 rounded-[40px] border border-white/10">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto text-white/10">
                      <History size={48} />
                   </div>
                   <p className="text-white/20 font-medium">기록된 내역이 없습니다.</p>
                </div>
              ) : (
                receipts.map(r => (
                  <div key={r.id} className="bg-white/5 rounded-3xl p-6 shadow-xl border border-white/10 group relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-lime/5 blur-3xl -z-10 group-hover:bg-lime/10 transition-colors"></div>
                     
                     <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                           <div className="flex items-center gap-2">
                             <Calendar size={12} className="text-lime" />
                             <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{r.date}</p>
                           </div>
                           <h4 className="font-bold text-white text-lg line-clamp-1">{r.stationName}</h4>
                        </div>
                        <button 
                          onClick={() => handleDelete(r.id)}
                          className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                     </div>
                     <div className="flex items-end justify-between">
                        <div className="flex flex-wrap gap-2 mb-1">
                           <span className="bg-lime/10 text-lime px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight shadow-sm">{fuelTypeMap[r.fuelType] || r.fuelType}</span>
                           {r.liters > 0 && (
                             <span className="bg-white/10 text-white/90 px-2.5 py-1 rounded-lg text-[10px] font-black border border-white/10">{r.liters}L</span>
                           )}
                           {r.unitPrice > 0 && (
                             <span className="bg-white/10 text-white/60 px-2.5 py-1 rounded-lg text-[10px] font-black border border-white/10">₩{r.unitPrice.toLocaleString()}</span>
                           )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-white">
                            <span className="text-sm mr-1 opacity-40 font-medium text-white/40">₩</span>
                            {r.amount.toLocaleString()}
                          </p>
                        </div>
                     </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
