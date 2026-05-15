import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, CheckCircle, Circle, 
  ListTodo, Loader2, AlertCircle, X,
  GripVertical, Pencil, Check, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, 
  setDoc, deleteDoc, doc, updateDoc,
  writeBatch, where, getDocs
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { cn } from '../lib/utils';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  date: string; // YYYY-MM-DD
  userId: string;
  order: number;
}

interface AdminTodoListProps {
  showAlert: (message: string) => void;
  showConfirm?: (message: string, callback: () => void) => void;
}

export default function AdminTodoList({ showAlert, showConfirm }: AdminTodoListProps) {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [newTodo, setNewTodo] = useState('');
  const [newTodoDate, setNewTodoDate] = useState(getTodayStr());
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // 날짜를 YYYYMMDD 형식으로 변환하여 해당 문서의 items 서브 컬렉션을 구독합니다.
    const dateId = selectedDate.replace(/-/g, '');
    const itemsCollectionRef = collection(db, 'todos', dateId, 'items');
    
    const q = query(
      itemsCollectionRef,
      orderBy('order', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todoData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Todo[];
      
      setTodos(todoData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching todos:", error);
      // 서브컬렉션 경로로 에러 처리
      handleFirestoreError(error, OperationType.LIST, `todos/${dateId}/items`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setIsAdding(true);
    try {
      const userId = auth.currentUser?.uid || 'guest';
      const dateId = newTodoDate.replace(/-/g, '');
      
      // 서브 컬렉션 참조
      const itemsRef = collection(db, 'todos', dateId, 'items');
      
      // 새 문서 참조 생성 (ID 자동 생성)
      const newTaskDoc = doc(itemsRef);
      const todoId = newTaskDoc.id;
      
      const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.order)) : 0;

      const newTodoItem: Todo = {
        id: todoId,
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        date: newTodoDate,
        userId: userId,
        order: maxOrder + 1
      };

      // 부모 문서 존재 보장 (날짜별 문서)
      await setDoc(doc(db, 'todos', dateId), { 
        updatedAt: new Date().toISOString(),
        date: newTodoDate
      }, { merge: true });

      // 서브 컬렉션에 할일 추가
      await setDoc(newTaskDoc, newTodoItem);
      
      setNewTodo('');
      if (selectedDate !== newTodoDate) {
        setSelectedDate(newTodoDate);
      }
    } catch (error) {
      const dateId = newTodoDate.replace(/-/g, '');
      handleFirestoreError(error, OperationType.CREATE, `todos/${dateId}/items`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'F4') {
      e.preventDefault();
      if (newTodo.trim() && !isAdding) {
        handleAddTodo(e as any);
      }
    }
  };

  const changeDay = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const handleToggleTodo = async (todo: Todo) => {
    const dateId = todo.date.replace(/-/g, '');
    try {
      await updateDoc(doc(db, 'todos', dateId, 'items', todo.id), {
        completed: !todo.completed
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todos/${dateId}/items/${todo.id}`);
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    
    // 현재 편집 중인 할일의 정보를 찾습니다.
    const todo = todos.find(t => t.id === editingId);
    if (!todo) return;

    const dateId = todo.date.replace(/-/g, '');
    try {
      await updateDoc(doc(db, 'todos', dateId, 'items', editingId), {
        text: editText.trim()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todos/${dateId}/items/${editingId}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteTodo = async (todo: Todo) => {
    const deleteAction = async () => {
      const dateId = todo.date.replace(/-/g, '');
      try {
        await deleteDoc(doc(db, 'todos', dateId, 'items', todo.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `todos/${dateId}/items/${todo.id}`);
      }
    };

    if (showConfirm) {
      showConfirm('이 할 일을 삭제하시겠습니까?', deleteAction);
    } else {
      deleteAction();
    }
  };

  const handleReorder = async (newOrder: Todo[]) => {
    setTodos(newOrder); // Optimistic update
    
    const dateId = selectedDate.replace(/-/g, '');
    try {
      const batch = writeBatch(db);
      newOrder.forEach((todo, index) => {
        if (todo.order !== index) {
          batch.update(doc(db, 'todos', dateId, 'items', todo.id), { order: index });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering:", error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-12 py-10 px-4 sm:px-6 md:px-0"
    >
      <div className="flex flex-col lg:flex-row items-center lg:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-4xl sm:text-6xl font-black italic serif text-white tracking-tighter">오늘의 할 일</h2>
          <p className="text-[12px] text-white/40 uppercase tracking-[0.5em] font-black">효율성 프로토콜 v4.0</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-[28px] p-2.5 backdrop-blur-md shadow-xl w-full sm:w-auto">
          <button 
            onClick={() => changeDay(-1)}
            className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all flex-shrink-0"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-2xl text-white font-black cursor-pointer relative group flex-1 sm:flex-none justify-center border border-white/10">
            <CalendarIcon size={18} className="text-lime" />
            <span className="text-[13px] tabular-nums tracking-wider">{selectedDate}</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <button 
            onClick={() => changeDay(1)}
            className="p-3 hover:bg-white/10 rounded-2xl text-white/60 hover:text-white transition-all flex-shrink-0"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <div className="glass p-6 sm:p-10 rounded-[40px] border border-white/10 space-y-8 sm:y-10">
        <form onSubmit={handleAddTodo} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="무엇을 해야 하나요?"
              className="bg-white/5 border border-white/10 rounded-[24px] px-6 py-4 sm:py-5 flex-grow focus:border-lime outline-none transition-all text-white text-lg sm:text-xl placeholder:text-white/20"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newTodo.trim()}
              className="bg-lime text-forest px-8 py-4 sm:py-5 rounded-[24px] font-black hover:shadow-[0_0_30px_rgba(163,230,53,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl"
            >
              {isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} strokeWidth={3} />}
              <span className="uppercase tracking-[0.1em]">추가</span>
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-2">
            <div className="flex items-center gap-3 sm:gap-4 text-sm">
              <span className="text-white/30 font-black uppercase tracking-widest text-[10px]">생성 예정일:</span>
              <div className="relative group">
                <input 
                  type="date" 
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-lime focus:bg-white/10 transition-all cursor-pointer hover:border-white/20 select-none text-xs sm:text-sm"
                  style={{ colorScheme: 'dark' }}
                />
                {newTodoDate === getTodayStr() && (
                  <span className="absolute -top-2 -right-2 bg-lime text-forest text-[8px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-lg">
                    TODAY
                  </span>
                )}
              </div>
            </div>
            
            {newTodoDate !== getTodayStr() && (
              <button 
                type="button"
                onClick={() => setNewTodoDate(getTodayStr())}
                className="flex items-center gap-1.5 text-[10px] sm:text-xs bg-white/5 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
              >
                <X size={14} />
                오늘로 리셋
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Loader2 size={40} className="animate-spin mb-3" />
              <p className="font-medium">목록을 불러오는 중...</p>
            </div>
          ) : todos.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <AlertCircle size={40} className="mx-auto mb-3 text-white/10" />
              <p className="text-white/30 font-medium text-lg">등록된 할 일이 없습니다</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={todos} onReorder={handleReorder} className="grid gap-3">
              <AnimatePresence mode="popLayout">
                {todos.map((todo) => (
                  <Reorder.Item
                    key={todo.id}
                    value={todo}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={cn(
                      "group relative p-6 sm:p-8 rounded-[32px] flex items-center gap-4 sm:gap-6 transition-all duration-300 border-2 active:scale-[0.99] cursor-pointer",
                      todo.completed 
                        ? "bg-white/5 border-transparent opacity-40 shadow-none" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:shadow-2xl hover:bg-white/10"
                    )}
                    onClick={() => !editingId && handleToggleTodo(todo)}
                  >
                    <div className="text-white/10 hover:text-white/30 p-2 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <GripVertical size={24} />
                    </div>

                    <div className={cn(
                      "transition-all duration-300 flex-shrink-0",
                      todo.completed ? "text-lime scale-110" : "text-white/20 group-hover:text-white/40 group-hover:scale-110"
                    )}>
                      {todo.completed ? (
                        <CheckCircle size={32} strokeWidth={2.5} />
                      ) : (
                        <Circle size={32} strokeWidth={2} />
                      )}
                    </div>
                    
                    {editingId === todo.id ? (
                      <div className="flex-grow flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="bg-white/10 border border-lime/30 rounded-xl px-3 py-2 flex-grow outline-none text-white font-medium"
                        />
                        <div className="flex gap-1">
                          <button 
                            onClick={handleSaveEdit}
                            className="p-2 text-lime hover:bg-lime/10 rounded-lg"
                          >
                            <Check size={20} />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            className="p-2 text-white/40 hover:bg-white/10 rounded-lg"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ) : (
                        <span 
                          className={cn(
                            "flex-grow text-lg sm:text-xl transition-all duration-500 truncate leading-relaxed",
                            todo.completed ? "text-white/60 line-through decoration-lime/50 decoration-2" : "text-white font-black"
                          )}
                        >
                          {todo.text}
                        </span>
                    )}

                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {!todo.completed && editingId !== todo.id && (
                        <button 
                          onClick={() => handleStartEdit(todo)}
                          className="text-white/20 hover:text-lime p-2 rounded-xl hover:bg-lime/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                          title="수정"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteTodo(todo)}
                        className="text-white/20 hover:text-red-400 p-2 rounded-xl hover:bg-red-400/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                        title="삭제"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-white/20 italic">모바일에서 편리하게 할 일을 관리하세요</p>
      </div>
    </motion.div>
  );
}
