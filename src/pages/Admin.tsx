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
import AdminVirtualGallery from '../components/AdminVirtualGallery';
import AdminFinanceDashboard from '../components/AdminFinanceDashboard';
import AdminLanguageFlashcards from '../components/AdminLanguageFlashcards';
import AdminMeditationTimer from '../components/AdminMeditationTimer';
import AdminQuizApp from '../components/AdminQuizApp';
import AdminFitnessTracker from '../components/AdminFitnessTracker';
import AdminCountdownTimer from '../components/AdminCountdownTimer';
import AdminMovieApp from '../components/AdminMovieApp';
import AdminDutchPay from '../components/AdminDutchPay';
import AdminPortfolioBuilder from '../components/AdminPortfolioBuilder';
import AdminWorkoutPlanner from '../components/AdminWorkoutPlanner';
import AdminStoryGame from '../components/AdminStoryGame';
import AdminMusicPlaylist from '../components/AdminMusicPlaylist';
import AdminWeatherAlertSystem from '../components/AdminWeatherAlertSystem';
import AdminReadingTracker from '../components/AdminReadingTracker';
import AdminCurrencyConverter from '../components/AdminCurrencyConverter';
import AdminPromptLibrary from '../components/AdminPromptLibrary';
import AdminEmotionDiary from '../components/AdminEmotionDiary';
import AdminPhotoGallery from '../components/AdminPhotoGallery';
import AdminTravelBucketList from '../components/AdminTravelBucketList';
import AdminNewsReader from '../components/AdminNewsReader';
import AdminPomodoroTimer from '../components/AdminPomodoroTimer';
import AdminStockWatchlist from '../components/AdminStockWatchlist';
import AdminPollCreator from '../components/AdminPollCreator';
import AdminPlantTracker from '../components/AdminPlantTracker';
import AdminRecipeNutrition from '../components/AdminRecipeNutrition';
import AdminDailyAffirmation from '../components/AdminDailyAffirmation';
import AdminMemeGenerator from '../components/AdminMemeGenerator';
import AdminTranslator from '../components/AdminTranslator';
import AdminSnippetManager from '../components/AdminSnippetManager';
import AdminWhiteboard from '../components/AdminWhiteboard';
import AdminMovieBooking from '../components/AdminMovieBooking';
import AdminMindMap from '../components/AdminMindMap';
import AdminRetirementCountdown from '../components/AdminRetirementCountdown';
import AdminSocialScheduler from '../components/AdminSocialScheduler';
import AdminUrlShortener from '../components/AdminUrlShortener';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'nfcTags' | 'lab' | 'vibeCoding' | 'gasReceipts' | 'paletteGenerator' | 'interactiveMap' | 'flashcardQuiz' | 'passwordGenerator' | 'aiChat' | 'worldWeather' | 'personalFinance' | 'placeholder' | 'realtimeChat' | 'recipeFinder' | 'markdownBlog' | 'habitTracker' | 'virtualGallery' | 'financeDashboard' | 'languageFlashcards' | 'meditationTimer' | 'quizApp' | 'fitnessTracker' | 'countdownTimer' | 'movieApp' | 'dutchPay' | 'portfolioBuilder' | 'workoutPlanner' | 'storyGame' | 'musicPlaylist' | 'weatherAlert' | 'readingTracker' | 'currencyConverter' | 'promptLibrary' | 'emotionDiary' | 'photoGallery' | 'travelBucket' | 'newsReader' | 'pomodoroTimer' | 'stockWatchlist' | 'pollCreator' | 'plantTracker' | 'recipeNutrition' | 'affirmationDisplay' | 'memeGenerator' | 'translator' | 'snippetManager' | 'whiteboard' | 'movieBooking' | 'mindMap' | 'retirementCountdown' | 'socialScheduler' | 'urlShortener' | 'vibe3_placeholder' | 'vibe4_placeholder' | 'vibe5_placeholder'>(() => {
    const saved = localStorage.getItem('lastAdminTab');
    if (saved && ['nfcTags', 'lab', 'vibeCoding', 'gasReceipts', 'paletteGenerator', 'interactiveMap', 'flashcardQuiz', 'passwordGenerator', 'aiChat', 'worldWeather', 'personalFinance', 'placeholder', 'realtimeChat', 'recipeFinder', 'markdownBlog', 'habitTracker', 'virtualGallery', 'financeDashboard', 'languageFlashcards', 'meditationTimer', 'quizApp', 'fitnessTracker', 'countdownTimer', 'movieApp', 'dutchPay', 'portfolioBuilder', 'workoutPlanner', 'storyGame', 'musicPlaylist', 'weatherAlert', 'readingTracker', 'currencyConverter', 'promptLibrary', 'emotionDiary', 'photoGallery', 'travelBucket', 'newsReader', 'pomodoroTimer', 'stockWatchlist', 'pollCreator', 'plantTracker', 'recipeNutrition', 'affirmationDisplay', 'memeGenerator', 'translator', 'snippetManager', 'whiteboard', 'movieBooking', 'mindMap', 'retirementCountdown', 'socialScheduler', 'urlShortener', 'vibe3_placeholder', 'vibe4_placeholder', 'vibe5_placeholder'].includes(saved)) {
      return saved as any;
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
      label: '바이1',
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
      label: '바이2',
      items: [
        { id: 'realtimeChat', label: '11. 실시간 채팅' },
        { id: 'recipeFinder', label: '12.레시피 찾기' },
        { id: 'markdownBlog', label: '13. 마크다운 블로그' },
        { id: 'habitTracker', label: '14. 습관 관리' },
        { id: 'virtualGallery', label: '15. 가상 갤러리' },
        { id: 'financeDashboard', label: '16. 개인 재무 대시보드' },
        { id: 'languageFlashcards', label: '17. 언어학습 플래시 카드' },
        { id: 'meditationTimer', label: '18. 명상 타이머' },
        { id: 'quizApp', label: '19. 대화형 퀴즈 앱' },
        { id: 'fitnessTracker', label: '20. 피트니스 트래커' },
        { id: 'placeholder', label: '준비 중...' },
      ]
    },
    {
      id: 'vibe3',
      label: '바이3',
      items: [
        { id: 'countdownTimer', label: '21. 카운트다운 타이머' },
        { id: 'movieApp', label: '22. 영화 추천' },
        { id: 'dutchPay', label: '23. 더치페이' },
        { id: 'portfolioBuilder', label: '24. 포트폴리오' },
        { id: 'workoutPlanner', label: '25. 피트니스 계획' },
        { id: 'storyGame', label: '26. 인터랙티브 스토리 게임' },
        { id: 'musicPlaylist', label: '27. 음악 플레이리스트' },
        { id: 'weatherAlert', label: '28. 날씨 경보 시스템' },
        { id: 'readingTracker', label: '29. 독서 기록 관리기' },
        { id: 'currencyConverter', label: '30. 환율 변환기' },
        { id: 'vibe3_placeholder', label: '준비 중...' },
      ]
    },
    {
      id: 'vibe4',
      label: '바이4',
      items: [
        { id: 'promptLibrary', label: '31. 프롬프트 라이브러리' },
        { id: 'emotionDiary', label: '32. 감정 다이어리 앱' },
        { id: 'photoGallery', label: '33. 필터 기능 사진 갤러리' },
        { id: 'travelBucket', label: '34. 여행 버킷 리스트' },
        { id: 'newsReader', label: '35. 맞춤형 뉴스 리더' },
        { id: 'pomodoroTimer', label: '36. 작업 뽀모도로 타이머' },
        { id: 'stockWatchlist', label: '37. 주식 시장 관심 종목' },
        { id: 'pollCreator', label: '38. 온라인 투표 작성' },
        { id: 'plantTracker', label: '39. 가상 식물 관리기' },
        { id: 'recipeNutrition', label: '40. 레시피 영양 계산기' },
        { id: 'vibe4_placeholder', label: '준비 중...' },
      ]
    },
    {
      id: 'vibe5',
      label: '바이5',
      items: [
        { id: 'affirmationDisplay', label: '41. 오늘의 긍정문' },
        { id: 'memeGenerator', label: '42. 사진 밈 생성기' },
        { id: 'translator', label: '43. 언어 번역기' },
        { id: 'snippetManager', label: '44. 코드 조각 관리자' },
        { id: 'whiteboard', label: '45. 가상 화이트보드' },
        { id: 'movieBooking', label: '46. 영화 티켓 예매' },
        { id: 'mindMap', label: '47. 마인드맵' },
        { id: 'retirementCountdown', label: '48. 은퇴 카운트다운' },
        { id: 'socialScheduler', label: '49. 소셜 게시물 예약' },
        { id: 'urlShortener', label: '50. 간단한 URL 단축기' },
        { id: 'vibe5_placeholder', label: '준비 중...' },
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
          {activeTab === 'virtualGallery' && <AdminVirtualGallery />}
          {activeTab === 'financeDashboard' && <AdminFinanceDashboard />}
          {activeTab === 'languageFlashcards' && <AdminLanguageFlashcards />}
          {activeTab === 'meditationTimer' && <AdminMeditationTimer />}
          {activeTab === 'quizApp' && <AdminQuizApp />}
          {activeTab === 'fitnessTracker' && <AdminFitnessTracker />}
          {activeTab === 'countdownTimer' && <AdminCountdownTimer />}
          {activeTab === 'movieApp' && <AdminMovieApp />}
          {activeTab === 'dutchPay' && <AdminDutchPay />}
          {activeTab === 'portfolioBuilder' && <AdminPortfolioBuilder />}
          {activeTab === 'workoutPlanner' && <AdminWorkoutPlanner />}
          {activeTab === 'storyGame' && <AdminStoryGame />}
          {activeTab === 'musicPlaylist' && <AdminMusicPlaylist />}
          {activeTab === 'weatherAlert' && <AdminWeatherAlertSystem />}
          {activeTab === 'readingTracker' && <AdminReadingTracker />}
          {activeTab === 'currencyConverter' && <AdminCurrencyConverter />}
          {activeTab === 'promptLibrary' && <AdminPromptLibrary />}
          {activeTab === 'emotionDiary' && <AdminEmotionDiary />}
          {activeTab === 'photoGallery' && <AdminPhotoGallery />}
          {activeTab === 'travelBucket' && <AdminTravelBucketList />}
          { activeTab === 'newsReader' && <AdminNewsReader /> }
          { activeTab === 'pomodoroTimer' && <AdminPomodoroTimer /> }
          { activeTab === 'stockWatchlist' && <AdminStockWatchlist /> }
          { activeTab === 'pollCreator' && <AdminPollCreator /> }
          { activeTab === 'plantTracker' && <AdminPlantTracker /> }
          { activeTab === 'recipeNutrition' && <AdminRecipeNutrition /> }
          { activeTab === 'affirmationDisplay' && <AdminDailyAffirmation /> }
          { activeTab === 'memeGenerator' && <AdminMemeGenerator /> }
          { activeTab === 'translator' && <AdminTranslator /> }
          { activeTab === 'snippetManager' && <AdminSnippetManager /> }
          { activeTab === 'whiteboard' && <AdminWhiteboard /> }
          { activeTab === 'movieBooking' && <AdminMovieBooking /> }
          { activeTab === 'mindMap' && <AdminMindMap /> }
          { activeTab === 'retirementCountdown' && <AdminRetirementCountdown /> }
          { activeTab === 'socialScheduler' && <AdminSocialScheduler /> }
          { activeTab === 'urlShortener' && <AdminUrlShortener /> }
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
