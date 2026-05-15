import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, Trash2, Copy, RefreshCw, 
  Save, Loader2, Check, Sliders, Sparkles, Send
} from 'lucide-react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { GoogleGenAI, Type } from "@google/genai";
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
  createdAt: any;
  userId: string;
}

export default function AdminPaletteGenerator({ 
  showAlert, 
  showConfirm 
}: { 
  showAlert: (msg: string) => void;
  showConfirm: (msg: string, onConfirm: () => void) => void;
}) {
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  // States for generation
  const [prompt, setPrompt] = useState('');
  const [currentColors, setCurrentColors] = useState<string[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'palettes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ColorPalette[];
      setPalettes(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'palettes');
    });

    return () => unsubscribe();
  }, []);

  const generatePaletteFromAI = async () => {
    if (!prompt.trim()) {
      showAlert('영감을 줄 단어나 문장을 입력해주세요.');
      return;
    }

    try {
      setIsGenerating(true);
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY is not defined');
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `"${prompt.trim()}"라는 키워드에서 연상되는 가장 세련되고 어울리는 5가지 색상의 HEX 코드 조합을 생성해줘.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 HEX color codes (e.g. #FF5733)"
              }
            },
            required: ["colors"]
          }
        }
      });

      const result = JSON.parse(response.text || '{"colors": []}');
      if (result.colors && result.colors.length > 0) {
        setCurrentColors(result.colors.map((c: string) => c.startsWith('#') ? c.toUpperCase() : `#${c}`.toUpperCase()));
      }
    } catch (error) {
      console.error('AI Generation Error:', error);
      showAlert('AI가 색상을 생성하는 중에 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePalette = async () => {
    if (currentColors.length === 0) return;
    
    try {
      setIsSaving(true);
      const palettesRef = collection(db, 'palettes');
      const newDocRef = doc(palettesRef);
      await setDoc(newDocRef, {
        id: newDocRef.id,
        name: prompt || 'AI 생성 팔레트',
        colors: currentColors,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      showAlert('팔레트가 저장되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'palettes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('이 팔레트를 삭제하시겠습니까?', async () => {
      try {
        await deleteDoc(doc(db, 'palettes', id));
        showAlert('팔레트가 삭제되었습니다.');
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'palettes');
      }
    });
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopiedColor(color);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-12 max-w-4xl mx-auto pb-20 px-4 sm:px-6 md:px-0"
    >
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-lime/10 border border-lime/20 text-lime text-[10px] font-black uppercase tracking-widest shadow-[0_0_30px_rgba(163,230,53,0.15)]">
          <Sparkles size={16} />
          AI 컬러 인텔리전스
        </div>
        <h2 className="text-4xl sm:text-6xl font-black italic serif tracking-tighter text-white">
          AI 팔레트 생성기
        </h2>
        <p className="text-white/40 font-bold max-w-md mx-auto leading-relaxed text-sm sm:text-lg">
          어떤 단어든 입력해보세요. <br className="hidden sm:block" /> AI가 그 감각을 색상으로 번역해드립니다.
        </p>
      </div>

      {/* Main Generator Interface */}
      <div className="space-y-8">
        {/* Input Box and Button */}
        <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white/5 border border-white/10 rounded-[32px] sm:rounded-[40px] backdrop-blur-3xl shadow-2xl focus-within:border-lime transition-all overflow-hidden">
          <input 
            type="text"
            placeholder="예: 차가운 달빛, 서울의 밤..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePaletteFromAI()}
            className="flex-1 bg-transparent px-6 py-4 sm:py-5 outline-none text-white font-bold placeholder:text-white/10 text-lg focus:placeholder:opacity-0 transition-opacity"
          />
          <button
            onClick={generatePaletteFromAI}
            disabled={isGenerating}
            className="flex items-center justify-center gap-3 bg-lime text-forest px-10 py-5 rounded-[24px] sm:rounded-[32px] font-black hover:shadow-[0_0_50px_rgba(163,230,53,0.5)] disabled:opacity-50 transition-all active:scale-95 shadow-2xl"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            <span className="uppercase tracking-widest text-sm">생성</span>
          </button>
        </div>

        {/* Palette Display Area */}
        <div className="relative min-h-[360px] glass rounded-[48px] border border-white/5 overflow-hidden shadow-inner group">
          <AnimatePresence mode="wait">
            {currentColors.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col md:flex-row"
              >
                {currentColors.map((color, index) => (
                  <motion.div
                    key={`${color}-${index}`}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex-1 min-h-[120px] md:min-h-0 relative flex flex-col items-center justify-center md:justify-end md:pb-12 gap-4 group/color transition-all cursor-pointer overflow-hidden"
                    style={{ backgroundColor: color }}
                    onClick={() => copyToClipboard(color)}
                  >
                    <div className="absolute top-8 opacity-0 group-hover/color:opacity-100 transition-all transform -translate-y-4 group-hover/color:translate-y-0">
                       <Copy className="text-white drop-shadow-lg" size={24} />
                    </div>
                    
                    <span className="font-black text-xl tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {color}
                    </span>
                    
                    {copiedColor === color && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
                      >
                        <div className="bg-white text-forest px-4 py-2 rounded-md font-black text-xs shadow-2xl tracking-tight">
                          복사됨!
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                
                {/* Save Overlay Button */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSavePalette();
                    }}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-white text-forest px-8 py-4 rounded-full font-black shadow-2xl hover:scale-105 active:scale-95 transition-all"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    이 구성 저장하기
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-white/5">
                   <div className="bg-white/5 p-5 rounded-full animate-pulse">
                     <Palette size={40} />
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="text-white/20 font-bold tracking-tight">생성된 색상이 없습니다.</p>
                  <p className="text-white/5 text-xs">단어를 입력하고 생성 버튼을 눌러보세요.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* History Section */}
      <AnimatePresence>
        {palettes.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
               <div className="flex items-center gap-3">
                 <Sliders size={20} className="text-lime" />
                 <h3 className="text-xl font-bold italic serif">저장된 기록</h3>
               </div>
               <span className="text-[10px] font-black text-white/20 bg-white/5 px-2.5 py-1 rounded-full uppercase tracking-widest">{palettes.length} collections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {palettes.map((palette) => (
                <motion.div 
                  key={palette.id}
                  className="glass bg-white/5 rounded-[32px] border border-white/10 overflow-hidden group/item flex flex-col h-48"
                >
                  <div className="flex flex-1">
                    {palette.colors.map((color, i) => (
                      <div 
                        key={i} 
                        className="flex-1 cursor-pointer transition-all hover:flex-[1.8] relative group/color-mini"
                        style={{ backgroundColor: color }}
                        onClick={() => copyToClipboard(color)}
                      >
                        {copiedColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                             <div className="bg-white text-forest text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                               복사됨!
                             </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="p-4 flex items-center justify-between bg-forest/20 backdrop-blur-md">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate pr-4">{palette.name}</h4>
                    </div>
                    <button 
                      onClick={() => handleDelete(palette.id)}
                      className="p-2 text-white/10 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
