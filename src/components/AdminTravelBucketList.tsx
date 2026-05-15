import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  MapPin, 
  CheckCircle2, 
  Trash2, 
  Search, 
  Map as MapIcon, 
  Navigation,
  Globe,
  Zap,
  Check,
  ChevronRight,
  Plane
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix for default marker icons in Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface TravelDestination {
  id: string;
  name: string;
  lat: number;
  lng: number;
  visited: boolean;
}

// Component to handle map center and zoom
function MapUpdater({ destinations }: { destinations: TravelDestination[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (destinations.length > 0) {
      const bounds = L.latLngBounds(destinations.map(d => [d.lat, d.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [destinations, map]);

  return null;
}

export default function AdminTravelBucketList() {
  const [destinations, setDestinations] = useState<TravelDestination[]>(() => {
    const saved = localStorage.getItem('vibe_travel_bucket');
    return saved ? JSON.parse(saved) : [];
  });

  const [inputName, setInputName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vibe_travel_bucket', JSON.stringify(destinations));
  }, [destinations]);

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputName)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newDest: TravelDestination = {
          id: Math.random().toString(36).substr(2, 9),
          name: display_name.split(',')[0], // Take first part of display name
          lat: parseFloat(lat),
          lng: parseFloat(lon),
          visited: false
        };

        setDestinations(prev => [newDest, ...prev]);
        setInputName('');
      } else {
        setError('장소를 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('검색 중 오류가 발생했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const toggleVisited = (id: string) => {
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, visited: !d.visited } : d
    ));
  };

  const deleteDestination = (id: string) => {
    setDestinations(prev => prev.filter(d => d.id !== id));
  };

  const createCustomIcon = (visited: boolean) => {
    return L.divIcon({
      html: `<div class="w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center transition-all ${visited ? 'bg-lime text-forest' : 'bg-blue-500 text-white'}">
               <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                 ${visited ? '<path d="M20 6 9 17l-5-5"/>' : '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>'}
               </svg>
             </div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto space-y-12 py-10 px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:items-end justify-between border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">여행 버킷 리스트</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Nomadic Protocol v1.0</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <Globe size={16} className="text-lime" />
             <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">목적지: {destinations.length}</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-lime/10 rounded-2xl border border-lime/20">
             <CheckCircle2 size={16} className="text-lime" />
             <span className="text-[11px] font-black text-lime uppercase tracking-widest">방문 완료: {destinations.filter(d => d.visited).length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
        {/* Sidebar: List & Add Form */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
          {/* Add Form */}
          <div className="glass rounded-[32px] border border-white/10 p-6 bg-forest/20 shrink-0">
             <form onSubmit={handleAddDestination} className="space-y-4">
                <div className="relative group">
                   <input
                     type="text"
                     value={inputName}
                     onChange={(e) => setInputName(e.target.value)}
                     placeholder="가고 싶은 장소 (예: 파리, 도쿄...)"
                     className="w-full bg-forest/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/10"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within:text-lime transition-colors" size={18} />
                   {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin">
                         <Zap size={14} className="text-lime" />
                      </div>
                   )}
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !inputName.trim()}
                  className="w-full py-4 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group disabled:opacity-20"
                >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                  <span>목적지 추가</span>
                </button>
                {error && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest italic text-center">{error}</p>}
             </form>
          </div>

          {/* Destination List */}
          <div className="glass rounded-[32px] border border-white/10 bg-black/20 overflow-hidden flex flex-col flex-1">
             <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-white/30">Destinations</h3>
                <Navigation size={14} className="text-white/10" />
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <AnimatePresence mode="popLayout">
                   {destinations.map((dest) => (
                      <motion.div
                        key={dest.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all flex items-center justify-between group",
                          dest.visited 
                            ? "bg-lime/5 border-lime/20" 
                            : "bg-white/5 border-white/5 hover:border-white/10"
                        )}
                      >
                         <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                            <button 
                              onClick={() => toggleVisited(dest.id)}
                              className={cn(
                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                                dest.visited 
                                  ? "bg-lime border-lime text-forest" 
                                  : "border-white/10 hover:border-lime text-transparent"
                              )}
                            >
                               <Check size={14} strokeWidth={4} />
                            </button>
                            <div className="truncate">
                               <h4 className={cn(
                                 "text-sm font-bold tracking-tight truncate transition-all",
                                 dest.visited ? "text-lime italic line-through opacity-60" : "text-white"
                               )}>
                                 {dest.name}
                               </h4>
                               <p className="text-[8px] font-black text-white/10 uppercase tracking-widest mt-0.5">
                                 {dest.lat.toFixed(2)}, {dest.lng.toFixed(2)}
                               </p>
                            </div>
                         </div>
                         <button
                           onClick={() => deleteDestination(dest.id)}
                           className="p-2 rounded-xl bg-red-500/0 text-white/10 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Trash2 size={14} />
                         </button>
                      </motion.div>
                   ))}
                </AnimatePresence>

                {destinations.length === 0 && (
                   <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-10">
                      <Plane size={48} strokeWidth={1} />
                      <p className="text-[10px] font-black uppercase tracking-widest">모험을 시작하세요</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Map View */}
        <div className="lg:col-span-8 glass rounded-[40px] border border-white/10 overflow-hidden relative group/map">
           <MapContainer 
             center={[20, 0]} 
             zoom={2} 
             scrollWheelZoom={true} 
             className="w-full h-full z-0"
             zoomControl={false}
           >
             <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
               url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
             />
             {destinations.map((dest) => (
               <Marker 
                 key={dest.id} 
                 position={[dest.lat, dest.lng]}
                 icon={createCustomIcon(dest.visited)}
               >
                 <Popup className="custom-popup">
                   <div className="p-2 bg-forest text-white rounded-xl">
                      <h5 className="font-black italic serif text-lg leading-tight">{dest.name}</h5>
                      <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-40">Bucket List Location</p>
                      <button 
                        onClick={() => toggleVisited(dest.id)}
                        className={cn(
                          "mt-3 w-full py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          dest.visited ? "bg-lime text-forest" : "bg-white/10 text-white"
                        )}
                      >
                         {dest.visited ? "방문 완료" : "방문 체크하기"}
                      </button>
                   </div>
                 </Popup>
               </Marker>
             ))}
             <MapUpdater destinations={destinations} />
           </MapContainer>

           {/* Map Controls UI Overlay */}
           <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <div className="flex items-center gap-3 px-4 py-2 bg-forest/80 backdrop-blur-md rounded-2xl border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                 <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Global Atlas Active</span>
              </div>
           </div>

           <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
              <div className="p-4 bg-forest/80 backdrop-blur-md rounded-2xl border border-white/10 text-right">
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Current Protocol</p>
                  <p className="text-xs font-black text-white">GEOSPATIAL-ALPHA-4</p>
              </div>
           </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <MapIcon size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Nomadic Intelligence</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Map Discovery v3.1.2</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>Leaflet Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>OpenStreetMap Connected</span>
          </div>
        </div>
      </div>

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: #1a1a1a;
          color: white;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 0;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          width: 200px !important;
        }
        .custom-popup .leaflet-popup-tip {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </motion.div>
  );
}
