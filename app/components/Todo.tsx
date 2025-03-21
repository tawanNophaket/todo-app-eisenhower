'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { scheduleNotification } from '../utils/notificationManager';
import TodoItem from './TodoItem';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  dueDate?: string;
  reminderDate?: string;
  categories: string[];
  tags: string[];
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  timeSpent?: number;
  pomodoroSessions?: number;
  efficiency?: number;
  lastPomodoroDate?: string;
  parentId?: number;
  subtasks?: number[];
}

export default function Todo() {
  // State
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newImportance, setNewImportance] = useState<'high' | 'low'>('high');
  const [newUrgency, setNewUrgency] = useState<'high' | 'low'>('high');
  const [newDueDate, setNewDueDate] = useState<string | undefined>(undefined);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['งานส่วนตัว', 'งานบ้าน', 'การเรียน', 'งานอื่นๆ']);
  const [loading, setLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [activeQuadrant, setActiveQuadrant] = useState<number>(0);

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        // ใช้โหลดแบบคู่ขนานเพื่อความเร็ว
        const [todosData, categoriesData] = await Promise.all([
          localStorage.getItem('todos'),
          localStorage.getItem('categories')
        ]);

        if (todosData) {
          const parsedTodos = JSON.parse(todosData);
          setTodos(parsedTodos);

          // ตั้งเวลาการแจ้งเตือนสำหรับงานที่ยังไม่เสร็จและมีการตั้งเวลาแจ้งเตือน
          if (notificationPermission === 'granted') {
            parsedTodos.forEach((todo: Todo) => {
              if (todo.reminderDate && !todo.completed) {
                scheduleReminderNotification(todo);
              }
            });
          }
        }

        if (categoriesData) {
          try {
            const parsedCategories = JSON.parse(categoriesData);
            if (Array.isArray(parsedCategories)) {
              setCategories(parsedCategories);
            }
          } catch (error) {
            console.error('Error parsing categories:', error);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [notificationPermission]);

  // บันทึกข้อมูลใน localStorage เมื่อ todos เปลี่ยนแปลง
  useEffect(() => {
    if (!loading) {
      // ใช้ debounce เพื่อลดการบันทึกข้อมูลบ่อยเกินไป
      const saveTimeout = setTimeout(() => {
        localStorage.setItem('todos', JSON.stringify(todos));
      }, 500);

      return () => clearTimeout(saveTimeout);
    }
  }, [todos, loading]);

  // บันทึกข้อมูลหมวดหมู่
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, loading]);

  // ตั้งเวลาแจ้งเตือน
  const scheduleReminderNotification = useCallback((todo: Todo) => {
    if (!todo.reminderDate || notificationPermission !== 'granted') return;

    const reminderTime = new Date(todo.reminderDate);
    if (reminderTime > new Date()) {
      scheduleNotification(
        'แจ้งเตือนรายการที่ต้องทำ',
        `"${todo.text}" ถึงกำหนดแล้ว`,
        reminderTime,
        todo.id
      );
    }
  }, [notificationPermission]);

  // เพิ่มรายการใหม่
  const addTodo = useCallback(() => {
    if (newTodo.trim() === '') return;

    const newItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      importance: newImportance,
      urgency: newUrgency,
      dueDate: newDueDate,
      categories: newCategories,
      tags: []
    };

    setTodos(prevTodos => [...prevTodos, newItem]);

    // รีเซ็ตฟอร์ม
    setNewTodo('');
    setNewDueDate(undefined);
    setNewCategories([]);

    // ตั้งการแจ้งเตือนถ้ามีกำหนดเวลา
    if (newItem.reminderDate && notificationPermission === 'granted') {
      scheduleReminderNotification(newItem);
    }

    setShowAddModal(false);
  }, [newTodo, newImportance, newUrgency, newDueDate, newCategories, notificationPermission, scheduleReminderNotification]);

  // สลับสถานะงาน (ทำแล้ว/ยังไม่ได้ทำ)
  const toggleTodo = useCallback((id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []);

  // ลบรายการ
  const deleteTodo = useCallback((id: number) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  }, []);

  // แก้ไขรายการ
  const editTodo = useCallback((id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low',
    dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[],
    startTime?: string, endTime?: string, isAllDay?: boolean, timeSpent?: number,
    pomodoroSessions?: number, efficiency?: number, lastPomodoroDate?: string) => {

    setTodos(prevTodos =>
      prevTodos.map(todo => {
        if (todo.id === id) {
          const updatedTodo = {
            ...todo,
            text: newText,
            importance: importance || todo.importance,
            urgency: urgency || todo.urgency,
            dueDate: dueDate !== undefined ? dueDate : todo.dueDate,
            reminderDate: reminderDate !== undefined ? reminderDate : todo.reminderDate,
            categories: categories || todo.categories,
            tags: tags || todo.tags,
            startTime: startTime !== undefined ? startTime : todo.startTime,
            endTime: endTime !== undefined ? endTime : todo.endTime,
            isAllDay: isAllDay !== undefined ? isAllDay : todo.isAllDay,
            timeSpent: timeSpent !== undefined ? timeSpent : todo.timeSpent,
            pomodoroSessions: pomodoroSessions !== undefined ? pomodoroSessions : todo.pomodoroSessions,
            efficiency: efficiency !== undefined ? efficiency : todo.efficiency,
            lastPomodoroDate: lastPomodoroDate !== undefined ? lastPomodoroDate : todo.lastPomodoroDate
          };

          // จัดการกับการแจ้งเตือนที่เปลี่ยนแปลง
          if (reminderDate && reminderDate !== todo.reminderDate && !updatedTodo.completed && notificationPermission === 'granted') {
            scheduleReminderNotification(updatedTodo);
          }

          return updatedTodo;
        }
        return todo;
      })
    );
  }, [notificationPermission, scheduleReminderNotification]);

  // ลบงานที่เสร็จแล้วทั้งหมด
  const clearCompleted = useCallback(() => {
    setTodos(prevTodos => prevTodos.filter(todo => !todo.completed));
  }, []);

  // เพิ่มงานย่อย
  const addSubtask = useCallback((parentId: number) => {
    const parent = todos.find(todo => todo.id === parentId);
    if (!parent) return;

    const newId = Date.now();
    const newSubtask: Todo = {
      id: newId,
      text: 'งานย่อยใหม่',
      completed: false,
      importance: parent.importance,
      urgency: parent.urgency,
      categories: [...parent.categories],
      tags: [],
      parentId: parentId
    };

    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === parentId) {
          return {
            ...todo,
            subtasks: [...(todo.subtasks || []), newId]
          };
        }
        return todo;
      });

      return [...updatedTodos, newSubtask];
    });
  }, [todos]);

  // ลบงานย่อย
  const deleteSubtask = useCallback((id: number) => {
    const subtask = todos.find(todo => todo.id === id);
    if (!subtask || !subtask.parentId) return;

    setTodos(prevTodos => {
      const updatedTodos = prevTodos.map(todo => {
        if (todo.id === subtask.parentId) {
          return {
            ...todo,
            subtasks: (todo.subtasks || []).filter(subId => subId !== id)
          };
        }
        return todo;
      }).filter(todo => todo.id !== id);

      return updatedTodos;
    });
  }, [todos]);

  // กรองรายการตามเงื่อนไขที่กำหนด
  const filteredTodos = useMemo(() => {
    let filtered = [...todos];

    // กรองตามสถานะ (ทำแล้ว/ยังไม่ได้ทำ)
    if (activeTab === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (activeTab === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    }

    // กรองตาม Eisenhower Matrix
    if (activeQuadrant > 0) {
      switch (activeQuadrant) {
        case 1: // สำคัญ + เร่งด่วน
          filtered = filtered.filter(todo => todo.importance === 'high' && todo.urgency === 'high');
          break;
        case 2: // สำคัญ + ไม่เร่งด่วน
          filtered = filtered.filter(todo => todo.importance === 'high' && todo.urgency === 'low');
          break;
        case 3: // ไม่สำคัญ + เร่งด่วน
          filtered = filtered.filter(todo => todo.importance === 'low' && todo.urgency === 'high');
          break;
        case 4: // ไม่สำคัญ + ไม่เร่งด่วน
          filtered = filtered.filter(todo => todo.importance === 'low' && todo.urgency === 'low');
          break;
      }
    }

    // กรองเฉพาะงานหลัก (ไม่ใช่งานย่อย)
    filtered = filtered.filter(todo => !todo.parentId);

    // เรียงลำดับงาน
    filtered.sort((a, b) => {
      // เรียงตามสถานะเสร็จสิ้น
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // เรียงตามวันกำหนดส่ง
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (a.dueDate) {
        return -1;
      } else if (b.dueDate) {
        return 1;
      }

      // เรียงตามความสำคัญและความเร่งด่วน
      if (a.importance !== b.importance) {
        return a.importance === 'high' ? -1 : 1;
      }
      if (a.urgency !== b.urgency) {
        return a.urgency === 'high' ? -1 : 1;
      }

      // เรียงตามเวลาที่สร้าง (ใหม่ไปเก่า)
      return b.id - a.id;
    });

    return filtered;
  }, [todos, activeTab, activeQuadrant]);

  // นับจำนวนงานที่ทำแล้วและยังไม่ได้ทำ
  const pendingTasks = useMemo(() => todos.filter(todo => !todo.completed).length, [todos]);
  const completedTasks = useMemo(() => todos.filter(todo => todo.completed).length, [todos]);

  // แสดงแทบแบ่งประเภทงาน
  const renderFilterTabs = () => (
    <div className="flex items-center mb-4 overflow-x-auto pb-2 no-scrollbar">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${activeTab === 'all'
          ? 'bg-[var(--primary-color)] text-white'
          : 'bg-[var(--gray-medium)] text-gray-300 hover:bg-[var(--gray-light)]'
          }`}
      >
        ทั้งหมด
      </button>
      <button
        onClick={() => setActiveTab('active')}
        className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${activeTab === 'active'
          ? 'bg-[var(--primary-color)] text-white'
          : 'bg-[var(--gray-medium)] text-gray-300 hover:bg-[var(--gray-light)]'
          }`}
      >
        ยังไม่เสร็จ
      </button>
      <button
        onClick={() => setActiveTab('completed')}
        className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${activeTab === 'completed'
          ? 'bg-[var(--primary-color)] text-white'
          : 'bg-[var(--gray-medium)] text-gray-300 hover:bg-[var(--gray-light)]'
          }`}
      >
        เสร็จแล้ว
      </button>

      <div className="ml-auto">
        <select
          value={activeQuadrant}
          onChange={(e) => setActiveQuadrant(parseInt(e.target.value))}
          className="bg-[var(--gray-medium)] text-gray-300 text-sm rounded-md border-[var(--gray-light)] focus:border-[var(--primary-color)] focus:ring-[var(--primary-color)] py-2 px-3"
        >
          <option value={0}>ทุกประเภท</option>
          <option value={1}>🔥 ทำทันที</option>
          <option value={2}>📋 วางแผนทำ</option>
          <option value={3}>⏰ มอบหมาย</option>
          <option value={4}>🍃 ตัดทิ้ง</option>
        </select>
      </div>
    </div>
  );

  // UI สำหรับแสดงสถานะโหลด
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mb-20">
      {/* แถบแสดงสถานะและตัวเลือก */}
      <div className="mb-2 px-3 pb-2 border-b border-[var(--gray-light)] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          {activeQuadrant > 0 && (
            <span className="text-xl">
              {activeQuadrant === 1 ? '🔥' :
                activeQuadrant === 2 ? '📋' :
                  activeQuadrant === 3 ? '⏰' : '🍃'}
            </span>
          )}
          <h2 className="text-lg font-bold text-white">
            {activeQuadrant === 1 ? "ทำทันที" :
              activeQuadrant === 2 ? "วางแผนทำ" :
                activeQuadrant === 3 ? "มอบหมาย" :
                  activeQuadrant === 4 ? "ตัดทิ้ง" : "รายการทั้งหมด"}
            &nbsp;
            ({activeQuadrant > 0
              ? todos.filter(todo => {
                if (activeQuadrant === 1) return todo.importance === 'high' && todo.urgency === 'high';
                if (activeQuadrant === 2) return todo.importance === 'high' && todo.urgency === 'low';
                if (activeQuadrant === 3) return todo.importance === 'low' && todo.urgency === 'high';
                if (activeQuadrant === 4) return todo.importance === 'low' && todo.urgency === 'low';
                return false;
              }).length
              : todos.length})
          </h2>
        </div>

        {completedTasks > 0 && (
          <button
            onClick={clearCompleted}
            className="badge-modern !bg-[var(--gray-medium)] hover:!bg-[var(--gray-light)] flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            ลบที่เสร็จแล้ว
          </button>
        )}
      </div>

      <div className="max-h-[calc(100vh-250px)] overflow-y-auto hide-scrollbar p-2">
        {renderFilterTabs()}

        {filteredTodos.length === 0 ? (
          <div className="text-center text-gray-400 py-10 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mb-2 text-[var(--primary-color)] font-medium">
              {activeQuadrant > 0
                ? "ไม่มีรายการในหมวดนี้"
                : todos.length === 0
                  ? "ยังไม่มีรายการที่ต้องทำ"
                  : "ไม่พบรายการที่ตรงกับเงื่อนไข"}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white text-sm flex items-center gap-1.5 py-2.5 px-4 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มรายการใหม่
            </button>
          </div>
        ) : (
          filteredTodos.map(todo => (
            <div key={todo.id} className="animate-fadeIn">
              <TodoItem
                id={todo.id}
                text={todo.text}
                completed={todo.completed}
                importance={todo.importance}
                urgency={todo.urgency}
                dueDate={todo.dueDate}
                reminderDate={todo.reminderDate}
                categories={todo.categories}
                tags={todo.tags || []}
                startTime={todo.startTime}
                endTime={todo.endTime}
                isAllDay={todo.isAllDay}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onEdit={editTodo}
                onAddSubtask={addSubtask}
                timeSpent={todo.timeSpent}
                pomodoroSessions={todo.pomodoroSessions}
                efficiency={todo.efficiency}
                lastPomodoroDate={todo.lastPomodoroDate}
                subtasks={todo.subtasks}
                hasChildTasks={todo.subtasks && todo.subtasks.length > 0}
                quadrant={
                  todo.importance === 'high' && todo.urgency === 'high' ? 1 :
                    todo.importance === 'high' && todo.urgency === 'low' ? 2 :
                      todo.importance === 'low' && todo.urgency === 'high' ? 3 : 4
                }
              />

              {/* แสดงงานย่อย */}
              {todo.subtasks && todo.subtasks.length > 0 && (
                <ul className="mt-1">
                  {todo.subtasks.map(subtaskId => {
                    const subtask = todos.find(t => t.id === subtaskId);
                    if (!subtask) return null;

                    return (
                      <TodoItem
                        key={subtask.id}
                        id={subtask.id}
                        text={subtask.text}
                        completed={subtask.completed}
                        importance={subtask.importance}
                        urgency={subtask.urgency}
                        dueDate={subtask.dueDate}
                        reminderDate={subtask.reminderDate}
                        categories={subtask.categories}
                        tags={subtask.tags || []}
                        startTime={subtask.startTime}
                        endTime={subtask.endTime}
                        isAllDay={subtask.isAllDay}
                        onToggle={toggleTodo}
                        onDelete={deleteSubtask}
                        onEdit={editTodo}
                        timeSpent={subtask.timeSpent}
                        pomodoroSessions={subtask.pomodoroSessions}
                        efficiency={subtask.efficiency}
                        lastPomodoroDate={subtask.lastPomodoroDate}
                        isSubtask={true}
                        parentId={todo.id}
                        quadrant={
                          subtask.importance === 'high' && subtask.urgency === 'high' ? 1 :
                            subtask.importance === 'high' && subtask.urgency === 'low' ? 2 :
                              subtask.importance === 'low' && subtask.urgency === 'high' ? 3 : 4
                        }
                      />
                    );
                  })}
                </ul>
              )}
            </div>
          ))
        )}
      </div>

      {/* ปุ่มเพิ่มรายการลอยด้านล่าง */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white rounded-full shadow-lg flex items-center justify-center z-10 transition-colors"
        aria-label="เพิ่มรายการใหม่"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal สำหรับเพิ่มรายการใหม่ */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-[var(--card-bg)] rounded-xl p-5 w-full max-w-md border border-[var(--border-color)] shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--primary-color)] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการใหม่
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
                aria-label="ปิด"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">รายละเอียด</label>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="รายละเอียดงาน..."
                className="w-full p-3 bg-[var(--gray-medium)] text-white text-sm rounded-lg border border-[var(--gray-light)] focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">ประเภทงาน</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('high'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'high' && newUrgency === 'high'
                    ? 'bg-gradient-to-r from-[var(--priority-1)] to-[var(--priority-1)] text-white'
                    : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
                >
                  <span className="text-lg">🔥</span>
                  <span>ทำทันที</span>
                </button>
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('low'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'high' && newUrgency === 'low'
                    ? 'bg-gradient-to-r from-[var(--priority-2)] to-[var(--priority-2)] text-white'
                    : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
                >
                  <span className="text-lg">📋</span>
                  <span>วางแผนทำ</span>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('high'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'low' && newUrgency === 'high'
                    ? 'bg-gradient-to-r from-[var(--priority-3)] to-[var(--priority-3)] text-white'
                    : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
                >
                  <span className="text-lg">⏰</span>
                  <span>มอบหมาย</span>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('low'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'low' && newUrgency === 'low'
                    ? 'bg-gradient-to-r from-[var(--priority-4)] to-[var(--priority-4)] text-white'
                    : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
                >
                  <span className="text-lg">🍃</span>
                  <span>ตัดทิ้ง</span>
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">หมวดหมู่</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setNewCategories(
                      newCategories.includes(category)
                        ? newCategories.filter(c => c !== category)
                        : [...newCategories, category]
                    )}
                    className={`badge-modern ${newCategories.includes(category)
                      ? 'bg-[var(--primary-color)] text-white'
                      : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'
                      }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">กำหนดเสร็จ</label>
              <input
                type="datetime-local"
                value={newDueDate || ''}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-3 bg-[var(--gray-medium)] text-white text-sm rounded-lg border border-[var(--gray-light)] focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
              />
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={addTodo}
                className={`px-4 py-2.5 bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors ${newTodo.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={newTodo.trim() === ''}
              >
                เพิ่มรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}