import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, MapPin, Wind, Droplets, Thermometer, 
  RefreshCw, Cloud, Sun, CloudRain, CloudLightning, 
  CloudSnow, AlertCircle, Loader2, Navigation,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface WeatherData {
  name: string;
  temp: number;
  description: string;
  weatherCode: number;
  humidity: number;
  windSpeed: number;
  apparentTemp: number;
}

export default function AdminWorldWeather() {
  const [query, setQuery] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const getWeatherDescription = (code: number) => {
    const codes: Record<number, string> = {
      0: '맑음',
      1: '대체로 맑음',
      2: '부분적으로 흐림',
      3: '흐림',
      45: '안개',
      48: '서리 안개',
      51: '가벼운 이슬비',
      53: '이슬비',
      55: '진한 이슬비',
      61: '약한 비',
      63: '비',
      65: '강한 비',
      71: '약한 눈',
      73: '눈',
      75: '강한 눈',
      80: '약한 소나기',
      81: '소나기',
      82: '강한 소나기',
      95: '뇌우',
      96: '히말라야식 뇌우',
      99: '심한 뇌우',
    };
    return codes[code] || '알 수 없음';
  };

  const fetchWeather = useCallback(async (searchQuery: string, lat?: number, lon?: number) => {
    setLoading(true);
    setError(null);
    try {
      let finalLat = lat;
      let finalLon = lon;
      let cityName = searchQuery;

      // 1. Geocoding if name is provided
      if (searchQuery && !lat) {
        const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=1&language=en&format=json`);
        const geoData = await geoResponse.json();
        if (!geoData.results || geoData.results.length === 0) {
          throw new Error('도시를 찾을 수 없습니다.');
        }
        finalLat = geoData.results[0].latitude;
        finalLon = geoData.results[0].longitude;
        cityName = geoData.results[0].name;
      }

      if (finalLat === undefined || finalLon === undefined) {
        throw new Error('좌표 정보를 가져올 수 없습니다.');
      }

      // 2. Fetch Weather from Open-Meteo
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${finalLat}&longitude=${finalLon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`;
      const response = await fetch(weatherUrl);
      if (!response.ok) {
        throw new Error('날씨 정보를 가져오는 데 실패했습니다.');
      }

      const data = await response.json();
      const current = data.current;

      setWeather({
        name: cityName || (lat ? `위치 (${lat.toFixed(2)}, ${lon?.toFixed(2)})` : '알 수 없음'),
        temp: current.temperature_2m,
        description: getWeatherDescription(current.weather_code),
        weatherCode: current.weather_code,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        apparentTemp: current.apparent_temperature,
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
    }
  };

  const getMyLocation = () => {
    if (!navigator.geolocation) {
      setError('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather('', position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setError('위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.');
        setLoading(false);
      }
    );
  };

  // Auto refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (weather?.name) {
        fetchWeather(weather.name);
      }
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [weather, fetchWeather]);

  // Initial fetch
  useEffect(() => {
    if (!weather && !loading) {
      fetchWeather('Seoul');
    }
  }, []);

  const convertTemp = (temp: number) => {
    if (unit === 'F') {
      return (temp * 9/5) + 32;
    }
    return temp;
  };

  const WeatherIconWrapper = ({ code }: { code: number }) => {
    if (code === 0) return <Sun className="text-yellow-400" size={64} />;
    if ([1, 2, 3].includes(code)) return <Cloud className="text-blue-300" size={64} />;
    if ([45, 48].includes(code)) return <Cloud className="text-gray-400 opacity-50" size={64} />;
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return <CloudRain className="text-blue-500" size={64} />;
    if ([71, 73, 75].includes(code)) return <CloudSnow className="text-white" size={64} />;
    if ([95, 96, 99].includes(code)) return <CloudLightning className="text-purple-500" size={64} />;
    return <Cloud size={64} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter leading-tight">세계 실시간 날씨</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Global Meteo Observer v2.0</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/10 w-full sm:w-auto">
            <button
              onClick={() => setUnit('C')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[11px] font-black transition-all",
                unit === 'C' ? "bg-lime text-forest shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              섭씨
            </button>
            <button
              onClick={() => setUnit('F')}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3 rounded-xl text-[11px] font-black transition-all",
                unit === 'F' ? "bg-lime text-forest shadow-xl" : "text-white/40 hover:text-white"
              )}
            >
              화씨
            </button>
          </div>
          <button
            onClick={getMyLocation}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[11px] font-black text-white/60 hover:text-lime transition-all active:scale-95"
          >
            <Navigation size={16} />
            현재 위치
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="도시 이름을 검색하세요 (예: Seoul, Tokyo, London...)"
          className="w-full bg-forest/50 border border-white/10 rounded-[28px] py-4.5 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20 shadow-inner group-focus-within:border-lime/30"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-lime text-forest flex items-center justify-center hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl"
        >
          <Search size={20} />
        </button>
      </form>

      {/* Weather Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Weather Card */}
        <div className="glass rounded-[40px] border border-white/10 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime/10 blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4"
              >
                <Loader2 className="animate-spin text-lime" size={48} />
                <p className="text-xs font-black text-white/20 uppercase tracking-widest">날씨 정보를 가져오는 중...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-4 text-center"
              >
                <AlertCircle className="text-red-400" size={48} />
                <p className="text-sm font-bold text-red-400/80">{error}</p>
                <button 
                  onClick={() => fetchWeather('Seoul')}
                  className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black"
                >
                  다시 시도
                </button>
              </motion.div>
            ) : weather ? (
              <motion.div
                key="weather"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-2 text-white/40">
                  <MapPin size={14} className="text-lime" />
                  <span className="text-xs uppercase tracking-[0.2em] font-black">{weather.name}</span>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-6xl sm:text-8xl font-black italic serif text-white tabular-nums tracking-tighter">
                    {Math.round(convertTemp(weather.temp))}°
                  </div>
                  <div className="space-y-1">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/5 rounded-2xl flex items-center justify-center">
                       <WeatherIconWrapper code={weather.weatherCode} />
                    </div>
                    <p className="text-sm font-bold text-lime capitalize pl-1">{weather.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-[10px] font-black text-white/20 uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                    마지막 업데이트: {lastUpdated?.toLocaleTimeString()}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-[32px] border border-white/5 p-6 flex flex-col justify-between hover:border-lime/30 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                <Droplets size={20} />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">습도</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white tabular-nums">{weather?.humidity || 0}%</div>
              <p className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-tighter italic">현지 상대 습도</p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-white/5 p-6 flex flex-col justify-between hover:border-lime/30 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-orange-500/10 rounded-xl text-orange-400 group-hover:scale-110 transition-transform">
                <Wind size={20} />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">풍속</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white tabular-nums">{weather?.windSpeed || 0} m/s</div>
              <p className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-tighter italic">바람의 속도</p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-white/5 p-6 flex flex-col justify-between hover:border-lime/30 transition-colors group">
            <div className="flex justify-between items-start">
              <div className="p-2.5 bg-yellow-500/10 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                <Thermometer size={20} />
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">체감 온도</span>
            </div>
            <div className="mt-4">
              <div className="text-3xl font-black text-white tabular-nums">{Math.round(convertTemp(weather?.apparentTemp || 0))}°</div>
              <p className="text-[10px] text-white/40 font-bold mt-1 uppercase tracking-tighter italic">현지 체감 지수</p>
            </div>
          </div>

          <div className="glass rounded-[32px] border border-white/5 p-6 flex flex-col items-center justify-center text-center gap-3 hover:border-lime/30 transition-colors group cursor-pointer" onClick={() => weather?.name && fetchWeather(weather.name)}>
            <div className="p-4 bg-lime/10 rounded-full text-lime group-hover:rotate-180 transition-transform duration-700">
              <RefreshCw size={24} />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">수동 새로고침</p>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-white/10">
          <div className="h-[1px] w-8 bg-current" />
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] italic">Vibe Weather Global Service</p>
          <div className="h-[1px] w-8 bg-current" />
        </div>
      </div>
    </motion.div>
  );
}
