import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Film, 
  Clock, 
  Armchair, 
  Ticket, 
  CheckCircle2, 
  Zap, 
  Info,
  Calendar,
  CreditCard,
  X,
  Smartphone
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Movie {
  id: string;
  title: string;
  price: number;
}

const MOVIES: Movie[] = [
  { id: '1', title: '에이리언: 로물루스', price: 15000 },
  { id: '2', title: '데드풀과 울버린', price: 14000 },
  { id: '3', title: '인사이드 아웃 2', price: 12000 },
  { id: '4', title: '트위스터스', price: 13000 },
];

const TIMES = ['10:00', '13:30', '16:00', '19:20', '22:15'];

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

// Pre-booked seats
const INITIAL_BOOKED = ['A3', 'A4', 'C5', 'D2', 'D3', 'F8', 'E1'];

export default function AdminMovieBooking() {
  const [selectedMovie, setSelectedMovie] = useState(MOVIES[0]);
  const [selectedTime, setSelectedTime] = useState(TIMES[1]);
  const [bookedSeats, setBookedSeats] = useState<string[]>(INITIAL_BOOKED);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const toggleSeat = (seatId: string) => {
    if (bookedSeats.includes(seatId)) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(s => s !== seatId) 
        : [...prev, seatId]
    );
  };

  const totalPrice = useMemo(() => {
    return selectedSeats.length * selectedMovie.price;
  }, [selectedSeats, selectedMovie]);

  const confirmBooking = () => {
    if (selectedSeats.length === 0) return;
    
    alert(`예매가 완료되었습니다!\n좌석: ${selectedSeats.join(', ')}\n총 금액: ${totalPrice.toLocaleString()}원`);
    
    setBookedSeats(prev => [...prev, ...selectedSeats]);
    setSelectedSeats([]);
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">영화 티켓 예매</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Cine-Booking System v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Film size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">실시간 좌석 현황 활성</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Settings */}
        <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-10">
           <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-10 space-y-8 bg-forest/20 shadow-2xl">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                    <Film size={20} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">영화 및 시간 선택</h3>
              </div>

              <div className="space-y-6">
                 {/* Movie Selection */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">영화 (Movie)</label>
                    <div className="relative group">
                       <select 
                         value={selectedMovie.id}
                         onChange={(e) => setSelectedMovie(MOVIES.find(m => m.id === e.target.value)!)}
                         className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all font-bold appearance-none cursor-pointer"
                       >
                         {MOVIES.map(movie => (
                           <option key={movie.id} value={movie.id}>{movie.title}</option>
                         ))}
                       </select>
                       <Zap className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" size={16} />
                    </div>
                 </div>

                 {/* Time Selection */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">상영 시간 (Time)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                       {TIMES.map(time => (
                         <button
                           key={time}
                           onClick={() => setSelectedTime(time)}
                           className={cn(
                             "py-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border",
                             selectedTime === time 
                               ? "bg-lime text-forest border-lime" 
                               : "bg-white/5 border-white/10 text-white/40 hover:border-white/20"
                           )}
                         >
                           {time}
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Price Display */}
                 <div className="p-6 rounded-3xl bg-black/40 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-white/20">티켓 단가</span>
                       <span className="text-sm font-black text-white">{selectedMovie.price.toLocaleString()}원</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-white/20">선택 좌석수</span>
                       <span className={cn("text-sm font-black transition-colors", selectedSeats.length > 0 ? "text-lime" : "text-white/20")}>
                          {selectedSeats.length}석
                       </span>
                    </div>
                    <div className="h-px bg-white/5" />
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase text-white/20">총 결제 금액</span>
                       <span className="text-2xl font-black italic serif text-white">{totalPrice.toLocaleString()}원</span>
                    </div>
                 </div>

                 <button
                   onClick={confirmBooking}
                   disabled={selectedSeats.length === 0}
                   className="w-full py-5 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20"
                 >
                   <CreditCard size={18} className="group-hover:rotate-12 transition-transform" />
                   <span className="uppercase tracking-widest text-sm">예매 확정하기</span>
                 </button>
              </div>
           </div>

           {/* Tips */}
           <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
              <div className="flex items-center gap-2">
                 <Info size={16} className="text-lime" />
                 <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">안내 사항</span>
              </div>
              <p className="text-[11px] text-white/30 leading-relaxed">
                 선택하신 좌석은 10분간 유지됩니다. 예매 완료 후 카카오톡으로 모바일 티켓이 발송됩니다.
              </p>
           </div>
        </div>

        {/* Right: Seat Grid */}
        <div className="lg:col-span-8 space-y-12">
           {/* Screen */}
           <div className="w-full space-y-6">
              <div className="flex flex-col items-center">
                 <div className="w-[80%] h-2 bg-white/5 rounded-full blur-[2px]" />
                 <div className="w-[90%] h-12 bg-gradient-to-b from-white/10 to-transparent clip-path-screen flex items-center justify-center">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[2em] ml-[2em]">SCREEN</span>
                 </div>
              </div>

              {/* Grid Content */}
              <div className="flex flex-col items-center space-y-10">
                 {/* Legend */}
                 <div className="flex items-center gap-8 px-8 py-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-white/10 border border-white/10" />
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">일반</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-lime" />
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">선택</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-sm bg-red-500/40" />
                       <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">예약됨</span>
                    </div>
                 </div>

                 {/* Grid */}
                 <div className="inline-grid gap-4 bg-black/20 p-10 rounded-[60px] border border-white/5">
                    {ROWS.map(row => (
                       <div key={row} className="flex items-center gap-4">
                          <span className="w-4 text-[10px] font-black text-white/10 text-center">{row}</span>
                          <div className="flex gap-2">
                             {COLS.map(col => {
                                const seatId = `${row}${col}`;
                                const isBooked = bookedSeats.includes(seatId);
                                const isSelected = selectedSeats.includes(seatId);

                                return (
                                  <button
                                    key={seatId}
                                    onClick={() => toggleSeat(seatId)}
                                    disabled={isBooked}
                                    className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center text-[8px] font-black transition-all transform active:scale-90",
                                      isBooked 
                                        ? "bg-red-500/20 text-red-500/40 cursor-not-allowed border border-red-500/10" 
                                        : isSelected
                                        ? "bg-lime text-forest shadow-lg shadow-lime/20"
                                        : "bg-white/5 border border-white/10 text-white/10 hover:bg-white/10 hover:text-white hover:border-white/20"
                                    )}
                                  >
                                     <Armchair size={12} className={cn(isSelected ? "text-forest" : "opacity-40")} />
                                  </button>
                                );
                             })}
                          </div>
                          <span className="w-4 text-[10px] font-black text-white/10 text-center">{row}</span>
                       </div>
                    ))}
                    
                    {/* Column Labels */}
                    <div className="flex items-center gap-4 mt-2 pl-8">
                       <div className="flex gap-2">
                          {COLS.map(col => (
                            <span key={col} className="w-8 text-[9px] font-bold text-white/5 text-center">{col}</span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Selection Status */}
           <AnimatePresence>
              {selectedSeats.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="glass border-white/10 rounded-[40px] p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
                 >
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-[24px] bg-lime/10 flex items-center justify-center text-lime shadow-inner shadow-lime/20">
                          <Ticket size={32} strokeWidth={1} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">장바구니</p>
                          <div className="flex flex-wrap gap-2">
                             {selectedSeats.map(seat => (
                               <span key={seat} className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[11px] font-black text-white">
                                  {seat}
                               </span>
                             ))}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">총액</p>
                       <p className="text-3xl font-black italic serif text-lime">{totalPrice.toLocaleString()}원</p>
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Smartphone size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Ticketing Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Cinema Protocol v4.0.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 프로토콜 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>좌석 가용성 검증 완료</span>
          </div>
        </div>
      </div>

      <style>{`
        .clip-path-screen {
          clip-path: polygon(0 0, 100% 0, 95% 100%, 5% 100%);
        }
      `}</style>
    </motion.div>
  );
}
