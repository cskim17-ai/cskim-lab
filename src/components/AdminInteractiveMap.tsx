import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Map as MapIcon, Trash2, MapPin, Send, X, Search, Loader2 } from 'lucide-react';
import { collection, onSnapshot, setDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon issues in Leaflet with build tools
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  memo: string;
  userId: string;
}

// Helper component to move map view
function MapController({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

function MapEvents() {
  return null;
}

export default function AdminInteractiveMap() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [pendingPosition, setPendingPosition] = useState<[number, number] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [memoInput, setMemoInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [targetLocation, setTargetLocation] = useState<[number, number] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const markersCollection = 'map_markers';

  // Firestore Real-time listener
  useEffect(() => {
    const q = query(collection(db, markersCollection), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(collection(db, markersCollection), (snapshot) => {
      const data: MarkerData[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as MarkerData);
      });
      setMarkers(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, markersCollection);
    });
    return () => unsubscribe();
  }, []);

  const startEditing = (marker: MarkerData) => {
    setEditingId(marker.id);
    setPendingPosition([marker.lat, marker.lng]);
    setMemoInput(marker.memo);
    setTargetLocation([marker.lat, marker.lng]);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setEditingId(null);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setTargetLocation(newPos);
        setPendingPosition(newPos);
        setMemoInput('');
        setTimeout(() => {
          inputRef.current?.focus();
        }, 500);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMarker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingPosition || !memoInput.trim()) return;

    try {
      const markersRef = collection(db, markersCollection);
      const docRef = editingId ? doc(db, markersCollection, editingId) : doc(markersRef);
      
      const markerData = {
        id: docRef.id,
        lat: pendingPosition[0],
        lng: pendingPosition[1],
        memo: memoInput.trim(),
        userId: auth.currentUser?.uid || 'anonymous',
        createdAt: editingId ? serverTimestamp() : serverTimestamp(), // In a real app we might preserve original createdAt
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(docRef, markerData, { merge: true });
      setPendingPosition(null);
      setEditingId(null);
      setMemoInput('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, markersCollection);
    }
  };

  const deleteMarker = async (id: string) => {
    try {
      await deleteDoc(doc(db, markersCollection, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, markersCollection);
    }
  };

  const clearMarkers = async () => {
    if (markers.length === 0) return;
    if (confirm('모든 핀을 삭제하시겠습니까?')) {
      try {
        const deletePromises = markers.map(m => deleteDoc(doc(db, markersCollection, m.id)));
        await Promise.all(deletePromises);
        setPendingPosition(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, markersCollection);
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-lime/10 rounded-xl flex items-center justify-center text-lime">
            <MapIcon size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black italic serif">인터랙티브 지도</h2>
            <p className="text-[10px] sm:text-xs text-white/40">장소를 검색하여 핀을 추가하세요</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative flex-1 sm:min-w-[280px]">
            <input
              type="text"
              placeholder="장소, 주소 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white focus:outline-none focus:border-lime/50 transition-all placeholder:text-white/20"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <button 
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-lime hover:bg-lime/10 rounded-lg transition-all disabled:opacity-30"
            >
              {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            </button>
          </form>

          <button
            onClick={clearMarkers}
            disabled={markers.length === 0 && !pendingPosition}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-bold text-sm transition-all border border-red-500/20 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            <Trash2 size={16} />
            전체 지우기
          </button>
        </div>
      </div>

      <div className="relative w-full h-[450px] sm:h-[600px] lg:h-[750px] rounded-[32px] sm:rounded-[40px] overflow-hidden border border-black/5 shadow-2xl bg-white/50 z-0">
        <MapContainer 
          center={[37.7597, 126.7801]} 
          zoom={12} 
          style={{ width: '100%', height: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <MapController center={targetLocation} />
          <MapEvents />
          
          {/* Pending Marker with Input Popup */}
          {pendingPosition && (
            <Popup 
              position={pendingPosition} 
              eventHandlers={{
                remove: () => setPendingPosition(null)
              }}
              closeButton={false} 
              className="custom-popup"
            >
              <div className="p-1 min-w-[200px]">
                <form onSubmit={handleAddMarker} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-lime-600">
                      {editingId ? '메모 수정' : '새 메모 추가'}
                    </span>
                    <button type="button" onClick={() => {
                      setPendingPosition(null);
                      setEditingId(null);
                    }} className="text-black/40 hover:text-black transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder={editingId ? "메모를 수정하세요..." : "무슨 일이 있나요?"}
                      value={memoInput}
                      onChange={(e) => setMemoInput(e.target.value)}
                      className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-black focus:outline-none focus:border-lime-500/50 transition-all placeholder:text-black/20 shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!memoInput.trim()}
                    className="w-full bg-lime text-forest font-black text-[10px] uppercase py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-lime/90 transition-all active:scale-95 disabled:opacity-30 disabled:scale-100"
                  >
                    <Send size={12} />
                    {editingId ? '수정 완료' : '핀 꽂기'}
                  </button>
                </form>
              </div>
            </Popup>
          )}

          {/* Saved Markers */}
          {markers.map(marker => (
            <Marker 
              key={marker.id} 
              position={[marker.lat, marker.lng]} 
              icon={customIcon}
            >
              <Tooltip direction="top" offset={[0, -40]} opacity={1} permanent={false}>
                <div className="bg-white px-3 py-1.5 rounded-lg border border-black/5 shadow-xl">
                  <p className="text-[11px] font-bold text-gray-800 leading-tight">{marker.memo}</p>
                </div>
              </Tooltip>
              <Popup>
                 <div className="p-2 space-y-2 text-gray-800 min-w-[150px]">
                   <p className="text-xs font-medium text-black/40 mb-1">저장된 메모</p>
                   <p className="text-sm font-black">{marker.memo}</p>
                   <div className="flex flex-col gap-1 pt-2 border-t border-black/5 mt-2">
                     <button
                       onClick={() => startEditing(marker)}
                       className="w-full py-1.5 bg-lime text-forest text-[10px] font-bold rounded-lg transition-all active:scale-95"
                     >
                       내용 수정
                     </button>
                     <p className="text-[8px] text-black/10 uppercase font-bold tracking-tighter text-center">
                       LAT: {marker.lat.toFixed(4)}, LNG: {marker.lng.toFixed(4)}
                     </p>
                   </div>
                 </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {markers.length > 0 && (
          <div className="absolute top-6 left-6 z-[1000]">
            <div className="bg-white/90 backdrop-blur-md border border-black/5 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
              <MapPin size={14} className="text-lime-600" />
              <span className="text-xs font-bold text-gray-700">{markers.length}개의 핀</span>
            </div>
          </div>
        )}
      </div>

      {/* Pins List Section */}
      {markers.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">저장된 장소 리스트</h3>
            <div className="h-px flex-1 bg-white/5" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {markers.map((marker) => (
              <div 
                key={marker.id}
                className="glass rounded-3xl p-5 border border-white/5 hover:border-lime/30 transition-all group relative overflow-hidden"
              >
                <div 
                  className="flex justify-between items-start mb-3 gap-4 cursor-pointer"
                  onClick={() => startEditing(marker)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-black text-white line-clamp-1 group-hover:text-lime transition-colors">{marker.memo}</p>
                    <p className="text-[10px] text-white/30 font-bold mt-1">
                      {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMarker(marker.id);
                      }}
                      className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      title="제거"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-lime/20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container {
          background: #f8f9fa !important;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.98) !important;
          backdrop-filter: blur(8px);
          border: 1px solid rgba(0, 0, 0, 0.05);
          color: #1a1a1a !important;
          border-radius: 20px !important;
          padding: 8px !important;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: auto !important;
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          display: none;
        }
        .leaflet-control-attribution {
          background: rgba(255,255,255,0.7) !important;
          color: rgba(0,0,0,0.4) !important;
          font-size: 9px !important;
        }
        .leaflet-control-attribution a {
          color: #4d7c0f !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
        }
        .leaflet-bar a {
          background-color: white !important;
          color: #1a1a1a !important;
          border-bottom: 1px solid rgba(0,0,0,0.05) !important;
        }
        .leaflet-bar a:hover {
          background-color: #f8f9fa !important;
          color: #84cc16 !important;
        }
      `}} />
    </div>
  );
}

