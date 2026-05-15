import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  BarChart3, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  PieChart, 
  Users, 
  Zap,
  Vote,
  HelpCircle,
  ChevronRight,
  ListPlus
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PollOption {
  id: string;
  text: string;
  votes: number;
  color: string;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  createdAt: number;
}

const COLORS = [
  'bg-blue-500',
  'bg-lime',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
];

export default function AdminPollCreator() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '']);
  const [poll, setPoll] = useState<Poll | null>(() => {
    const saved = localStorage.getItem('vibe_current_poll');
    return saved ? JSON.parse(saved) : null;
  });
  const [hasVoted, setHasVoted] = useState(() => {
    return localStorage.getItem('vibe_poll_voted') === 'true';
  });

  useEffect(() => {
    if (poll) {
      localStorage.setItem('vibe_current_poll', JSON.stringify(poll));
    } else {
      localStorage.removeItem('vibe_current_poll');
    }
  }, [poll]);

  useEffect(() => {
    localStorage.setItem('vibe_poll_voted', hasVoted.toString());
  }, [hasVoted]);

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = [...options];
      newOptions.splice(index, 1);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreatePoll = () => {
    if (!question.trim() || options.filter(o => o.trim()).length < 2) return;

    const newPoll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      question: question.trim(),
      options: options
        .filter(o => o.trim())
        .map((text, i) => ({
          id: `opt-${i}`,
          text: text.trim(),
          votes: 0,
          color: COLORS[i % COLORS.length]
        })),
      totalVotes: 0,
      createdAt: Date.now()
    };

    setPoll(newPoll);
    setHasVoted(false);
  };

  const handleVote = (optionId: string) => {
    if (!poll || hasVoted) return;

    const updatedOptions = poll.options.map(opt => 
      opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );

    setPoll({
      ...poll,
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1
    });
    setHasVoted(true);
  };

  const resetPoll = () => {
    if (window.confirm('투표를 초기화하고 새로 작성하시겠습니까?')) {
      setPoll(null);
      setHasVoted(false);
      setQuestion('');
      setOptions(['', '', '']);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">온라인 투표 작성</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Public Opinion Protocol v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          {poll && (
            <button 
              onClick={resetPoll}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95"
            >
               <RotateCcw size={16} className="text-lime" />
               <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">새 투표 작성</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!poll ? (
          <motion.div
            key="creator"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass rounded-[40px] border border-white/10 p-8 sm:p-12 space-y-10 bg-forest/20 shadow-2xl"
          >
             <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center text-lime">
                   <HelpCircle size={24} />
                </div>
                <div>
                   <h3 className="text-2xl font-black italic serif text-white">새로운 여론 조사</h3>
                   <p className="text-[10px] uppercase tracking-widest text-white/20 mt-1">Configure your question and options</p>
                </div>
             </div>

             {/* Question Input */}
             <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">질문 (Question)</label>
                <div className="relative group">
                   <input
                     type="text"
                     value={question}
                     onChange={(e) => setQuestion(e.target.value)}
                     placeholder="예: 이번 워크샵 장소로 어디가 좋을까요?"
                     className="w-full bg-forest/50 border border-white/10 rounded-3xl py-6 px-8 text-lg text-white font-bold focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/5"
                   />
                </div>
             </div>

             {/* Options Inputs */}
             <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">선택지 (Options)</label>
                   <span className="text-[10px] font-black text-white/10 uppercase tracking-widest">{options.length}/6 Options</span>
                </div>
                
                <div className="grid gap-4">
                   {options.map((option, index) => (
                      <motion.div 
                        key={index}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4"
                      >
                         <div className="relative flex-1 group">
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`옵션 ${index + 1}...`}
                              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/30 transition-all placeholder:text-white/10"
                            />
                            <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl", COLORS[index % COLORS.length])} />
                         </div>
                         {options.length > 2 && (
                            <button
                              onClick={() => handleRemoveOption(index)}
                              className="p-4 rounded-2xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                            >
                               <Trash2 size={18} />
                            </button>
                         )}
                      </motion.div>
                   ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                   <button
                     onClick={handleAddOption}
                     disabled={options.length >= 6}
                     className="flex-1 py-4 bg-white/5 text-white/40 font-black text-[11px] uppercase tracking-widest rounded-2xl border border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 group disabled:opacity-10"
                   >
                     <ListPlus size={18} className="group-hover:translate-y-[-2px] transition-transform" />
                     옵션 추가
                   </button>
                   <button
                     onClick={handleCreatePoll}
                     disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
                     className="flex-1 py-4 bg-lime text-forest font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-lime/10 flex items-center justify-center gap-3 group disabled:opacity-20"
                   >
                     <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                     투표 작성 완료
                   </button>
                </div>
             </div>
          </motion.div>
        ) : (
          <motion.div
            key="voter"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center space-y-12 py-10"
          >
             {/* Question Display */}
             <div className="text-center space-y-6 max-w-2xl mx-auto">
                <div className="flex items-center justify-center gap-3">
                   <div className="px-4 py-1.5 bg-lime text-forest text-[10px] font-black uppercase tracking-widest rounded-full">Active Poll</div>
                   <div className="flex items-center gap-2 text-white/20 text-[10px] font-black uppercase tracking-widest">
                      <Users size={12} />
                      <span>{poll.totalVotes}명 참여함</span>
                   </div>
                </div>
                <h3 className="text-3xl sm:text-5xl font-black italic serif text-white tracking-tighter leading-tight drop-shadow-2xl">
                   "{poll.question}"
                </h3>
             </div>

             {/* Voting Options */}
             <div className="w-full max-w-2xl grid gap-6">
                {poll.options.map((option) => {
                   const percentage = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                   return (
                      <div key={option.id} className="space-y-3">
                         <button
                           disabled={hasVoted}
                           onClick={() => handleVote(option.id)}
                           className={cn(
                             "w-full p-8 rounded-[32px] border transition-all relative overflow-hidden group",
                             hasVoted 
                               ? "bg-white/5 border-white/5 cursor-default opacity-60" 
                               : "bg-white/10 border-white/10 hover:border-lime/50 hover:bg-white/15 active:scale-[0.98] cursor-pointer"
                           )}
                         >
                            <div className="relative z-10 flex items-center justify-between">
                               <div className="flex items-center gap-6">
                                  <div className={cn("w-3 h-3 rounded-full shadow-lg", option.color)} />
                                  <span className="text-xl font-black text-white italic tracking-tight">{option.text}</span>
                               </div>
                               {!hasVoted ? (
                                  <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center text-lime opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                     <Vote size={24} />
                                  </div>
                               ) : (
                                  <div className="flex flex-col items-end">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-white/20">득표율</span>
                                     <span className="text-xl font-black tabular-nums text-white italic">{Math.round(percentage)}%</span>
                                  </div>
                               )}
                            </div>
                            
                            {/* Vote Count Info Overlay */}
                            <div className="absolute top-0 right-0 h-full w-32 flex items-center justify-end pr-8 opacity-0 group-hover:opacity-10 pointer-events-none">
                               <BarChart3 size={100} className="text-white" />
                            </div>
                         </button>

                         {/* Result Bar */}
                         <div className="px-4 h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1, ease: "circOut" }}
                              className={cn("absolute inset-y-0 left-0 rounded-full shadow-lg", option.color)}
                            />
                         </div>
                         <div className="flex justify-between px-6">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">{option.votes} VOTES</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/10">{percentage.toFixed(1)}%</span>
                         </div>
                      </div>
                   );
                })}
             </div>

             {/* Voting Status */}
             <AnimatePresence>
                {hasVoted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 pt-8"
                  >
                     <div className="flex items-center gap-3 px-8 py-4 bg-lime/10 rounded-2xl border border-lime/20 text-lime">
                        <CheckCircle2 size={24} />
                        <span className="text-sm font-black uppercase tracking-widest">투표에 참여해 주셔서 감사합니다!</span>
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">DEVICE_VOTING_LOCKED_SECURELY</p>
                  </motion.div>
                )}
             </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <PieChart size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Democratic Intelligence Hub</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Poll Protocol v1.0.4</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 데이터 집계</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>중복 투표 방지 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
