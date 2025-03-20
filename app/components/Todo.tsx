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
    <div className="w-full">
      <div className="mb-8">
        <Header />
      </div>
      
      {/* Component สำหรับการจัดการการแจ้งเตือน */}
      <NotificationManager onPermissionChange={handlePermissionChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 1 ? null : 1)}
          className={`p-4 rounded-lg text-sm font-medium ${activeQuadrant === 1 ? 'bg-red-600' : 'bg-[#1e1e1e]'} hover:bg-red-600 hover-pulse relative transition-colors duration-300 h-28 cursor-pointer`}
        >
          <span className="block font-bold text-lg">ทำทันที</span>
          <span className="text-sm text-gray-300">สำคัญ + เร่งด่วน</span>
          <span className="text-xs block mt-2 bg-[#00000040] py-0.5 rounded-full">{getQuadrantTodos(1).length} รายการ</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('high');
              setNewUrgency('high');
              setActiveQuadrant(1);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-base">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 2 ? null : 2)}
          className={`p-4 rounded-lg text-sm font-medium ${activeQuadrant === 2 ? 'bg-[#ff6100]' : 'bg-[#1e1e1e]'} hover:bg-[#ff6100] hover-pulse relative transition-colors duration-300 h-28 cursor-pointer`}
        >
          <span className="block font-bold text-lg">วางแผนทำ</span>
          <span className="text-sm text-gray-300">สำคัญ + ไม่เร่งด่วน</span>
          <span className="text-xs block mt-2 bg-[#00000040] py-0.5 rounded-full">{getQuadrantTodos(2).length} รายการ</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('high');
              setNewUrgency('low');
              setActiveQuadrant(2);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-[#ff884d] transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-base">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 3 ? null : 3)}
          className={`p-4 rounded-lg text-sm font-medium ${activeQuadrant === 3 ? 'bg-yellow-500' : 'bg-[#1e1e1e]'} hover:bg-yellow-500 hover-pulse relative transition-colors duration-300 h-28 cursor-pointer`}
        >
          <span className="block font-bold text-lg">มอบหมาย</span>
          <span className="text-sm text-gray-300">ไม่สำคัญ + เร่งด่วน</span>
          <span className="text-xs block mt-2 bg-[#00000040] py-0.5 rounded-full">{getQuadrantTodos(3).length} รายการ</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('low');
              setNewUrgency('high');
              setActiveQuadrant(3);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-yellow-400 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-base">+</span>
          </button>
        </div>
        <div
          onClick={() => setActiveQuadrant(activeQuadrant === 4 ? null : 4)}
          className={`p-4 rounded-lg text-sm font-medium ${activeQuadrant === 4 ? 'bg-green-500' : 'bg-[#1e1e1e]'} hover:bg-green-500 hover-pulse relative transition-colors duration-300 h-28 cursor-pointer`}
        >
          <span className="block font-bold text-lg">ตัดทิ้ง</span>
          <span className="text-sm text-gray-300">ไม่สำคัญ + ไม่เร่งด่วน</span>
          <span className="text-xs block mt-2 bg-[#00000040] py-0.5 rounded-full">{getQuadrantTodos(4).length} รายการ</span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewImportance('low');
              setNewUrgency('low');
              setActiveQuadrant(4);
              const input = document.querySelector('input[name="todoText"]') as HTMLInputElement;
              if (input) input.focus();
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-[#00000040] rounded-full flex items-center justify-center hover:bg-green-400 transition-colors"
            title="เพิ่มรายการใหม่ในหมวดนี้"
          >
            <span className="text-base">+</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* แสดงรายการ Todo */}
          <div className="bg-[#121212] rounded-lg shadow-lg overflow-hidden">
            <div className="space-y-2 px-4 py-4 max-h-[65vh] overflow-y-auto hide-scrollbar">
              {activeQuadrant ? (
                getQuadrantTodos(activeQuadrant).length === 0 ? (
                  <div className="text-center text-gray-400 py-12 bg-[#1e1e1e] rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="mb-2 text-lg">ไม่มีรายการในหมวดนี้</p>
                    <p className="text-sm">คลิกที่ปุ่ม + เพื่อเพิ่มรายการใหม่</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-4 text-[#ff6100] sticky top-0 bg-[#121212] py-2 z-10 flex items-center border-b border-[#2d2d2d] pb-3">
                      {activeQuadrant === 1 ? (
                        <>
                          <span className="bg-red-600 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                          ทำทันที
                        </>
                      ) : activeQuadrant === 2 ? (
                        <>
                          <span className="bg-[#ff6100] w-3 h-3 inline-block mr-2 rounded-sm"></span>
                          วางแผนทำ
                        </>
                      ) : activeQuadrant === 3 ? (
                        <>
                          <span className="bg-yellow-500 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                          มอบหมาย
                        </>
                      ) : (
                        <>
                          <span className="bg-green-500 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                          ตัดทิ้ง
                        </>
                      )}
                      <span className="ml-2 text-sm text-gray-400 font-normal">({getQuadrantTodos(activeQuadrant).length} รายการ)</span>
                    </h2>
                    {getQuadrantTodos(activeQuadrant).map(todo => (
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
                    ))}
                  </>
                )
              ) : (
                todos.length === 0 ? (
                  <div className="text-center text-gray-400 py-16 bg-[#1e1e1e] rounded-lg animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="mb-2 text-xl">ไม่มีรายการที่ต้องทำ</p>
                    <p className="text-base">เริ่มเพิ่มรายการแรกของคุณกันเลย!</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#121212] py-2 z-10 border-b border-[#2d2d2d] pb-3">
                      <h2 className="text-xl font-bold text-[#ff6100] flex items-center">
                        รายการทั้งหมด
                        <span className="ml-2 text-sm text-gray-400 font-normal">({todos.length} รายการ)</span>
                      </h2>
                      
                      {completedTasks > 0 && (
                        <button
                          onClick={clearCompleted}
                          className="text-[#ff6100] hover:text-[#ff884d] font-medium text-xs bg-[#1e1e1e] p-2 rounded-lg transition-colors duration-200"
                        >
                          ลบรายการที่เสร็จแล้ว ({completedTasks})
                        </button>
                      )}
                    </div>
                    {todos.map(todo => (
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
                    ))}
                  </>
                )
              )}
            </div>
          </div>
        </div>
        
        <div>
          {/* แสดง Form เพิ่ม Todo และข้อมูลความคืบหน้า */}
          <div className="bg-[#121212] rounded-lg shadow-lg p-4 mb-4">
            <h3 className="text-lg font-bold mb-3 text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              เพิ่มรายการใหม่
            </h3>
            
            <div className="flex flex-col space-y-3">
              <div className="relative">
                <input
                  type="text"
                  name="todoText"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="เพิ่มรายการใหม่..."
                  className="w-full p-3 rounded-lg bg-[#1e1e1e] border border-[#2d2d2d] focus:border-[#ff6100] outline-none transition-colors duration-200 placeholder-gray-500 mb-4"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-300 mb-2">ความสำคัญ:</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setNewImportance('high')}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors duration-200 flex-1 ${newImportance === 'high' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                    >
                      สำคัญ
                    </button>
                    <button
                      onClick={() => setNewImportance('low')}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors duration-200 flex-1 ${newImportance === 'low' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                    >
                      ไม่สำคัญ
                    </button>
                  </div>
                </div>
                
                <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-300 mb-2">ความเร่งด่วน:</div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setNewUrgency('high')}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors duration-200 flex-1 ${newUrgency === 'high' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                    >
                      เร่งด่วน
                    </button>
                    <button
                      onClick={() => setNewUrgency('low')}
                      className={`px-3 py-1.5 text-xs rounded-full transition-colors duration-200 flex-1 ${newUrgency === 'low' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                    >
                      ไม่เร่งด่วน
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg mb-4">
                <div className="text-sm font-medium text-gray-300 mb-2">หมวดหมู่:</div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    if (typeof category !== 'string') {
                      return null; // ข้ามรายการที่ไม่ใช่ string
                    }
                    return (
                      <button
                        key={category}
                        onClick={() => 
                          setNewCategories(
                            newCategories.includes(category)
                              ? newCategories.filter(c => c !== category)
                              : [...newCategories, category]
                          )
                        }
                        className={`px-2 py-1 text-xs rounded-full transition-colors duration-200 ${
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
              
              <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg mb-4">
                <div className="text-sm font-medium text-gray-300 mb-2">แท็ก:</div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    if (typeof tag !== 'string') {
                      return null; // ข้ามรายการที่ไม่ใช่ string
                    }
                    return (
                      <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={`px-2 py-1 text-xs rounded-full ${
                          activeTag === tag 
                            ? 'bg-[#ff6100] text-white' 
                            : 'bg-[#2d2d2d] text-gray-300'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    <span>กำหนดส่ง:</span>
                  </div>
                  <input 
                    type="datetime-local" 
                    value={newDueDate || ''} 
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full p-1.5 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#ff6100]"
                  />
                </div>
                
                <div className="bg-[#1e1e1e] border border-[#2d2d2d] p-3 rounded-lg">
                  <div className="text-sm font-medium text-gray-300 mb-2">
                    <span>แจ้งเตือน:</span>
                  </div>
                  <input 
                    type="datetime-local" 
                    value={newReminderDate || ''} 
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="w-full p-1.5 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#ff6100]"
                  />
                </div>
              </div>
              
              <button
                onClick={addTodo}
                className="bg-[#ff6100] text-white p-3 rounded-lg hover:bg-[#ff884d] transition-colors duration-300 font-medium hover-glow"
              >
                เพิ่มรายการ
              </button>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="bg-[#121212] rounded-lg p-5 border border-[#2d2d2d] mb-6">
            <h2 className="text-lg font-bold text-[#ff6100] mb-4">ความคืบหน้า</h2>
            
            <div className="flex items-center mb-2">
              <span className="text-sm text-gray-300 w-24">ความสำเร็จ:</span>
              <div className="w-full bg-[#2d2d2d] rounded-full h-4 relative overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#ff6100] to-red-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                >
                </div>
                <span className="absolute text-white text-xs font-medium top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {completionPercentage}%
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#2d2d2d]">
                <div className="text-gray-400 mb-1">รายการที่ต้องทำ</div>
                <div className="text-xl font-bold text-white">{pendingTasks}</div>
              </div>
              <div className="bg-[#1e1e1e] rounded-lg p-3 border border-[#2d2d2d]">
                <div className="text-gray-400 mb-1">ทำเสร็จแล้ว</div>
                <div className="text-xl font-bold text-white">{completedTasks}</div>
              </div>
            </div>
            
            {dueSoonTodos.length > 0 && (
              <div className="mt-4">
                <h3 className="text-base font-medium text-[#ff6100] mb-2">กำลังจะครบกำหนด:</h3>
                <div className="space-y-2">
                  {dueSoonTodos.slice(0, 3).map(todo => (
                    <div key={todo.id.toString()} className="flex items-center bg-[#1e1e1e] p-2 rounded border-l-4 border-yellow-500">
                      <div className="mr-2 text-base">{todo.quadrant === 1 ? '📌' : todo.quadrant === 2 ? '📝' : todo.quadrant === 3 ? '📢' : '⏭️'}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{todo.text}</div>
                        <div className="text-xs text-yellow-400">{todo.daysLeft === 0 ? 'วันนี้' : todo.daysLeft === 1 ? 'พรุ่งนี้' : `อีก ${todo.daysLeft} วัน`}</div>
                      </div>
                      <button 
                        onClick={() => {
                          const element = document.getElementById(`todo-${todo.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('highlight-pulse');
                            setTimeout(() => {
                              element.classList.remove('highlight-pulse');
                            }, 2000);
                          }
                        }}
                        className="ml-2 p-1 text-white bg-[#2d2d2d] rounded hover:bg-[#3d3d3d] text-xs"
                      >
                        ดู
                      </button>
                    </div>
                  ))}
                  
                  {dueSoonTodos.length > 3 && (
                    <div className="text-xs text-center text-gray-400 mt-1">
                      + อีก {dueSoonTodos.length - 3} รายการที่ใกล้ครบกำหนด
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ส่วนตัวกรองและการค้นหา */}
      <div className="bg-[#121212] rounded-lg p-4 mb-6 border border-[#2d2d2d]">
        <h2 className="text-lg font-bold text-[#ff6100] mb-3">ตัวกรอง</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">หมวดหมู่:</div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                if (typeof category !== 'string') {
                  return null; // ข้ามรายการที่ไม่ใช่ string
                }
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(activeCategory === category ? null : category)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      activeCategory === category 
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
          
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">แท็ก:</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                if (typeof tag !== 'string') {
                  return null; // ข้ามรายการที่ไม่ใช่ string
                }
                return (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-2 py-1 text-xs rounded-full ${
                      activeTag === tag 
                        ? 'bg-[#ff6100] text-white' 
                        : 'bg-[#2d2d2d] text-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-300 mb-2">รีเซ็ต:</div>
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveTag(null);
                setActiveQuadrant(null);
              }}
              className="px-3 py-1.5 text-xs bg-[#2d2d2d] text-white rounded-lg hover:bg-[#3d3d3d]"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-[#121212] p-6 rounded-lg shadow-lg mb-8 border border-[#2d2d2d]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">สิ่งที่ต้องทำ</h1>
          <p className="text-gray-400">จัดการงานของคุณด้วย Eisenhower Matrix</p>
        </div>

        <div className="bg-[#121212] rounded-lg overflow-hidden shadow-lg">
          <div className="p-6">
            {activeQuadrant ? (
              (
                <>
                  <h2 className="text-xl font-bold mb-4 text-[#ff6100] sticky top-0 bg-[#121212] py-2 z-10 flex items-center border-b border-[#2d2d2d] pb-3">
                    {activeQuadrant === 1 ? (
                      <>
                        <span className="bg-red-600 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                        ทำทันที
                      </>
                    ) : activeQuadrant === 2 ? (
                      <>
                        <span className="bg-[#ff6100] w-3 h-3 inline-block mr-2 rounded-sm"></span>
                        วางแผนทำ
                      </>
                    ) : activeQuadrant === 3 ? (
                      <>
                        <span className="bg-yellow-500 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                        มอบหมาย
                      </>
                    ) : (
                      <>
                        <span className="bg-green-500 w-3 h-3 inline-block mr-2 rounded-sm"></span>
                        ตัดทิ้ง
                      </>
                    )}
                    <span className="ml-2 text-sm text-gray-400 font-normal">({getQuadrantTodos(activeQuadrant).length} รายการ)</span>
                  </h2>
                  {getFilteredTodos().map(todo => (
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
                  ))}
                </>
              )
            ) :
              (activeCategory || activeTag) ? (
                <>
                  <h2 className="text-xl font-bold mb-4 text-[#ff6100] sticky top-0 bg-[#121212] py-2 z-10 flex items-center border-b border-[#2d2d2d] pb-3">
                    {activeCategory && <span className="bg-[#ff6100] text-white px-2 py-0.5 text-sm rounded mr-2">{activeCategory}</span>}
                    {activeTag && <span className="bg-[#1f2937] text-blue-300 px-2 py-0.5 text-sm rounded mr-2">#{activeTag}</span>}
                    <span className="ml-2 text-sm text-gray-400 font-normal">({getFilteredTodos().length} รายการ)</span>
                  </h2>
                  {getFilteredTodos().map(todo => (
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
                  ))}
                </>
              ) :
              todos.length === 0 ? (
                <div className="text-center text-gray-400 py-16 bg-[#1e1e1e] rounded-lg animate-fade-in">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto mb-4 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p className="mb-2 text-xl">ไม่มีรายการที่ต้องทำ</p>
                  <p className="text-base">เริ่มเพิ่มรายการแรกของคุณกันเลย!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4 sticky top-0 bg-[#121212] py-2 z-10 border-b border-[#2d2d2d] pb-3">
                    <h2 className="text-xl font-bold text-[#ff6100] flex items-center">
                      รายการทั้งหมด
                      <span className="ml-2 text-sm text-gray-400 font-normal">({todos.length} รายการ)</span>
                    </h2>
                    
                    {completedTasks > 0 && (
                      <button
                        onClick={clearCompleted}
                        className="text-[#ff6100] hover:text-[#ff884d] font-medium text-xs bg-[#1e1e1e] p-2 rounded-lg transition-colors duration-200"
                      >
                        ลบรายการที่เสร็จแล้ว ({completedTasks})
                      </button>
                    )}
                  </div>
                  {todos.map(todo => (
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
                  ))}
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
} 