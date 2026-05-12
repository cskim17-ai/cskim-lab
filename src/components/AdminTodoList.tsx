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
  writeBatch, where
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
    // 선택된 날짜에 해당하는 할일만 필터링하여 가져옵니다.
    const q = query(
      collection(db, 'todos'), 
      where('date', '==', selectedDate),
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
      handleFirestoreError(error, OperationType.LIST, 'todos');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setIsAdding(true);
    try {
      const todoId = Math.random().toString(36).substring(2, 11);
      const userId = auth.currentUser?.uid || 'guest';
      
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

      await setDoc(doc(db, 'todos', todoId), newTodoItem);
      setNewTodo('');
      // 만약 다른 날짜에 추가했다면 해당 날짜로 이동할지 물어볼 수도 있지만, 
      // 여기서는 목록이 갱신되도록 selectedDate를 newTodoDate로 맞춰줍니다.
      if (selectedDate !== newTodoDate) {
        setSelectedDate(newTodoDate);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'todos');
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

  const handleToggleTodo = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'todos', id), {
        completed: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todos/${id}`);
    }
  };

  const handleStartEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;
    
    try {
      await updateDoc(doc(db, 'todos', editingId), {
        text: editText.trim()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `todos/${editingId}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteTodo = async (id: string) => {
    const deleteAction = async () => {
      try {
        await deleteDoc(doc(db, 'todos', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `todos/${id}`);
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
    
    try {
      const batch = writeBatch(db);
      newOrder.forEach((todo, index) => {
        if (todo.order !== index) {
          batch.update(doc(db, 'todos', todo.id), { order: index });
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
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-lime/20 p-2 rounded-lg">
            <ListTodo className="text-lime" size={24} />
          </div>
          <h2 className="text-3xl serif italic">1.할일목록</h2>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 grayscale-0">
          <button 
            onClick={() => changeDay(-1)}
            className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-xl text-white font-bold cursor-pointer relative group">
            <CalendarIcon size={16} className="text-lime" />
            <span className="text-sm">{selectedDate}</span>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>
          <button 
            onClick={() => changeDay(1)}
            className="p-2 hover:bg-white/10 rounded-xl text-white/60 hover:text-white transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="glass p-4 sm:p-8 rounded-[32px] border border-white/10 space-y-8">
        <form onSubmit={handleAddTodo} className="space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="새로운 할 일을 입력하세요... (F4: 추가)"
              className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex-grow focus:border-lime outline-none transition-all text-white text-lg placeholder:text-white/20"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding || !newTodo.trim()}
              className="bg-lime text-forest px-6 py-4 rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(163,230,53,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
              <span className="hidden sm:inline font-bold">추가</span>
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 px-1">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-white/40 font-medium whitespace-nowrap">등록 예정일:</span>
              <div className="relative group">
                <input 
                  type="date" 
                  value={newTodoDate}
                  onChange={(e) => setNewTodoDate(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-lime focus:bg-white/10 transition-all cursor-pointer hover:border-white/20 select-none"
                  style={{ colorScheme: 'dark' }}
                />
                {newTodoDate === getTodayStr() && (
                  <span className="absolute -top-2 -right-2 bg-lime text-forest text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-lg">
                    TODAY
                  </span>
                )}
                {newTodoDate > getTodayStr() && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black shadow-lg animate-pulse">
                    FUTURE
                  </span>
                )}
              </div>
            </div>
            
            {newTodoDate !== getTodayStr() && (
              <button 
                type="button"
                onClick={() => setNewTodoDate(getTodayStr())}
                className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
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
                      "group relative p-4 sm:p-5 rounded-3xl flex items-center gap-2 sm:gap-4 transition-all duration-300 border-2 active:scale-[0.99] cursor-pointer",
                      todo.completed 
                        ? "bg-white/5 border-transparent opacity-40 shadow-none" 
                        : "bg-white/5 border-white/5 hover:border-white/20 hover:shadow-xl"
                    )}
                    onClick={() => !editingId && handleToggleTodo(todo.id, todo.completed)}
                  >
                    <div className="text-white/10 hover:text-white/30 p-1 cursor-grab active:cursor-grabbing flex-shrink-0">
                      <GripVertical size={20} />
                    </div>

                    <div className={cn(
                      "transition-colors flex-shrink-0",
                      todo.completed ? "text-lime" : "text-white/20 group-hover:text-white/40"
                    )}>
                      {todo.completed ? (
                        <CheckCircle size={24} strokeWidth={2.5} />
                      ) : (
                        <Circle size={24} strokeWidth={2} />
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
                          "flex-grow text-base sm:text-lg transition-all duration-500 truncate",
                          todo.completed ? "text-white line-through decoration-lime/50 decoration-2" : "text-white font-medium"
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
                        onClick={() => handleDeleteTodo(todo.id)}
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
