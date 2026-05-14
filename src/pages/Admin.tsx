import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Lock, Eye, EyeOff, AlertCircle, ChevronDown,
  SmartphoneNfc, FlaskConical, ListTodo, Fuel, Palette, Map, Brain, ShieldCheck, MessageSquare, CloudSun
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  doc, 
  onSnapshot, 
  getDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, signInAnonymously, type User } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { bootstrapSettings } from '../lib/bootstrap';
import firebaseConfig from '../../firebase-applet-config.json';
import AdminLab from '../components/AdminLab';
import AdminNFCTags from '../components/AdminNFCTags';
import AdminTodoList from '../components/AdminTodoList';
import AdminGasReceipts from '../components/AdminGasReceipts';
import AdminPaletteGenerator from '../components/AdminPaletteGenerator';
import AdminInteractiveMap from '../components/AdminInteractiveMap';
import AdminFlashcardQuiz from '../components/AdminFlashcardQuiz';
import AdminPasswordGenerator from '../components/AdminPasswordGenerator';
import AdminAIChat from '../components/AdminAIChat';
import AdminWorldWeather from '../components/AdminWorldWeather';
import AdminFinanceManager from '../components/AdminFinanceManager';
import AdminRealtimeChat from '../components/AdminRealtimeChat';
import AdminRecipeFinder from '../components/AdminRecipeFinder';
import AdminMarkdownBlog from '../components/AdminMarkdownBlog';
import AdminHabitTracker from '../components/AdminHabitTracker';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'nfcTags' | 'lab' | 'vibeCoding' | 'gasReceipts' | 'paletteGenerator' | 'interactiveMap' | 'flashcardQuiz' | 'passwordGenerator' | 'aiChat' | 'worldWeather' | 'personalFinance' | 'placeholder' | 'realtimeChat' | 'recipeFinder' | 'markdownBlog' | 'habitTracker'>(() => {
    const saved = localStorage.getItem('lastAdminTab');
    if (saved && ['nfcTags', 'lab', 'vibeCoding', 'gasReceipts', 'paletteGenerator', 'interactiveMap', 'flashcardQuiz', 'passwordGenerator', 'aiChat', 'worldWeather', 'personalFinance', 'placeholder', 'realtimeChat', 'recipeFinder', 'markdownBlog', 'habitTracker'].includes(saved)) {
      return saved as 'nfcTags' | 'lab' | 'vibeCoding' | 'gasReceipts' | 'paletteGenerator' | 'interactiveMap' | 'flashcardQuiz' | 'passwordGenerator' | 'aiChat' | 'worldWeather' | 'personalFinance' | 'placeholder' | 'realtimeChat' | 'recipeFinder' | 'markdownBlog' | 'habitTracker';
    }
    return 'nfcTags';
  });

  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('lastAdminTab', activeTab);
  }, [activeTab]);

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Initialize
  useEffect(() => {
    bootstrapSettings().catch(console.error);
  }, []);
  
  const menuConfig = [
    {
      id: 'lab1',
      label: 'NFC실험',
      items: [
        { id: 'nfcTags', label: 'NFC 태그 관리' },
        { id: 'lab', label: 'NFC전송' },
      ]
    },
    {
      id: 'vibe1',
      label: '바이브코딩1',
      items: [
        { id: 'vibeCoding', label: '1.할일목록' },
        { id: 'gasReceipts', label: '주유영수증' },
        { id: 'paletteGenerator', label: '3.팔레트 생성기' },
        { id: 'interactiveMap', label: '4.인터랙티브 지도' },
        { id: 'flashcardQuiz', label: '5.플래시 카드 퀴즈' },
        { id: 'passwordGenerator', label: '6.안전한 비밀번호 생성' },
        { id: 'aiChat', label: '7.AI 챗봇' },
        { id: 'worldWeather', label: '8.실시간 세계 날씨' },
        { id: 'personalFinance', label: '10. 개인 금융 관리' },
      ]
    },
    {
      id: 'vibe2',
      label: '바이브코딩2',
      items: [
        { id: 'realtimeChat', label: '11. 실시간 채팅' },
        { id: 'recipeFinder', label: '12.레시피 찾기' },
        { id: 'markdownBlog', label: '13. 마크다운 블로그' },
        { id: 'habitTracker', label: '14. 습관 관리' },
        { id: 'placeholder', label: '준비 중...' },
      ]
    }
  ];
  
  const [user, setUser] = useState<User | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isStorageDegraded, setIsStorageDegraded] = useState(false);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal state
  const [modal, setModal] = useState<{
    type: 'alert' | 'confirm' | null;
    message: string;
    onConfirm?: () => void;
  }>({ type: null, message: '' });

  const showAlert = useCallback((message: string) => {
    setModal({ type: 'alert', message });
  }, []);

  const showConfirm = useCallback((message: string, onConfirm: () => void) => {
    setModal({ type: 'confirm', message, onConfirm });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdown(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Logo loading
  useEffect(() => {
    const path = 'settings/logo';
    const unsubscribe = onSnapshot(doc(db, 'settings', 'logo'), (snap) => {
      if (snap.exists()) {
        setLogoUrl(snap.data().logoUrl || '');
        setIsFirestoreOffline(false);
      }
    }, (error) => {
      if (error.code === 'permission-denied') {
        return;
      }
      if (error.message?.includes('offline')) {
        setIsFirestoreOffline(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const performAnonymousLogin = useCallback(() => {
    signInAnonymously(auth).then((result) => {
      setUser(result.user);
      setIsStorageDegraded(false);
    }).catch(err => {
      if (err.code === 'auth/admin-restricted-operation') {
        setIsStorageDegraded(true);
      } else {
        console.warn("Auth check failed:", err.message);
      }
      setUser(null);
    });
  }, []);

  useEffect(() => {
    // Attempt login but don't block
    performAnonymousLogin();
    setIsConfigLoaded(true);
  }, [performAnonymousLogin]);

  const handleLogout = async () => {
    try {
      if (user) {
        await signOut(auth);
      }
      setUser(null);
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-forest text-white flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 px-4 sm:px-6 py-3 bg-forest shadow-2xl">
        <div className="flex items-center justify-between gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg border border-white/10 p-1 bg-white/5" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-lime rounded-lg flex items-center justify-center font-bold text-forest text-sm sm:text-base">CL</div>
            )}
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-lg font-bold">cskim-lab</h1>
              <p className="text-[10px] sm:text-xs text-white/60 leading-none">관리 시스템</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap gap-x-8 justify-start flex-1">
            {menuConfig.map((menu) => (
              <div 
                key={menu.id}
                className="relative group"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === menu.id ? null : menu.id);
                }}
              >
                <button 
                  className={cn(
                    "flex items-center gap-1 text-sm font-bold transition-all py-2 whitespace-nowrap",
                    menu.items.some(item => item.id === activeTab) ? "text-lime" : "text-white/60 hover:text-white"
                  )}
                >
                  {menu.label}
                  <ChevronDown size={14} className={cn("transition-transform", openDropdown === menu.id && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {openDropdown === menu.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-1 w-48 bg-[#2a2a2a] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-50 px-1 py-1"
                    >
                      {menu.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-xs font-medium transition-all rounded-lg mb-0.5 last:mb-0",
                            activeTab === item.id 
                              ? "bg-lime text-forest" 
                              : "text-white/70 hover:bg-white/5 hover:text-white"
                          )}
                        >
                          {item.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="p-2 text-white/40 hover:text-red-400 transition-all rounded-lg"
              title="로그아웃"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Category Navigation */}
      <div className="md:hidden sticky top-[60px] z-[40] bg-forest/90 backdrop-blur-xl border-b border-white/5 px-4 py-3 flex gap-6 items-center">
        {menuConfig.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              onClick={() => setActiveCategory(activeCategory === menu.id ? null : menu.id)}
              className={cn(
                "flex items-center gap-1.5 text-sm font-black transition-all",
                menu.items.some(item => item.id === activeTab) ? "text-lime" : "text-white/40 hover:text-white"
              )}
            >
              {menu.label}
              <ChevronDown 
                size={14} 
                className={cn("transition-transform duration-300", activeCategory === menu.id ? "rotate-180" : "rotate-0")} 
              />
            </button>

            <AnimatePresence>
              {activeCategory === menu.id && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setActiveCategory(null)}
                    className="fixed inset-0 z-[-1]"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-3 w-[260px] bg-[#222222]/95 backdrop-blur-2xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl p-2 z-50"
                  >
                    {menu.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setActiveCategory(null);
                        }}
                        className={cn(
                          "w-full text-left px-5 py-3.5 text-sm font-bold transition-all rounded-[20px] mb-1 last:mb-0",
                          activeTab === item.id 
                            ? "bg-lime text-forest" 
                            : "text-white/60 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <main className="flex-1 pb-32 px-4 sm:px-8 md:px-16 lg:px-32 max-w-[1600px] mx-auto w-full pt-6">
        {isFirestoreOffline && (
          <div className="mb-8 p-6 bg-orange-500/20 border border-orange-500/30 rounded-[30px] flex flex-col gap-6">
            <div className="flex items-start gap-4 text-orange-400">
              <AlertCircle size={24} className="shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-bold text-lg mb-2 text-white">Firestore 연결 오류 (오프라인 상태)</p>
                <div className="text-sm opacity-90 space-y-4">
                  <div className="bg-black/60 p-5 rounded-2xl border border-orange-500/50 shadow-inner">
                    <p className="font-bold mb-2 text-orange-300">현재 앱이 연결된 프로젝트 ID:</p>
                    <code className="text-white font-mono break-all text-base bg-white/5 p-2 rounded block">{firebaseConfig.projectId}</code>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="leading-relaxed text-white/80">
                      데이터베이스에 연결할 수 없습니다. Firebase 콘솔에서 <strong>Firestore Database</strong>가 생성되어 있는지 확인해 주세요.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3 shrink-0">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl"
                >
                  페이지 새로고침
                </button>
                <button 
                  onClick={() => window.open(`https://console.firebase.google.com/project/${firebaseConfig.projectId}`, '_blank')}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all border border-white/10 text-sm backdrop-blur-sm"
                >
                  해당 프로젝트 콘솔 열기
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="w-full">
          {activeTab === 'lab' && <AdminLab showAlert={showAlert} showConfirm={showConfirm} />}
          {activeTab === 'nfcTags' && <AdminNFCTags showAlert={showAlert} showConfirm={showConfirm} />}
          {activeTab === 'vibeCoding' && <AdminTodoList showAlert={showAlert} showConfirm={showConfirm} />}
          {activeTab === 'gasReceipts' && <AdminGasReceipts showAlert={showAlert} showConfirm={showConfirm} />}
          {activeTab === 'paletteGenerator' && <AdminPaletteGenerator showAlert={showAlert} showConfirm={showConfirm} />}
          {activeTab === 'interactiveMap' && <AdminInteractiveMap />}
          {activeTab === 'flashcardQuiz' && <AdminFlashcardQuiz />}
          {activeTab === 'passwordGenerator' && <AdminPasswordGenerator />}
          {activeTab === 'aiChat' && <AdminAIChat />}
          {activeTab === 'worldWeather' && <AdminWorldWeather />}
          {activeTab === 'personalFinance' && <AdminFinanceManager />}
          {activeTab === 'realtimeChat' && <AdminRealtimeChat />}
          {activeTab === 'recipeFinder' && <AdminRecipeFinder />}
          {activeTab === 'markdownBlog' && <AdminMarkdownBlog />}
          {activeTab === 'habitTracker' && <AdminHabitTracker />}
        </div>
      </main>

      {/* Bottom Navigation Removed or Replaced as per categorical request */}
      <div className="md:hidden h-20" /> {/* Spacer */}

      {/* Alert/Confirm Modal */}
      {modal.type && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="glass rounded-[40px] border border-white/10 max-w-md w-full p-8">
            <p className="text-white mb-6 text-center">{modal.message}</p>
            {modal.type === 'confirm' ? (
              <div className="flex gap-3">
                <button onClick={() => setModal({ type: null, message: '' })} className="flex-1 bg-white/10 text-white border border-white/20 py-3 rounded-xl font-bold">취소</button>
                <button onClick={() => { modal.onConfirm?.(); setModal({ type: null, message: '' }); }} className="flex-1 bg-lime text-forest py-3 rounded-xl font-bold">삭제</button>
              </div>
            ) : (
              <button onClick={() => setModal({ type: null, message: '' })} className="w-full bg-lime text-forest py-3 rounded-xl font-bold">확인</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
