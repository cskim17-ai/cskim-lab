import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Share2, 
  MousePointer2, 
  GitBranch, 
  Zap, 
  CheckCircle2,
  Maximize2,
  Edit2,
  Layers,
  Link2,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  id: string;
  from: string;
  to: string;
}

const PASTEL_COLORS = [
  '#fecaca', // Red
  '#fed7aa', // Orange
  '#fef08a', // Yellow
  '#bbf7d0', // Green
  '#bfdbfe', // Blue
  '#ddd6fe', // Purple
  '#f5d0fe', // Pink
];

export default function AdminMindMap() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addNode = () => {
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      text: '새 노드',
      x: (containerRef.current?.clientWidth || 800) / 2 - 60,
      y: (containerRef.current?.clientHeight || 600) / 2 - 20,
      color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNodePosition = (id: string, x: number, y: number) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, x, y } : node));
  };

  const updateNodeText = (id: string, text: string) => {
    setNodes(prev => prev.map(node => node.id === id ? { ...node, text } : node));
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setConnections(prev => prev.filter(c => c.from !== id && c.to !== id));
    setSelectedNodeIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleNodeClick = (e: React.MouseEvent, id: string) => {
    if (e.ctrlKey) {
      setSelectedNodeIds(prev => {
        if (prev.includes(id)) return prev.filter(i => i !== id);
        const next = [...prev, id];
        if (next.length === 2) {
          const exists = connections.some(c => 
            (c.from === next[0] && c.to === next[1]) || 
            (c.from === next[1] && c.to === next[0])
          );
          if (!exists) {
            setConnections(curr => [...curr, { 
              id: `${next[0]}-${next[1]}`, 
              from: next[0], 
              to: next[1] 
            }]);
          }
          return []; // Reset after connecting
        }
        return next;
      });
    } else {
      setSelectedNodeIds([id]);
    }
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
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">마인드맵 도구</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black mt-2">Neural Mapping v1.0</p>
        </div>
        
        <div className="flex items-center flex-wrap justify-center gap-4">
          <div className="flex items-center gap-6 px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
             <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white/10 rounded text-[9px] font-bold text-white/40">CTRL</kbd>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">연결하기</span>
             </div>
             <div className="w-px h-4 bg-white/10" />
             <div className="flex items-center gap-2 text-lime">
                <Plus size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer" onClick={addNode}>노드 추가</span>
             </div>
          </div>
          
          <button
            onClick={addNode}
            className="px-8 py-3 bg-lime text-forest font-black rounded-2xl hover:bg-[#b0f533] active:scale-95 transition-all shadow-xl shadow-lime/10 flex items-center justify-center gap-2 group"
          >
            <Zap size={16} className="group-hover:rotate-12 transition-transform" />
            <span>노드 추가</span>
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-lime/20 via-blue-500/10 to-purple-500/10 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
        
        <div 
          ref={containerRef}
          className="relative w-full h-[700px] bg-[#0a0a0a] rounded-[48px] border border-white/10 shadow-2xl overflow-hidden"
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', 
              backgroundSize: '40px 40px' 
            }} 
          />

          {/* SVG Connection Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/10 fill-none">
            <defs>
               <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255,255,255,0.1)" />
               </marker>
            </defs>
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              // Calculate centers (Node is 120x40ish)
              const x1 = fromNode.x + 60;
              const y1 = fromNode.y + 20;
              const x2 = toNode.x + 60;
              const y2 = toNode.y + 20;

              return (
                <motion.line
                  key={conn.id}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  strokeWidth="2"
                  className="stroke-white/10"
                  strokeDasharray="4 4"
                />
              );
            })}
          </svg>

          {/* Nodes Layer */}
          <AnimatePresence>
            {nodes.map(node => (
              <motion.div
                key={node.id}
                drag
                dragMomentum={false}
                onDrag={(_, info) => {
                  const x = node.x + info.delta.x;
                  const y = node.y + info.delta.y;
                  updateNodePosition(node.id, x, y);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: node.x,
                  y: node.y
                }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => handleNodeClick(e, node.id)}
                className={cn(
                  "absolute z-10 p-4 min-w-[120px] rounded-2xl shadow-xl transition-all cursor-move group/node",
                  selectedNodeIds.includes(node.id) ? "ring-2 ring-lime scale-105" : "hover:scale-105"
                )}
                style={{ backgroundColor: node.color }}
              >
                <div className="flex flex-col gap-2 relative">
                   <div className="flex items-center justify-between gap-4">
                      <input
                        type="text"
                        value={node.text}
                        onChange={(e) => updateNodeText(node.id, e.target.value)}
                        className="bg-transparent border-none text-[13px] font-black text-black/80 focus:outline-none w-full placeholder:text-black/20"
                        onMouseDown={(e) => e.stopPropagation()} // Prevent drag on text input
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                           e.stopPropagation();
                           deleteNode(node.id);
                        }}
                        className="opacity-0 group-hover/node:opacity-100 transition-opacity text-black/40 hover:text-black"
                      >
                         <Trash2 size={12} />
                      </button>
                   </div>
                   
                   {/* Connection indicator */}
                   {selectedNodeIds.includes(node.id) && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-lime text-forest text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg">
                         <Link2 size={10} />
                         <span>연결 대기 중</span>
                      </div>
                   )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {nodes.length === 0 && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/10 animate-pulse">
                   <Maximize2 size={40} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                   <p className="text-xs font-black text-white/20 uppercase tracking-[0.5em]">Map is Empty</p>
                   <p className="text-[10px] italic font-bold text-white/10">상단의 버튼을 눌러 첫 번째 노드를 생성하세요</p>
                </div>
             </div>
          )}

          {/* Floating Action Tip */}
          <div className="absolute bottom-10 left-10 flex items-center gap-4">
             <div className="flex items-center gap-3 px-5 py-3 bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl">
                <AlertCircle size={14} className="text-lime" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none">
                   노드를 클릭하여 선택<br/>
                   CTRL+클릭으로 연결
                </span>
             </div>
          </div>

          {/* Watermark */}
          <div className="absolute bottom-10 right-10 pointer-events-none select-none flex items-center gap-3 opacity-10 grayscale">
             <GitBranch size={24} className="text-white" />
             <div className="text-right">
                <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Neural Canvas v1.0</p>
                <p className="text-[8px] font-bold text-white uppercase tracking-[0.3em]">AI Studio Build</p>
             </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-10 border-t border-white/5 opacity-30">
        <div className="flex items-center gap-3">
          <Layers size={24} />
          <div className="text-left">
            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Mapping Integrity Engine</p>
            <p className="text-[8px] font-bold uppercase tracking-[0.3em]">Neural Protocol v2.4.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest italic">
          <div className="flex items-center gap-1.5">
             <Zap size={10} className="text-lime" />
             <span>실시간 렌더링 활성</span>
          </div>
          <div className="flex items-center gap-1.5">
             <CheckCircle2 size={10} />
             <span>노드 좌표 동기화 완료</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
