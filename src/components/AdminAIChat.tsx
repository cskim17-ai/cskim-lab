import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { collection, addDoc, setDoc, doc, serverTimestamp, query, orderBy, onSnapshot, where, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: any;
  userId: string;
}

const CHAT_COLLECTION = 'chat_messages';

export default function AdminAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, CHAT_COLLECTION),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, CHAT_COLLECTION);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading || !auth.currentUser) return;

    const userText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // 1. Generate a doc ref first to get the ID
      const messagesRef = collection(db, CHAT_COLLECTION);
      const newDocRef = doc(messagesRef);

      // 2. Save user message to Firestore
      const userMsg = {
        id: newDocRef.id,
        role: 'user' as const,
        text: userText,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(newDocRef, userMsg);

      // 3. Call Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Prepare history for context
      // Filter out messages that don't have text or were incorrectly saved
      const chatHistory = messages
        .filter(m => m.text)
        .map(msg => ({
          role: msg.role,
          parts: [{ text: msg.text }]
        }));
      
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        history: chatHistory,
      });

      const result = await chat.sendMessage({ message: userText });
      const aiResponseText = result.text || '죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.';

      // 4. Save AI response to Firestore
      const aiDocRef = doc(messagesRef);
      const aiMsg = {
        id: aiDocRef.id,
        role: 'model' as const,
        text: aiResponseText,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
      };
      await setDoc(aiDocRef, aiMsg);

    } catch (error) {
      console.error("Chat error:", error);
      // Fallback response for UI
      const errorMessage = "AI와 연결하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      const messagesRef = collection(db, CHAT_COLLECTION);
      const errorDocRef = doc(messagesRef);
      const aiMsg = {
        id: errorDocRef.id,
        role: 'model' as const,
        text: errorMessage,
        userId: auth.currentUser.uid as string,
        createdAt: serverTimestamp(),
      };
      await setDoc(errorDocRef, aiMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!auth.currentUser || messages.length === 0) return;
    if (!confirm('대화 기록을 모두 삭제하시겠습니까?')) return;

    try {
      const q = query(
        collection(db, CHAT_COLLECTION),
        where('userId', '==', auth.currentUser.uid)
      );
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, CHAT_COLLECTION);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto h-[500px] sm:h-[600px] md:h-[750px] flex flex-col glass rounded-[40px] border border-white/10 overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime/20 flex items-center justify-center text-lime shadow-[0_0_15px_rgba(163,230,53,0.2)]">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black italic serif">AI 챗봇</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Vibe Intelligent Assistant</p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          disabled={messages.length === 0}
          className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all disabled:opacity-0"
          title="대화 초기화"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pr-4"
      >
        {messages.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-current flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <p className="text-sm font-bold uppercase tracking-widest italic">AI와 대화를 시작해보세요</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-start gap-3",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm",
                msg.role === 'user' ? "bg-white/10 text-white" : "bg-lime text-forest"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[80%] rounded-[24px] p-4 text-sm font-medium leading-relaxed",
                msg.role === 'user' 
                  ? "bg-white/5 border border-white/10 text-white rounded-tr-none" 
                  : "bg-white text-forest rounded-tl-none shadow-[0_10px_30px_rgba(0,0,0,0.1)]"
              )}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-lime text-forest flex items-center justify-center shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="bg-white text-forest rounded-[24px] rounded-tl-none p-4 flex gap-1.5 items-center shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0 }}
                className="w-1.5 h-1.5 bg-forest/40 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}
                className="w-1.5 h-1.5 bg-forest/40 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }}
                className="w-1.5 h-1.5 bg-forest/40 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-md">
        <form 
          onSubmit={handleSend}
          className="relative max-w-3xl mx-auto"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-forest/50 border border-white/10 rounded-[28px] py-4.5 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20 shadow-inner"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-lime text-forest flex items-center justify-center hover:bg-[#b0f533] active:scale-95 disabled:opacity-20 disabled:scale-100 transition-all shadow-xl"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
        <p className="text-center text-[9px] text-white/20 mt-4 font-bold uppercase tracking-[0.2em]">Powered by Gemini AI Engine</p>
      </div>
    </motion.div>
  );
}
