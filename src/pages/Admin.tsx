import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, Lock, Eye, EyeOff, AlertCircle, ChevronDown
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
import AdminChartDashboard from '../components/AdminChartDashboard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'nfcTags' | 'lab' | 'vibeCoding' | 'chartDashboard'>(() => {
    const saved = localStorage.getItem('lastAdminTab');
    if (saved && ['nfcTags', 'lab', 'vibeCoding', 'chartDashboard'].includes(saved)) {
      return saved as 'nfcTags' | 'lab' | 'vibeCoding' | 'chartDashboard';
    }
    return 'nfcTags';
  });

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
        { id: 'chartDashboard', label: '2.차트대시보드' },
      ]
    }
  ];
  
  const [user, setUser] = useState<User | null>(null);
  const [isConfigLoaded, setIsConfigLoaded] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [isStorageDegraded, setIsStorageDegraded] = useState(false);
  const [isFirestoreOffline, setIsFirestoreOffline] = useState(false);

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
      <header className="sticky top-0 z-50 border-b border-white/10 px-6 py-3 bg-forest">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg border border-white/10 p-1 bg-white/5" />
            ) : (
              <div className="w-10 h-10 bg-lime rounded-lg flex items-center justify-center font-bold text-forest">CL</div>
            )}
            <div>
              <h1 className="text-lg font-bold">cskim-lab</h1>
              <p className="text-xs text-white/60">관리 시스템</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 justify-start flex-1">
            {menuConfig.map((menu) => (
              <div 
                key={menu.id}
                className="relative group"
                onMouseEnter={() => setOpenDropdown(menu.id)}
                onMouseLeave={() => setOpenDropdown(null)}
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
                      className="absolute top-full left-0 mt-1 w-48 bg-[#2a2a2a] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl z-50"
                    >
                      {menu.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id as any);
                            setOpenDropdown(null);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-3 text-xs font-medium transition-colors",
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

          <div className="flex items-center gap-3">
          </div>
        </div>
      </header>

      <main className="flex-1 pt-6 pb-24 px-32 max-w-[1600px] mx-auto w-full">
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
          {activeTab === 'chartDashboard' && <AdminChartDashboard />}
        </div>
      </main>

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
