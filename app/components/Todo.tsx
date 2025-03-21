'use client';

import { useState, useEffect } from 'react';
import TodoItem from './TodoItem';
import Header from './Header';
import NotificationManager from './NotificationManager';
import { scheduleNotification } from '../utils/notificationManager';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  importance: 'high' | 'low'; // สำคัญหรือไม่สำคัญ
  urgency: 'high' | 'low';    // เร่งด่วนหรือไม่เร่งด่วน
  dueDate?: string;
  reminderDate?: string;
  categories: string[];       // หมวดหมู่ เช่น งานส่วนตัว, งานบ้าน, การเรียน
  tags: string[];             // แท็กผู้ใช้กำหนดเอง
  startTime?: string;         // เวลาเริ่มต้น
  endTime?: string;           // เวลาสิ้นสุด
  isAllDay?: boolean;         // เป็นงานทั้งวันหรือไม่
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newImportance, setNewImportance] = useState<'high' | 'low'>('high');
  const [newUrgency, setNewUrgency] = useState<'high' | 'low'>('high');
  const [newDueDate, setNewDueDate] = useState<string | undefined>(undefined);
  const [newReminderDate, setNewReminderDate] = useState<string | undefined>(undefined);
  const [newCategories, setNewCategories] = useState<string[]>([]);
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newStartTime, setNewStartTime] = useState<string | undefined>(undefined);
  const [newEndTime, setNewEndTime] = useState<string | undefined>(undefined);
  const [newIsAllDay, setNewIsAllDay] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>(['งานส่วนตัว', 'งานบ้าน', 'การเรียน', 'งานอื่นๆ']);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddModal, setShowAddModal] = useState(false);

  // โหลดข้อมูล todos, categories และ tags จาก localStorage เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    setIsLoading(true);
    
    // จำลองการโหลดข้อมูลช้าๆ เพื่อแสดง loading state
    setTimeout(() => {
      const savedTodos = localStorage.getItem('todos');
      const savedCategories = localStorage.getItem('categories');
      const savedTags = localStorage.getItem('tags');
      
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        // แปลงข้อมูลเก่าให้มีฟิลด์ใหม่ถ้าจำเป็น
        const updatedTodos = parsedTodos.map((todo: any) => ({
          ...todo,
          categories: todo.categories && Array.isArray(todo.categories) ? todo.categories : [],
          tags: todo.tags && Array.isArray(todo.tags) ? todo.tags : []
        }));
        setTodos(updatedTodos);
        
        // ตรวจสอบการแจ้งเตือนสำหรับรายการที่มีกำหนดการแจ้งเตือน
        updatedTodos.forEach((todo: Todo) => {
          if (todo.reminderDate && !todo.completed) {
            scheduleReminderNotification(todo);
          }
        });
      }
      
      if (savedCategories) {
        try {
          const parsedCategories = JSON.parse(savedCategories);
          if (Array.isArray(parsedCategories)) {
            setCategories(parsedCategories);
          } else {
            console.error('Saved categories is not an array:', parsedCategories);
            setCategories(['งานส่วนตัว', 'งานบ้าน', 'การเรียน', 'งานอื่นๆ']);
          }
        } catch (error) {
          console.error('Error parsing saved categories:', error);
          setCategories(['งานส่วนตัว', 'งานบ้าน', 'การเรียน', 'งานอื่นๆ']);
        }
      }
      
      if (savedTags) {
        try {
          const parsedTags = JSON.parse(savedTags);
          if (Array.isArray(parsedTags)) {
            setTags(parsedTags);
          } else {
            console.error('Saved tags is not an array:', parsedTags);
            setTags([]);
          }
        } catch (error) {
          console.error('Error parsing saved tags:', error);
          setTags([]);
        }
      }
      
      setIsLoading(false);
    }, 800);
  }, []);

  // บันทึกข้อมูล todos, categories และ tags ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('categories', JSON.stringify(categories));
    }
  }, [categories, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tags', JSON.stringify(tags));
    }
  }, [tags, isLoading]);

  // ฟังก์ชั่นสำหรับตั้งเวลาแจ้งเตือน
  const scheduleReminderNotification = (todo: Todo) => {
    if (!todo.reminderDate || !notificationPermission || notificationPermission !== 'granted') return;

    const reminderTime = new Date(todo.reminderDate);
    
    // ตรวจสอบว่ารายการมีกำหนดเวลาการแจ้งเตือนในอนาคตหรือไม่
    if (reminderTime > new Date()) {
      scheduleNotification(
        'แจ้งเตือนรายการที่ต้องทำ',
        `"${todo.text}" ถึงกำหนดแล้ว`,
        reminderTime,
        todo.id,
        {
          data: {
            todoId: todo.id,
            url: window.location.href
          }
        }
      );
    }
  };

  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newItem: Todo = {
      id: Date.now(),
      text: newTodo,
      completed: false,
      importance: newImportance,
      urgency: newUrgency,
      dueDate: newDueDate,
      reminderDate: newReminderDate,
      categories: newCategories,
      tags: newTags,
      startTime: newStartTime,
      endTime: newEndTime,
      isAllDay: newIsAllDay
    };
    
    setTodos([...todos, newItem]);
    setNewTodo('');
    setNewDueDate(undefined);
    setNewReminderDate(undefined);
    setNewCategories([]);
    setNewTags([]);
    setNewStartTime(undefined);
    setNewEndTime(undefined);
    setNewIsAllDay(false);
    
    // ตั้งค่าการแจ้งเตือนหากมีการกำหนด
    if (newReminderDate && notificationPermission === 'granted') {
      scheduleReminderNotification(newItem);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const editTodo = (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[], startTime?: string, endTime?: string, isAllDay?: boolean) => {
    setTodos(
      todos.map(todo => {
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
            isAllDay: isAllDay !== undefined ? isAllDay : todo.isAllDay
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
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
  const addCategory = (category: string) => {
    if (category.trim() === '' || categories.includes(category)) return;
    setCategories([...categories, category]);
  };

  // ฟังก์ชันเพิ่มแท็กใหม่
  const addTag = (tag: string) => {
    if (tag.trim() === '' || tags.includes(tag)) return;
    setTags([...tags, tag]);
    setNewTagInput('');
  };

  // ฟังก์ชันลบหมวดหมู่
  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
    // ลบหมวดหมู่นี้ออกจากทุกรายการ
    setTodos(todos.map(todo => ({
      ...todo,
      categories: todo.categories.filter(c => c !== category)
    })));
    if (activeCategory === category) {
      setActiveCategory(null);
    }
  };

  // ฟังก์ชันลบแท็ก
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
    // ลบแท็กนี้ออกจากทุกรายการ
    setTodos(todos.map(todo => ({
      ...todo,
      tags: todo.tags.filter(t => t !== tag)
    })));
    if (activeTag === tag) {
      setActiveTag(null);
    }
  };

  // ฟังก์ชันกรองรายการตามหมวดหมู่และแท็ก
  const getFilteredTodos = () => {
    let filteredTodos = todos;
    
    if (activeCategory) {
      filteredTodos = filteredTodos.filter(todo => 
        todo.categories.includes(activeCategory)
      );
    }
    
    if (activeTag) {
      filteredTodos = filteredTodos.filter(todo => 
        todo.tags.includes(activeTag)
      );
    }
    
    if (activeQuadrant) {
      switch(activeQuadrant) {
        case 1: // สำคัญและเร่งด่วน
          filteredTodos = filteredTodos.filter(todo => 
            todo.importance === 'high' && todo.urgency === 'high'
          );
          break;
        case 2: // สำคัญแต่ไม่เร่งด่วน
          filteredTodos = filteredTodos.filter(todo => 
            todo.importance === 'high' && todo.urgency === 'low'
          );
          break;
        case 3: // เร่งด่วนแต่ไม่สำคัญ
          filteredTodos = filteredTodos.filter(todo => 
            todo.importance === 'low' && todo.urgency === 'high'
          );
          break;
        case 4: // ไม่สำคัญและไม่เร่งด่วน
          filteredTodos = filteredTodos.filter(todo => 
            todo.importance === 'low' && todo.urgency === 'low'
          );
          break;
      }
    }
    
    // เรียงลำดับรายการตามวันที่ส่งและความสำคัญ
    return sortTodos(filteredTodos);
  };

  // ฟังก์ชันเรียงลำดับรายการตามวันที่ส่งและความสำคัญ
  const sortTodos = (todosList: Todo[]) => {
    return [...todosList].sort((a, b) => {
      // เรียงงานที่ยังไม่เสร็จไว้ก่อน
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      // เรียงตามกำหนดส่ง - งานที่มีกำหนดส่งเร็วกว่าจะอยู่ก่อน
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (a.dueDate) {
        return -1; // งานที่มีกำหนดส่งอยู่ก่อนงานที่ไม่มีกำหนดส่ง
      } else if (b.dueDate) {
        return 1;
      }
      
      // เรียงตามความสำคัญ (สำคัญมากอยู่ก่อน)
      if (a.importance !== b.importance) {
        return a.importance === 'high' ? -1 : 1;
      }
      
      // เรียงตามความเร่งด่วน (เร่งด่วนอยู่ก่อน)
      if (a.urgency !== b.urgency) {
        return a.urgency === 'high' ? -1 : 1;
      }
      
      // ถ้าทุกอย่างเท่ากัน ให้เรียงตามเวลาสร้าง (ใหม่สุดอยู่ก่อน)
      return b.id - a.id;
    });
  };

  // แบ่งงานตาม Eisenhower Matrix
  const getQuadrantTodos = (quadrant: number) => {
    let quadrantTodos;
    switch(quadrant) {
      case 1: // สำคัญและเร่งด่วน (Urgent & Important)
        quadrantTodos = todos.filter(todo => todo.importance === 'high' && todo.urgency === 'high');
        break;
      case 2: // สำคัญแต่ไม่เร่งด่วน (Important but Not Urgent)
        quadrantTodos = todos.filter(todo => todo.importance === 'high' && todo.urgency === 'low');
        break;
      case 3: // เร่งด่วนแต่ไม่สำคัญ (Urgent but Not Important)
        quadrantTodos = todos.filter(todo => todo.importance === 'low' && todo.urgency === 'high');
        break;
      case 4: // ไม่สำคัญและไม่เร่งด่วน (Not Urgent & Not Important)
        quadrantTodos = todos.filter(todo => todo.importance === 'low' && todo.urgency === 'low');
        break;
      default:
        quadrantTodos = todos;
        break;
    }
    return sortTodos(quadrantTodos);
  };

  // คัดแยกงานที่เสร็จแล้วและยังไม่เสร็จ
  const pendingTasks = todos.filter(todo => !todo.completed).length;
  const completedTasks = todos.filter(todo => todo.completed).length;
  
  // คำนวณเปอร์เซ็นต์ความสำเร็จ
  const completionPercentage = todos.length > 0 
    ? Math.round((completedTasks / todos.length) * 100)
    : 0;

  // เพิ่มฟังก์ชันสำหรับ due dates
  // คำนวณวันที่ใกล้ครบกำหนด (ภายใน 3 วัน)
  const getDueSoonTodos = () => {
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);
    
    return todos
      .filter(todo => {
        if (!todo.dueDate || todo.completed) return false;
        const dueDate = new Date(todo.dueDate);
        return dueDate <= threeDaysLater;
      })
      .map(todo => {
        const dueDate = new Date(todo.dueDate!);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const quadrant = 
          todo.importance === 'high' && todo.urgency === 'high' ? 1 :
          todo.importance === 'high' && todo.urgency === 'low' ? 2 :
          todo.importance === 'low' && todo.urgency === 'high' ? 3 : 4;
        
        return {
          ...todo,
          daysLeft: diffDays,
          quadrant
        };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  };
  
  const dueSoonTodos = getDueSoonTodos();

  // ฟังก์ชันจัดการการเปลี่ยนแปลงสิทธิ์การแจ้งเตือน
  const handlePermissionChange = (permission: NotificationPermission) => {
    setNotificationPermission(permission);
  };

  // เพิ่มฟังก์ชันเปิดโมดัลเพิ่มรายการใหม่
  const openAddModal = () => {
    setShowAddModal(true);
  };

  // ฟังก์ชันสำหรับปิดโมดัล
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // UI ส่วนแสดงรายการกลุ่มงาน (สำหรับหน้าจอใหญ่)
  const renderTaskByCategory = () => {
    const completedTasks = todos.filter(todo => todo.completed);
    const uncompletedTasks = getFilteredTodos().filter(todo => !todo.completed);
    
    return (
      <div className="animate-fade-in">
        {uncompletedTasks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gradient flex items-center gap-2">
              <span className="material-symbols-rounded text-[var(--primary-color)]">task_alt</span>
              รายการที่ต้องทำ ({uncompletedTasks.length})
            </h2>
            <div className="space-y-3">
              {uncompletedTasks.map(todo => (
                <TodoItem
                  key={todo.id}
                  {...todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))}
            </div>
          </div>
        )}
        
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-400 flex items-center gap-2">
              <span className="material-symbols-rounded">check_circle</span>
              เสร็จสิ้นแล้ว ({completedTasks.length})
            </h2>
            <div className="space-y-3">
              {completedTasks.map(todo => (
                <TodoItem
                  key={todo.id}
                  {...todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // โมดัลสำหรับเพิ่มรายการใหม่
  const renderAddTaskModal = () => {
    if (!showAddModal) return null;
    
    return (
      <div className="modal-overlay" onClick={closeAddModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">เพิ่มรายการใหม่</h3>
            <button 
              onClick={closeAddModal}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-rounded">close</span>
            </button>
          </div>
          
          <div className="mb-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="เพิ่มรายการใหม่..."
              className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
              autoFocus
            />
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-300 mb-2">ประเภทงาน</div>
            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                onClick={() => { setNewImportance('high'); setNewUrgency('high'); }}
                className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${newImportance === 'high' && newUrgency === 'high' ? 'bg-gradient-to-br from-red-500 to-red-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
              >
                <span className="material-symbols-rounded">priority_high</span>
                <span>ทำทันที</span>
              </button>
              <button
                onClick={() => { setNewImportance('high'); setNewUrgency('low'); }}
                className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${newImportance === 'high' && newUrgency === 'low' ? 'bg-gradient-to-br from-[#ff6100] to-[#cc4d00] text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
              >
                <span className="material-symbols-rounded">event_note</span>
                <span>วางแผนทำ</span>
              </button>
              <button
                onClick={() => { setNewImportance('low'); setNewUrgency('high'); }}
                className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${newImportance === 'low' && newUrgency === 'high' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
              >
                <span className="material-symbols-rounded">schedule</span>
                <span>มอบหมาย</span>
              </button>
              <button
                onClick={() => { setNewImportance('low'); setNewUrgency('low'); }}
                className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${newImportance === 'low' && newUrgency === 'low' ? 'bg-gradient-to-br from-green-500 to-green-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
              >
                <span className="material-symbols-rounded">spa</span>
                <span>ตัดทิ้ง</span>
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-300 mb-2">วันที่และเวลา</div>
            <input 
              type="datetime-local" 
              value={newDueDate || ''} 
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full p-3 mb-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
            />
            
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="all-day-new"
                checked={newIsAllDay}
                onChange={(e) => setNewIsAllDay(e.target.checked)}
                className="w-4 h-4 mr-2 accent-[#ff6100]"
              />
              <label htmlFor="all-day-new" className="text-sm text-gray-300">ทั้งวัน</label>
            </div>
            
            {!newIsAllDay && (
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">เวลาเริ่มต้น</div>
                  <input
                    type="time"
                    value={newStartTime || ''}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">เวลาสิ้นสุด</div>
                  <input
                    type="time"
                    value={newEndTime || ''}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={() => {
              addTodo();
              closeAddModal();
            }}
            disabled={newTodo.trim() === ''}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex justify-center items-center gap-2 ${
              newTodo.trim() === '' 
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-[#ff6100] to-[#ff7c33] text-white hover:shadow-lg hover:shadow-[#ff610033] active:scale-95'
            }`}
          >
            <span className="material-symbols-rounded">add_task</span>
            เพิ่มรายการ
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <div className="w-12 h-12 border-4 border-t-[#ff6100] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">กำลังโหลดรายการ...</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* การ์ด UI หลัก */}
      <div className="app-card p-6 mb-8 animate-scale-up glass-effect">
        {/* ส่วนข้อมูลเมตริก */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#1e1e1e] rounded-lg p-4 flex flex-col items-center text-center border border-[#333] hover-lift">
            <span className="material-symbols-rounded text-white text-3xl mb-2">pending_actions</span>
            <div className="text-2xl font-bold">{todos.filter(todo => !todo.completed).length}</div>
            <div className="text-xs text-gray-400">รอดำเนินการ</div>
          </div>
          <div className="bg-[#1e1e1e] rounded-lg p-4 flex flex-col items-center text-center border border-[#333] hover-lift">
            <span className="material-symbols-rounded text-green-500 text-3xl mb-2">task_alt</span>
            <div className="text-2xl font-bold">{todos.filter(todo => todo.completed).length}</div>
            <div className="text-xs text-gray-400">เสร็จสิ้น</div>
          </div>
          <div className="bg-[#1e1e1e] rounded-lg p-4 flex flex-col items-center text-center border border-[#333] hover-lift">
            <span className="material-symbols-rounded text-red-500 text-3xl mb-2">running_with_errors</span>
            <div className="text-2xl font-bold">
              {todos.filter(todo => {
                if (!todo.dueDate || todo.completed) return false;
                return new Date(todo.dueDate) < new Date();
              }).length}
            </div>
            <div className="text-xs text-gray-400">เลยกำหนด</div>
          </div>
          <div className="bg-[#1e1e1e] rounded-lg p-4 flex flex-col items-center text-center border border-[#333] hover-lift">
            <span className="material-symbols-rounded text-[#ff6100] text-3xl mb-2">today</span>
            <div className="text-2xl font-bold">
              {todos.filter(todo => {
                if (!todo.dueDate || todo.completed) return false;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dueDate = new Date(todo.dueDate);
                return dueDate >= today && dueDate < tomorrow;
              }).length}
            </div>
            <div className="text-xs text-gray-400">วันนี้</div>
          </div>
        </div>
      
        {renderTaskByCategory()}
        
        {todos.length === 0 && (
          <div className="text-center py-10">
            <div className="material-symbols-rounded text-5xl text-gray-600 mb-4">task</div>
            <h3 className="text-xl font-semibold mb-2">ยังไม่มีรายการ</h3>
            <p className="text-gray-400 mb-4">เพิ่มรายการแรกของคุณเพื่อเริ่มจัดการงาน</p>
            <button
              onClick={openAddModal}
              className="app-button app-button-primary mx-auto"
            >
              <span className="material-symbols-rounded mr-2">add</span>
              เพิ่มรายการใหม่
            </button>
          </div>
        )}
      </div>
      
      {/* ปุ่มเพิ่มรายการแบบลอย */}
      <button
        onClick={openAddModal}
        className="add-button add-button-pulse"
        aria-label="เพิ่มรายการใหม่"
      >
        <span className="material-symbols-rounded">add</span>
      </button>
      
      {/* Modal เพิ่มรายการใหม่ */}
      {renderAddTaskModal()}
    </div>
  );
} 