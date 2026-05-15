import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Copy, Check, RefreshCw, Lock, AlertCircle, Shield, ShieldAlert } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AdminPasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(12);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const charset = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };

    let characters = '';
    if (options.uppercase) characters += charset.uppercase;
    if (options.lowercase) characters += charset.lowercase;
    if (options.numbers) characters += charset.numbers;
    if (options.symbols) characters += charset.symbols;

    if (!characters) {
      setPassword('');
      return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        generatedPassword += characters.charAt(randomIndex);
    }
    setPassword(generatedPassword);
  }, [length, options]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const calculateStrength = () => {
    if (password.length === 0) return { label: '없음', color: 'text-white/20', bg: 'bg-white/5' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 14) score += 1;
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*()_+~`|}{[\]:;?><,./\-=]/.test(password);
    
    const varietyCount = [hasUpper, hasLower, hasNumbers, hasSymbols].filter(Boolean).length;
    
    if (varietyCount >= 3) score += 1;
    if (varietyCount === 4 && password.length >= 12) score += 1;

    if (score <= 1) return { label: '약함', color: 'text-red-400', bg: 'bg-red-400/10', icon: ShieldAlert };
    if (score === 2) return { label: '보통', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: AlertCircle };
    return { label: '강함', color: 'text-lime', bg: 'bg-lime/10', icon: ShieldCheck };
  };

  const strength = calculateStrength();
  const StrengthIcon = strength.icon || Shield;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      <div className="flex flex-col items-center space-y-6 text-center">
        <div className="flex items-center gap-4 text-lime">
          <div className="w-12 h-12 rounded-2xl bg-lime/10 flex items-center justify-center shadow-xl">
            <Lock size={28} className="animate-pulse" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black italic serif underline decoration-lime/50 underline-offset-12">보안 코드 생성</h2>
        </div>
        <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Secure Password Protocol v4.0</p>
      </div>

      <div className="glass rounded-[40px] border border-white/10 p-8 space-y-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-lime/5 blur-[40px] translate-y-1/2 -translate-x-1/2" />

        {/* Password Display */}
        <div className="relative">
          <div className="w-full bg-forest/50 border border-white/5 rounded-2xl p-6 font-mono text-xl sm:text-2xl break-all min-h-[60px] flex items-center justify-center text-center shadow-inner">
            {password || <span className="text-white/10 italic">옵션을 선택하세요</span>}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              strength.bg,
              strength.color
            )}>
              <StrengthIcon size={12} />
              보안 등급: {strength.label}
            </div>

            <button
              onClick={handleCopy}
              disabled={!password}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all active:scale-95",
                copied 
                  ? "bg-lime text-forest" 
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? '복사됨!' : '비밀번호 복사'}
            </button>
          </div>
        </div>

        {/* Configuration */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-white/40 uppercase tracking-[0.2em]">비밀번호 길이</span>
              <span className="text-lime font-black text-lg">{length}</span>
            </div>
            <input
              type="range"
              min="4"
              max="50"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-lime border border-white/5"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'uppercase', label: '대문자 (ABCD)', sub: 'ABCD' },
              { id: 'lowercase', label: '소문자 (abcd)', sub: 'abcd' },
              { id: 'numbers', label: '숫자 (1234)', sub: '1234' },
              { id: 'symbols', label: '특수문자 (!@#)', sub: '!@#$' },
            ].map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                  options[option.id as keyof typeof options]
                    ? "bg-lime/5 border-lime/30"
                    : "bg-white/2 border-white/5 hover:border-white/20"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter group-hover:text-white/60 transition-colors">
                    {option.label}
                  </span>
                  <span className={cn(
                    "font-mono text-sm",
                    options[option.id as keyof typeof options] ? "text-lime" : "text-white/20"
                  )}>
                    {option.sub}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={options[option.id as keyof typeof options]}
                  onChange={() => setOptions(prev => ({ ...prev, [option.id]: !prev[option.id as keyof typeof options] }))}
                  className="w-5 h-5 rounded-lg border-2 border-white/10 bg-transparent checked:bg-lime checked:border-lime transition-all appearance-none cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={generatePassword}
          className="w-full bg-lime text-forest py-5 rounded-[24px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-[#b0f533] active:scale-95 shadow-[0_10px_40px_rgba(163,230,53,0.15)] group"
        >
          <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          비밀번호 다시 생성
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-white/10">
        <div className="h-[1px] w-8 bg-current" />
        <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Coding Security Services</p>
        <div className="h-[1px] w-8 bg-current" />
      </div>
    </motion.div>
  );
}
