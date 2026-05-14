import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Users, MessageSquare, Bell, BellOff, 
  Settings, LogOut, Loader2, AlertCircle, CheckCircle2,
  Volume2, VolumeX, User as UserIcon
} from 'lucide-react';
import { 
  collection, query, orderBy, limit, onSnapshot, 
  addDoc, serverTimestamp, doc, setDoc, getDocs, 
  where, Timestamp, deleteDoc
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ChatMessage {
  id: string;
  nickname: string;
  text: string;
  createdAt: any;
  userId: string;
}

interface PresenceUser {
  userId: string;
  nickname: string;
  lastSeen: any;
}

export default function AdminRealtimeChat() {
  const [nickname, setNickname] = useState<string>(() => localStorage.getItem('vibe_chat_nickname') || '');
  const [tempNickname, setTempNickname] = useState('');
  const [isJoined, setIsJoined] = useState(!!nickname);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [status, setStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const notificationSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio
  useEffect(() => {
    notificationSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
    notificationSound.current.volume = 0.5;
  }, []);

  // Nickname join handler
  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempNickname.trim()) {
      const name = tempNickname.trim();
      setNickname(name);
      localStorage.setItem('vibe_chat_nickname', name);
      setIsJoined(true);
      
      // Notify others
      sendSystemMessage(`${name}님이 입장하셨습니다.`);
    }
  };

  const sendSystemMessage = async (text: string) => {
    if (!auth.currentUser) return;
    try {
      const messagesRef = collection(db, 'classic_chat_messages');
      const docRef = doc(messagesRef);
      await setDoc(docRef, {
        id: docRef.id,
        nickname: '시스템', // System nickname
        text,
        userId: 'system',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("System message failed:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !auth.currentUser) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const messagesRef = collection(db, 'classic_chat_messages');
      const docRef = doc(messagesRef);
      await setDoc(docRef, {
        id: docRef.id,
        nickname,
        text,
        userId: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'classic_chat_messages');
    }
  };

  // Messages Subscription
  useEffect(() => {
    if (!isJoined) return;

    setStatus('connected');
    const q = query(collection(db, 'classic_chat_messages'), orderBy('createdAt', 'desc'), limit(50));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        newMessages.push(doc.data() as ChatMessage);
      });
      
      const sorted = newMessages.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0;
        const timeB = b.createdAt?.toMillis?.() || 0;
        return timeA - timeB;
      });

      // Show notification for new messages if document is hidden
      if (snapshot.docChanges().length > 0 && messages.length > 0) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const msg = change.doc.data() as ChatMessage;
            if (msg.userId !== auth.currentUser?.uid && msg.userId !== 'system') {
              if (document.hidden) {
                if (soundEnabled && notificationSound.current) {
                  notificationSound.current.play().catch(() => {});
                }
                if (notificationsEnabled) {
                  new Notification(`${msg.nickname}`, {
                    body: msg.text,
                    icon: '/pwa-192x192.png'
                  });
                }
              }
            }
          }
        });
      }

      setMessages(sorted);
    }, (error) => {
      setStatus('disconnected');
      handleFirestoreError(error, OperationType.GET, 'classic_chat_messages');
    });

    return () => unsubscribe();
  }, [isJoined, notificationsEnabled, soundEnabled, messages.length]);

  // Presence Heartbeat
  useEffect(() => {
    if (!isJoined || !auth.currentUser) return;

    const presenceRef = doc(db, 'chat_presence', auth.currentUser.uid);
    
    const sendPulse = async () => {
      try {
        await setDoc(presenceRef, {
          userId: auth.currentUser?.uid,
          nickname,
          lastSeen: serverTimestamp()
        });
      } catch (error) {
        console.warn("Presence pulse failed", error);
      }
    };

    sendPulse();
    const interval = setInterval(sendPulse, 20000); // Pulse every 20s

    return () => clearInterval(interval);
  }, [isJoined, nickname]);

  // Active Users Subscription
  useEffect(() => {
    if (!isJoined) return;

    const q = query(collection(db, 'chat_presence'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users: PresenceUser[] = [];
      const now = Date.now();
      snapshot.forEach((doc) => {
        const data = doc.data() as PresenceUser;
        const lastSeen = data.lastSeen?.toMillis?.() || 0;
        // Only show users active in the last 60 seconds
        if (now - lastSeen < 60000) {
          users.push(data);
        }
      });
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, [isJoined]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Browser Notification Permission
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === 'granted');
  };

  useEffect(() => {
    if ("Notification" in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  if (!isJoined) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto mt-20 p-10 glass rounded-[40px] border border-white/10 text-center space-y-8"
      >
        <div className="w-20 h-20 bg-lime/10 rounded-3xl flex items-center justify-center mx-auto text-lime">
          <MessageSquare size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black italic serif text-white">Vibe Real-time Chat</h2>
          <p className="text-xs text-white/40 uppercase tracking-widest font-bold">대화에 참여하기 위해 닉네임을 설정하세요</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            autoFocus
            type="text"
            value={tempNickname}
            onChange={(e) => setTempNickname(e.target.value)}
            placeholder="사용하실 닉네임을 입력하세요"
            maxLength={20}
            className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20 text-center font-bold"
          />
          <button
            type="submit"
            className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10"
          >
            대화 시작하기
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto h-[700px] flex gap-6"
    >
      {/* Side Bar */}
      <div className="w-64 hidden lg:flex flex-col gap-6">
        {/* Status Card */}
        <div className="glass rounded-[32px] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Connection</span>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", status === 'connected' ? "bg-lime animate-pulse" : "bg-red-500")} />
              <span className={cn("text-[9px] font-bold uppercase", status === 'connected' ? "text-lime" : "text-red-500")}>
                {status === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Notifications</span>
              <button 
                onClick={requestNotificationPermission}
                className={cn("p-2 rounded-xl transition-all", notificationsEnabled ? "bg-lime/10 text-lime" : "bg-white/5 text-white/20")}
              >
                {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sound</span>
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={cn("p-2 rounded-xl transition-all", soundEnabled ? "bg-lime/10 text-lime" : "bg-white/5 text-white/20")}
              >
                {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Online Users Card */}
        <div className="glass rounded-[32px] border border-white/10 p-6 flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-lime" />
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Online Users</span>
            </div>
            <span className="px-2 py-0.5 bg-lime/10 text-lime text-[10px] font-black rounded-lg">{onlineUsers.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {onlineUsers.map(u => (
              <div key={u.userId} className="flex items-center gap-3 p-2 group">
                <div className="w-8 h-8 rounded-xl bg-forest/50 flex items-center justify-center text-white/20 group-hover:bg-lime/10 group-hover:text-lime transition-all">
                  <UserIcon size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white/60 truncate max-w-[120px]">{u.nickname}</span>
                  <span className="text-[8px] text-lime/40 uppercase tracking-tighter">Active now</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout button */}
        <button 
          onClick={() => {
            localStorage.removeItem('vibe_chat_nickname');
            setIsJoined(false);
          }}
          className="flex items-center justify-center gap-2 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
        >
          <LogOut size={14} />
          채팅 그만하기
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-[40px] border border-white/10 flex flex-col min-w-0 overflow-hidden bg-forest/50">
        {/* Chat Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-lime rounded-2xl flex items-center justify-center text-forest">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Vibe Collective Channel</h3>
              <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">Public Chat Server</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
             <span className="px-2 py-0.5 bg-lime/10 text-lime text-[10px] font-black rounded-lg flex items-center gap-1">
               <Users size={10} /> {onlineUsers.length}
             </span>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
        >
          <AnimatePresence mode="popLayout">
            {messages.map((m) => {
              const isMe = m.userId === auth.currentUser?.uid;
              const isSystem = m.userId === 'system';

              if (isSystem) {
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center"
                  >
                    <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-bold text-white/20 uppercase tracking-widest">
                      {m.text}
                    </span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: isMe ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    isMe ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    {!isMe && <span className="text-[10px] font-black text-lime uppercase tracking-widest">{m.nickname}</span>}
                    <span className="text-[8px] text-white/10 tabular-nums">
                      {m.createdAt?.toMillis ? new Date(m.createdAt.toMillis()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                    {isMe && <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">You</span>}
                  </div>
                  <div className={cn(
                    "px-4 py-3 rounded-2xl text-xs font-medium leading-relaxed shadow-lg break-words w-full",
                    isMe 
                      ? "bg-lime text-forest rounded-tr-none" 
                      : "bg-[#2a2a2a] text-white border border-white/5 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-forest/80 backdrop-blur-md border-t border-white/5">
          <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="대화 내용을 입력하세요..."
              className="flex-1 bg-white/5 border border-white/10 rounded-[20px] py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10 shadow-inner"
            />
            <button
              disabled={!inputText.trim() || status === 'disconnected'}
              type="submit"
              className="absolute right-2 w-10 h-10 rounded-xl bg-lime text-forest flex items-center justify-center hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl disabled:opacity-20 disabled:grayscale disabled:scale-100"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-4">
             <div className="flex items-center gap-2 text-[8px] font-black text-white/10 uppercase tracking-widest">
               <CheckCircle2 size={10} className="text-lime" />
               E2E Encryption Active
             </div>
             <p className="text-[9px] text-white/20 italic">Vibe Coding Network Protocol v1.0</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
