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
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newImportance, setNewImportance] = useState<'high' | 'low'>('high');
  const [newUrgency, setNewUrgency] = useState<'high' | 'low'>('high');
  const [newDueDate, setNewDueDate] = useState<string | undefined>(undefined);
  const [newReminderDate, setNewReminderDate] = useState<string | undefined>(undefined);
  const [activeQuadrant, setActiveQuadrant] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // โหลดข้อมูล todos จาก localStorage เมื่อ component โหลดครั้งแรก
  useEffect(() => {
    setIsLoading(true);
    
    // จำลองการโหลดข้อมูลช้าๆ เพื่อแสดง loading state
    setTimeout(() => {
      const savedTodos = localStorage.getItem('todos');
      if (savedTodos) {
        const parsedTodos = JSON.parse(savedTodos);
        setTodos(parsedTodos);
        
        // ตรวจสอบการแจ้งเตือนสำหรับรายการที่มีกำหนดการแจ้งเตือน
        parsedTodos.forEach((todo: Todo) => {
          if (todo.reminderDate && !todo.completed) {
            scheduleReminderNotification(todo);
          }
        });
      }
      setIsLoading(false);
    }, 800);
  }, []);

  // บันทึกข้อมูล todos ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, isLoading]);

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
      reminderDate: newReminderDate
    };
    
    setTodos([...todos, newItem]);
    setNewTodo('');
    setNewDueDate(undefined);
    setNewReminderDate(undefined);
    
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

  const editTodo = (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string) => {
    setTodos(
      todos.map(todo => {
        if (todo.id === id) {
          const updatedTodo = { 
            ...todo, 
            text: newText,
            importance: importance || todo.importance,
            urgency: urgency || todo.urgency,
            dueDate: dueDate !== undefined ? dueDate : todo.dueDate,
            reminderDate: reminderDate !== undefined ? reminderDate : todo.reminderDate
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
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="เพิ่มรายการใหม่..."
                  className="w-full p-3 pl-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6100] bg-[#1e1e1e] text-white placeholder-gray-400 border-[#2d2d2d]"
                />
                <div className="absolute right-3 top-3 text-xs font-medium text-gray-400">
                  {activeQuadrant === 1 ? "📌 ทำทันที" : 
                  activeQuadrant === 2 ? "📝 วางแผนทำ" : 
                  activeQuadrant === 3 ? "📢 มอบหมาย" : 
                  activeQuadrant === 4 ? "⏭️ ตัดทิ้ง" : ""}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
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
              
              <div className="grid grid-cols-2 gap-3">
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
          {todos.length > 0 && (
            <div className="bg-[#121212] rounded-lg shadow-lg p-4 mb-4">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                ความคืบหน้า
              </h3>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1e1e1e] p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-[#ff6100]">{completionPercentage}%</div>
                  <div className="text-sm text-gray-400">เสร็จสิ้น</div>
                </div>
                <div className="bg-[#1e1e1e] p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-white">{pendingTasks}</div>
                  <div className="text-sm text-gray-400">คงเหลือ</div>
                </div>
              </div>
              
              <div className="h-3 bg-[#2d2d2d] rounded-full overflow-hidden mb-3">
                <div 
                  className="h-3 bg-gradient-to-r from-[#ff6100] to-[#ff884d] rounded-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="mb-1 text-gray-400">ทำทันที</div>
                  <div className="font-bold">{getQuadrantTodos(1).length}</div>
                </div>
                <div>
                  <div className="mb-1 text-gray-400">วางแผนทำ</div>
                  <div className="font-bold">{getQuadrantTodos(2).length}</div>
                </div>
                <div>
                  <div className="mb-1 text-gray-400">มอบหมาย</div>
                  <div className="font-bold">{getQuadrantTodos(3).length}</div>
                </div>
                <div>
                  <div className="mb-1 text-gray-400">ตัดทิ้ง</div>
                  <div className="font-bold">{getQuadrantTodos(4).length}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Due Soon Section */}
          {dueSoonTodos.length > 0 && (
            <div className="bg-[#121212] rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-bold mb-3 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                กำลังจะครบกำหนด
              </h3>
              
              <div className="space-y-2">
                {dueSoonTodos.map(todo => (
                  <div key={todo.id} className="bg-[#1e1e1e] p-3 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${todo.daysLeft <= 1 ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{todo.text}</div>
                        <div className="text-xs text-gray-400">
                          {todo.daysLeft === 0 ? 'วันนี้' : 
                          todo.daysLeft < 0 ? `เลยกำหนด ${Math.abs(todo.daysLeft)} วัน` : 
                          `อีก ${todo.daysLeft} วัน`}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveQuadrant(todo.quadrant);
                        setTimeout(() => {
                          const element = document.getElementById(`todo-${todo.id}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            element.classList.add('highlight-todo');
                            setTimeout(() => {
                              element.classList.remove('highlight-todo');
                            }, 2000);
                          }
                        }, 100);
                      }}
                      className="text-xs bg-[#2d2d2d] hover:bg-[#3d3d3d] p-1.5 rounded transition-colors duration-200"
                    >
                      ดู
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 