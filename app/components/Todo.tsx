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
      tags: newTags
    };
    
    setTodos([...todos, newItem]);
    setNewTodo('');
    setNewDueDate(undefined);
    setNewReminderDate(undefined);
    setNewCategories([]);
    setNewTags([]);
    
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

  const editTodo = (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[]) => {
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
            tags: tags || todo.tags
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
    
    return filteredTodos;
  };

  // แบ่งงานตาม Eisenhower Matrix
  const getQuadrantTodos = (quadrant: number) => {
    switch(quadrant) {
      case 1: // สำคัญและเร่งด่วน (Urgent & Important)
        return todos.filter(todo => todo.importance === 'high' && todo.urgency === 'high');
      case 2: // สำคัญแต่ไม่เร่งด่วน (Important but Not Urgent)
        return todos.filter(todo => todo.importance === 'high' && todo.urgency === 'low');
      case 3: // เร่งด่วนแต่ไม่สำคัญ (Urgent but Not Important)
        return todos.filter(todo => todo.importance === 'low' && todo.urgency === 'high');
      case 4: // ไม่สำคัญและไม่เร่งด่วน (Not Urgent & Not Important)
        return todos.filter(todo => todo.importance === 'low' && todo.urgency === 'low');
      default:
        return todos;
    }
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

  // ส่วนแสดงผลหลัก
  return (
    <div className="w-full max-w-lg mx-auto px-3">
      <div className="mb-4">
        <Header />
      </div>
      
      {/* Component สำหรับการจัดการการแจ้งเตือน */}
      <NotificationManager onPermissionChange={handlePermissionChange} />
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 1 ? null : 1)}
          className={`p-3 rounded-lg text-sm font-medium ${activeQuadrant === 1 ? 'bg-red-600' : 'bg-[#1e1e1e]'} hover:bg-red-600 relative transition-colors duration-300 h-20 cursor-pointer shadow`}
        >
          <span className="block font-bold text-sm">ทำทันที</span>
          <span className="text-xs text-gray-300">สำคัญ + เร่งด่วน</span>
          <span className="text-xs absolute bottom-2 right-3 bg-[#00000040] px-2 py-0.5 rounded-full">{getQuadrantTodos(1).length}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('high');
              setNewUrgency('high');
              setActiveQuadrant(1);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 2 ? null : 2)}
          className={`p-3 rounded-lg text-sm font-medium ${activeQuadrant === 2 ? 'bg-[#ff6100]' : 'bg-[#1e1e1e]'} hover:bg-[#ff6100] relative transition-colors duration-300 h-20 cursor-pointer shadow`}
        >
          <span className="block font-bold text-sm">วางแผนทำ</span>
          <span className="text-xs text-gray-300">สำคัญ + ไม่เร่งด่วน</span>
          <span className="text-xs absolute bottom-2 right-3 bg-[#00000040] px-2 py-0.5 rounded-full">{getQuadrantTodos(2).length}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('high');
              setNewUrgency('low');
              setActiveQuadrant(2);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-[#ff884d] transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 3 ? null : 3)}
          className={`p-3 rounded-lg text-sm font-medium ${activeQuadrant === 3 ? 'bg-yellow-500' : 'bg-[#1e1e1e]'} hover:bg-yellow-500 relative transition-colors duration-300 h-20 cursor-pointer shadow`}
        >
          <span className="block font-bold text-sm">มอบหมาย</span>
          <span className="text-xs text-gray-300">ไม่สำคัญ + เร่งด่วน</span>
          <span className="text-xs absolute bottom-2 right-3 bg-[#00000040] px-2 py-0.5 rounded-full">{getQuadrantTodos(3).length}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('low');
              setNewUrgency('high');
              setActiveQuadrant(3);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 4 ? null : 4)}
          className={`p-3 rounded-lg text-sm font-medium ${activeQuadrant === 4 ? 'bg-green-500' : 'bg-[#1e1e1e]'} hover:bg-green-500 relative transition-colors duration-300 h-20 cursor-pointer shadow`}
        >
          <span className="block font-bold text-sm">ตัดทิ้ง</span>
          <span className="text-xs text-gray-300">ไม่สำคัญ + ไม่เร่งด่วน</span>
          <span className="text-xs absolute bottom-2 right-3 bg-[#00000040] px-2 py-0.5 rounded-full">{getQuadrantTodos(4).length}</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('low');
              setNewUrgency('low');
              setActiveQuadrant(4);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-6 h-6 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-sm">+</span>
          </button>
        </div>
      </div>
      
      {/* แสดง Form เพิ่ม Todo ง่ายๆ */}
      <div className="mb-4">
        <div className="flex items-center gap-2 bg-[#1e1e1e] p-3 rounded-lg shadow">
          <input
            type="text"
            name="todoText"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="เพิ่มรายการใหม่..."
            className="flex-1 p-2 rounded-lg bg-[#2d2d2d] border-none outline-none text-white text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (newTodo.trim() !== '' ? setShowAddModal(true) : null)}
          />
          <button
            onClick={() => newTodo.trim() !== '' ? setShowAddModal(true) : null}
            className="bg-[#ff6100] text-white p-2 rounded-lg flex-shrink-0 w-10 h-10 flex items-center justify-center shadow"
            title="เพิ่มรายการ"
          >
            <span className="text-xl">+</span>
          </button>
        </div>
      </div>
        
      {/* แสดงรายการ Todo */}
      <div className="bg-[#1e1e1e] rounded-lg shadow overflow-hidden">
        <div className="p-2 flex justify-between items-center border-b border-[#2d2d2d]">
          <h2 className="text-lg font-bold text-white flex items-center">
            {activeQuadrant === 1 ? "ทำทันที" : 
             activeQuadrant === 2 ? "วางแผนทำ" : 
             activeQuadrant === 3 ? "มอบหมาย" : 
             activeQuadrant === 4 ? "ตัดทิ้ง" : "รายการทั้งหมด"}
            <span className="ml-2 text-xs text-gray-400">
              ({activeQuadrant ? getQuadrantTodos(activeQuadrant).length : todos.length})
            </span>
          </h2>
          
          {completedTasks > 0 && (
            <button
              onClick={clearCompleted}
              className="text-[#ff6100] hover:text-[#ff884d] text-xs bg-[#262626] p-1.5 rounded"
            >
              ลบที่เสร็จแล้ว
            </button>
          )}
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto hide-scrollbar p-2">
          {activeQuadrant ? (
            getQuadrantTodos(activeQuadrant).length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <p>ไม่มีรายการในหมวดนี้</p>
              </div>
            ) : (
              getFilteredTodos().map(todo => (
                <div key={todo.id} className="animate-fade-in">
                  <TodoItem
                    id={todo.id}
                    text={todo.text}
                    completed={todo.completed}
                    importance={todo.importance}
                    urgency={todo.urgency}
                    dueDate={todo.dueDate}
                    reminderDate={todo.reminderDate}
                    categories={todo.categories}
                    tags={todo.tags}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                    quadrant={activeQuadrant}
                  />
                </div>
              ))
            )
          ) : (
            todos.length === 0 ? (
              <div className="text-center text-gray-400 py-10">
                <p>ไม่มีรายการที่ต้องทำ</p>
              </div>
            ) : (
              todos.map(todo => (
                <div key={todo.id} className="animate-fade-in">
                  <TodoItem
                    id={todo.id}
                    text={todo.text}
                    completed={todo.completed}
                    importance={todo.importance}
                    urgency={todo.urgency}
                    dueDate={todo.dueDate}
                    reminderDate={todo.reminderDate}
                    categories={todo.categories}
                    tags={todo.tags}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onEdit={editTodo}
                    quadrant={
                      todo.importance === 'high' && todo.urgency === 'high' ? 1 :
                      todo.importance === 'high' && todo.urgency === 'low' ? 2 :
                      todo.importance === 'low' && todo.urgency === 'high' ? 3 : 4
                    }
                  />
                </div>
              ))
            )
          )}
        </div>
      </div>
      
      {/* ปุ่มเพิ่มรายการลอยด้านล่าง */}
      <button 
        onClick={() => {
          const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="fixed bottom-4 right-4 w-14 h-14 bg-[#ff6100] text-white text-2xl rounded-full shadow-lg flex items-center justify-center z-10 md:hidden"
      >
        +
      </button>
      
      {/* แสดงการตั้งค่าเพิ่มเติมเมื่อกดปุ่ม */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 z-20 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#1e1e1e] rounded-lg p-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-3 text-white">กำหนดค่าเพิ่มเติม</h3>
            
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">รายละเอียด:</div>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="รายละเอียดงาน..."
                className="w-full p-2 mb-2 bg-[#2d2d2d] text-white text-sm rounded border-none"
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">ความสำคัญ/เร่งด่วน:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('high'); }}
                  className={`p-2 text-sm rounded-lg ${newImportance === 'high' && newUrgency === 'high' ? 'bg-red-600' : 'bg-[#2d2d2d]'}`}
                >
                  <div className="font-bold">ทำทันที</div>
                  <div className="text-xs opacity-70">สำคัญ+เร่งด่วน</div>
                </button>
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('low'); }}
                  className={`p-2 text-sm rounded-lg ${newImportance === 'high' && newUrgency === 'low' ? 'bg-[#ff6100]' : 'bg-[#2d2d2d]'}`}
                >
                  <div className="font-bold">วางแผนทำ</div>
                  <div className="text-xs opacity-70">สำคัญ+ไม่เร่งด่วน</div>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('high'); }}
                  className={`p-2 text-sm rounded-lg ${newImportance === 'low' && newUrgency === 'high' ? 'bg-yellow-500' : 'bg-[#2d2d2d]'}`}
                >
                  <div className="font-bold">มอบหมาย</div>
                  <div className="text-xs opacity-70">ไม่สำคัญ+เร่งด่วน</div>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('low'); }}
                  className={`p-2 text-sm rounded-lg ${newImportance === 'low' && newUrgency === 'low' ? 'bg-green-500' : 'bg-[#2d2d2d]'}`}
                >
                  <div className="font-bold">ตัดทิ้ง</div>
                  <div className="text-xs opacity-70">ไม่สำคัญ+ไม่เร่งด่วน</div>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">หมวดหมู่:</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.map((category) => {
                  if (typeof category !== 'string') return null;
                  return (
                    <button
                      key={category}
                      onClick={() => setNewCategories(
                        newCategories.includes(category)
                          ? newCategories.filter(c => c !== category)
                          : [...newCategories, category]
                      )}
                      className={`px-2 py-1 text-xs rounded-full ${
                        newCategories.includes(category)
                          ? 'bg-[#ff6100] text-white'
                          : 'bg-[#2d2d2d] text-gray-300'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-gray-300 mb-2">กำหนดเวลา:</div>
              <input 
                type="datetime-local" 
                value={newDueDate || ''} 
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full p-2 mb-2 bg-[#2d2d2d] text-white text-sm rounded-lg border-none"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-[#2d2d2d] text-white rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  addTodo();
                  setShowAddModal(false);
                }}
                className="px-4 py-2 bg-[#ff6100] text-white rounded-lg"
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