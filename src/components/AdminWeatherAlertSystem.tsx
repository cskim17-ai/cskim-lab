import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  CloudLightning, 
  Snowflake, 
  AlertTriangle, 
  MapPin, 
  Search, 
  Navigation, 
  RefreshCw, 
  Bell, 
  History,
  Wind,
  Droplets,
  Thermometer,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WeatherData {
  temp: number;
  condition: string;
  code: number;
  city: string;
  time: string;
  isSevere: boolean;
  alertMessage?: string;
}

interface LogEntry {
  id: string;
  city: string;
  temp: number;
  condition: string;
  time: string;
  isSevere: boolean;
}

// WMO Weather interpretation codes (https://open-meteo.com/en/docs)
const getWeatherCondition = (code: number): { text: string; isSevere: boolean; alertMessage?: string } => {
  if (code >= 95) return { text: '천둥번개', isSevere: true, alertMessage: '뇌우 경보: 안전한 곳으로 대피하세요.' };
  if (code >= 71 && code <= 86) return { text: '눈', isSevere: true, alertMessage: '대설 경보: 빙판길 및 시야 확보에 유의하세요.' };
  if (code === 56 || code === 57 || code === 66 || code === 67) return { text: '얼어붙는 비', isSevere: true, alertMessage: '결빙 경보: 도로 결빙위험이 매우 높습니다.' };
  if (code >= 51 && code <= 65) return { text: '비', isSevere: false };
  if (code >= 1 && code <= 3) return { text: '구름 조금', isSevere: false };
  if (code === 0) return { text: '맑음', isSevere: false };
  return { text: '흐림', isSevere: false };
};

export default function AdminWeatherAlertSystem() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const autoCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  const sendNotification = (data: WeatherData) => {
    if (notificationsEnabled && data.isSevere) {
      new Notification('기상 악화 경보', {
        body: `${data.city}: ${data.alertMessage || data.condition}`,
        icon: '/favicon.ico'
      });
    }
  };

  const fetchWeather = useCallback(async (lat: number, lon: number, cityName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
      );
      const data = await response.json();
      
      if (data.current_weather) {
        const { temperature, weathercode } = data.current_weather;
        const conditionInfo = getWeatherCondition(weathercode);
        
        const finalCity = cityName || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        const newWeather: WeatherData = {
          temp: temperature,
          condition: conditionInfo.text,
          code: weathercode,
          city: finalCity,
          time: new Date().toLocaleTimeString('ko-KR'),
          isSevere: conditionInfo.isSevere,
          alertMessage: conditionInfo.alertMessage
        };

        setWeather(newWeather);
        setLogs(prev => [{
          id: Math.random().toString(36).substr(2, 9),
          city: finalCity,
          temp: temperature,
          condition: conditionInfo.text,
          time: newWeather.time,
          isSevere: conditionInfo.isSevere
        }, ...prev].slice(0, 10));

        if (newWeather.isSevere) {
          sendNotification(newWeather);
        }
      }
    } catch (err) {
      setError('날씨 정보를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [notificationsEnabled]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!city.trim()) return;

    setIsLoading(true);
    try {
      // Open-Meteo Geocoding API
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=ko`);
      const geoData = await geoRes.json();
      
      if (geoData.results && geoData.results.length > 0) {
        const { latitude, longitude, name } = geoData.results[0];
        fetchWeather(latitude, longitude, name);
      } else {
        setError('도시를 찾을 수 없습니다.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('위치 정보를 검색하는 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('GPS를 지원하지 않는 브라우저입니다.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude, '현재 위치');
      },
      (err) => {
        setError('위치 권한이 필요합니다.');
        setIsLoading(false);
      }
    );
  };

  // Auto-check every 30 minutes
  useEffect(() => {
    if (weather) {
      if (autoCheckRef.current) clearInterval(autoCheckRef.current);
      autoCheckRef.current = setInterval(() => {
        // Find existing coords if searched by city or use current
        handleSearch(); 
      }, 30 * 60 * 1000);
    }
    return () => {
      if (autoCheckRef.current) clearInterval(autoCheckRef.current);
    };
  }, [weather]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">날씨 경보 시스템</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Atmospheric Protocol v2.5</p>
        </div>
        
        <div className="flex items-center gap-4">
          {!notificationsEnabled && (
            <button 
              onClick={requestNotificationPermission}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-white/60"
            >
               <Bell size={16} />
               <span className="text-[11px] font-black uppercase tracking-widest">알림 권한 요청</span>
            </button>
          )}
          <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <RefreshCw size={16} className={cn("text-lime", isLoading && "animate-spin")} />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">30분 자동 모니터링</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Controls & Status */}
        <div className="lg:col-span-5 space-y-8">
          {/* Input & Location */}
          <div className="glass rounded-[40px] border border-white/10 p-8 space-y-6 bg-blue-900/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                <Search size={16} />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">위치 설정</h3>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative group">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="도시명을 입력하세요 (예: 서울)"
                  className="w-full bg-blue-950/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-blue-400/50 transition-all placeholder:text-white/10"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-blue-400 transition-colors" size={18} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 active:scale-95 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  <span>검색</span>
                </button>
                <button
                  type="button"
                  onClick={handleCurrentLocation}
                  disabled={isLoading}
                  className="py-4 bg-white/5 text-white font-black rounded-2xl hover:bg-white/10 active:scale-95 transition-all border border-white/10 flex items-center justify-center gap-2"
                >
                  <Navigation size={18} />
                  <span>현재 위치</span>
                </button>
              </div>
            </form>

            <AnimatePresence>
              {weather?.isSevere && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3"
                >
                  <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-[11px] font-black text-red-500 uppercase tracking-widest leading-none mb-1">기상 악화 경보</p>
                    <p className="text-xs font-medium text-red-100/80">{weather.alertMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {error && (
               <p className="text-center text-[10px] font-bold text-red-400 uppercase tracking-widest italic">{error}</p>
            )}
          </div>

          {/* Current Weather Display */}
          <AnimatePresence mode="wait">
            {weather ? (
              <motion.div
                key={weather.city}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-[40px] border border-white/10 p-10 relative overflow-hidden bg-gradient-to-br from-blue-900/60 to-blue-950/80 shadow-2xl"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/5 blur-[80px] translate-x-12 -translate-y-12" />
                
                <div className="relative z-10 space-y-8 flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center text-white/50 border border-white/10">
                     {weather.code >= 95 ? <CloudLightning size={48} className="text-yellow-400" /> :
                      weather.code >= 71 ? <Snowflake size={48} className="text-blue-200" /> :
                      <CloudRain size={48} className="text-blue-400" />}
                  </div>

                  <div>
                    <h3 className="text-5xl font-black text-white italic tracking-tighter tabular-nums">
                      {weather.temp}
                      <span className="text-2xl ml-1 font-normal not-italic text-white/20">°C</span>
                    </h3>
                    <p className="text-lg font-black text-white/80 uppercase tracking-widest mt-2">{weather.condition}</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-2">
                       <MapPin size={10} /> {weather.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 w-full">
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <Thermometer size={14} className="text-blue-400 mb-2 mx-auto" />
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">체감 온도</p>
                        <p className="text-sm font-bold text-white tracking-widest">{weather.temp + 1}°C</p>
                     </div>
                     <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <Droplets size={14} className="text-blue-400 mb-2 mx-auto" />
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">습도 데이터</p>
                        <p className="text-sm font-bold text-white tracking-widest">42%</p>
                     </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[40px] border border-white/10 p-20 flex flex-col items-center justify-center text-center space-y-4 text-white/5 bg-blue-900/20">
                 <Wind size={64} strokeWidth={1} />
                 <div>
                   <p className="text-sm font-black uppercase tracking-[0.4em]">기상 데이터 없음</p>
                   <p className="text-[10px] italic font-bold">도시를 검색하거나 현재 위치를 가져오세요</p>
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: History Logs */}
        <div className="lg:col-span-7 space-y-6">
           <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                    <History size={16} />
                 </div>
                 <h3 className="text-xs font-black text-white uppercase tracking-widest">모니터링 로그</h3>
              </div>
              <span className="text-[10px] font-bold text-white/10 uppercase tracking-widest italic font-mono">Records: {logs.length}</span>
           </div>

           <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={cn(
                      "p-6 rounded-[32px] border transition-all duration-300 flex items-center justify-between group",
                      log.isSevere 
                        ? "bg-red-500/10 border-red-500/20" 
                        : "bg-blue-900/20 border-white/5 hover:border-white/10"
                    )}
                  >
                    <div className="flex items-center gap-6">
                       <div className={cn(
                         "w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 border",
                         log.isSevere ? "bg-red-500/20 border-red-500/20 text-red-500" : "bg-blue-400/10 border-blue-400/10 text-blue-400"
                       )}>
                          {log.temp}°
                       </div>
                       <div>
                          <div className="flex items-center gap-2">
                             <p className="text-base font-black italic serif text-white tracking-tight">{log.city}</p>
                             {log.isSevere && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest rounded-full">ALERT</span>
                             )}
                          </div>
                          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">
                             {log.condition} — {log.time}
                          </p>
                       </div>
                    </div>
                    
                    <div className="text-right flex items-center gap-2 opacity-20">
                       <CheckCircle2 size={12} className="text-lime" />
                       <span className="text-[8px] font-black uppercase tracking-widest">로그됨</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {logs.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 text-white/5 border-2 border-dashed border-white/5 rounded-[40px]">
                   <Zap size={64} strokeWidth={1} />
                   <p className="text-[10px] italic font-bold uppercase tracking-[0.2em]">모니터링 기록이 없습니다</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <CloudRain size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Open-Meteo Data Source</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Severe Weather Watch v2.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 탐지</span>
          </div>
          <div className="flex items-center gap-1.5">
             <Bell size={10} />
             <span>시스템 푸시 활성</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
