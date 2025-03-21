'use client';

import { useState, useEffect, useMemo } from 'react';
import TodoItem from './TodoItem';
import Header from './Header';
import NotificationManager from './NotificationManager';
import TaskStatistics from './TaskStatistics';
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
  timeSpent?: number;         // เวลาที่ใช้ไปในหน่วยวินาที
  pomodoroSessions?: number;  // จำนวนเซสชัน Pomodoro ที่ใช้
  efficiency?: number;        // คะแนนประสิทธิภาพ (1-10)
  lastPomodoroDate?: string;  // วันที่ทำ Pomodoro ล่าสุด
  parentId?: number;          // เพิ่มสำหรับระบุว่าเป็นงานย่อยของงานไหน
  subtasks?: number[];        // เพิ่มเพื่อเก็บ id ของงานย่อย
  priority?: number;          // ลำดับความสำคัญของงาน (1-5)
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
  const [newPriority, setNewPriority] = useState<number>(3); // ค่าเริ่มต้นที่ 3 (ปานกลาง)
  const [categories, setCategories] = useState<string[]>(['งานส่วนตัว', 'งานบ้าน', 'การเรียน', 'งานอื่นๆ']);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeQuadrant, setActiveQuadrant] = useState<number>(0); // 0 = ทั้งหมด, 1-4 = quadrants
  const [isLoading, setIsLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'completed', 'active'

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
      isAllDay: newIsAllDay,
      priority: newPriority
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

  const editTodo = (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[], startTime?: string, endTime?: string, isAllDay?: boolean, timeSpent?: number, pomodoroSessions?: number, efficiency?: number, lastPomodoroDate?: string) => {
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
    
    if (activeQuadrant > 0) {
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

  // ให้คะแนนประสิทธิภาพ
  const rateEfficiency = (todoId: number, efficiency: number) => {
    editTodo(
      todoId,
      todos.find(todo => todo.id === todoId)?.text || '',
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      efficiency
    );
  };

  // คำนวณเวลาที่ใช้ในแต่ละหมวดหมู่
  const getCategoryTimes = () => {
    const categoryTimes: Record<string, number> = {};
    
    todos.forEach(todo => {
      if (todo.timeSpent && todo.timeSpent > 0) {
        todo.categories.forEach(category => {
          if (!categoryTimes[category]) {
            categoryTimes[category] = 0;
          }
          // กระจายเวลาตามจำนวนหมวดหมู่
          categoryTimes[category] += (todo.timeSpent || 0) / todo.categories.length;
        });
      }
    });
    
    return categoryTimes;
  };

  // คำนวณประสิทธิภาพเฉลี่ย
  const getAverageEfficiency = () => {
    const todosWithEfficiency = todos.filter(todo => todo.efficiency !== undefined);
    if (todosWithEfficiency.length === 0) return 0;
    
    const sum = todosWithEfficiency.reduce((acc, todo) => acc + (todo.efficiency || 0), 0);
    return sum / todosWithEfficiency.length;
  };

  // เพิ่มฟังก์ชันสำหรับการจัดการงานย่อย
  const addSubtask = (parentId: number) => {
    const parent = todos.find(todo => todo.id === parentId);
    if (!parent) return;
    
    const newId = Math.max(0, ...todos.map(t => t.id)) + 1;
    const newSubtask: Todo = {
      id: newId,
      text: 'งานย่อยใหม่',
      completed: false,
      importance: parent.importance,
      urgency: parent.urgency,
      categories: [...parent.categories],
      tags: [...parent.tags],
      parentId: parentId,
      subtasks: [],
      priority: parent.priority
    };
    
    // อัปเดตรายการงานและเพิ่ม ID ของงานย่อยในงานหลัก
    const updatedTodos = todos.map(todo => {
      if (todo.id === parentId) {
        return {
          ...todo,
          subtasks: [...(todo.subtasks || []), newId]
        };
      }
      return todo;
    });
    
    setTodos([...updatedTodos, newSubtask]);
    localStorage.setItem('todos', JSON.stringify([...updatedTodos, newSubtask]));
  };

  const deleteSubtask = (id: number) => {
    const subtask = todos.find(todo => todo.id === id);
    if (!subtask || !subtask.parentId) return;
    
    // อัปเดตรายการงานย่อยในงานหลัก
    const updatedTodos = todos.map(todo => {
      if (todo.id === subtask.parentId) {
        return {
          ...todo,
          subtasks: (todo.subtasks || []).filter(subId => subId !== id)
        };
      }
      return todo;
    }).filter(todo => todo.id !== id); // ลบงานย่อย
    
    setTodos(updatedTodos);
    localStorage.setItem('todos', JSON.stringify(updatedTodos));
  };

  // การกรองรายการตามแท็บที่เลือก
  const filteredTodos = useMemo(() => {
    let filtered = [...todos];
    
    // กรองตามสถานะ (ทั้งหมด, เสร็จแล้ว, ยังไม่เสร็จ)
    if (activeTab === 'completed') {
      filtered = filtered.filter(todo => todo.completed);
    } else if (activeTab === 'active') {
      filtered = filtered.filter(todo => !todo.completed);
    }
    
    // กรองตามหมวดหมู่งาน (quadrants)
    if (activeQuadrant > 0) {
      filtered = filtered.filter(todo => {
        if (activeQuadrant === 1) return todo.importance === 'high' && todo.urgency === 'high';
        if (activeQuadrant === 2) return todo.importance === 'high' && todo.urgency === 'low';
        if (activeQuadrant === 3) return todo.importance === 'low' && todo.urgency === 'high';
        if (activeQuadrant === 4) return todo.importance === 'low' && todo.urgency === 'low';
        return true;
      });
    }
    
    // เรียงลำดับตามความสำคัญ (ถ้ามี)
    filtered.sort((a, b) => {
      // เรียงตามลำดับความสำคัญก่อน (ถ้ามี)
      if (a.priority && b.priority && a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      
      // ถ้าไม่มีลำดับความสำคัญหรือเท่ากัน ให้เรียงตามวันที่กำหนด
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      // ถ้าไม่มีวันที่กำหนด ให้เรียงตามสถานะเสร็จสิ้น
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      
      return 0;
    });
    
    return filtered;
  }, [todos, activeTab, activeQuadrant]);

  // ปุ่มแท็บสำหรับกรองรายการ
  const renderFilterTabs = () => {
    return (
      <div className="flex items-center mb-6 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${
            activeTab === 'all' ? 'bg-[#ff6100] text-white' : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
        >
          ทั้งหมด
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${
            activeTab === 'active' ? 'bg-[#ff6100] text-white' : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
        >
          ยังไม่เสร็จ
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3 py-2 rounded-md mr-2 text-sm font-medium transition-colors ${
            activeTab === 'completed' ? 'bg-[#ff6100] text-white' : 'bg-[#232323] text-gray-300 hover:bg-[#2a2a2a]'
          }`}
        >
          เสร็จแล้ว
        </button>
        
        <div className="ml-auto flex items-center">
          <select
            value={activeQuadrant || 0}
            onChange={(e) => setActiveQuadrant(parseInt(e.target.value))}
            className="bg-[#232323] text-gray-300 text-sm rounded-md border-gray-700 focus:border-[#ff6100] focus:ring-[#ff6100] block py-2 px-3"
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
  };

  // ส่วนแสดงผลหลัก
  return (
    <div className="todo-app bg-[#151515] rounded-xl border border-[#262626] shadow-lg overflow-hidden relative">
      <div className="mb-4 pt-3">
        <Header />
      </div>
      
      {/* Component สำหรับการจัดการการแจ้งเตือน */}
      <NotificationManager onPermissionChange={handlePermissionChange} />
      
      {/* ปุ่มไปยังหน้า Calendar View */}
      <div className="mb-4 flex justify-end">
        <a 
          href="/calendar" 
          className="flex items-center gap-1 bg-[#2d2d2d] text-white px-3.5 py-2 rounded-full text-sm hover:bg-[#3d3d3d] transition-all duration-200 shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>ปฏิทินงาน</span>
        </a>
      </div>
      
      {/* แถบแสดงสถานะและตัวเลือก */}
      <div className="mb-2 px-3 pb-2 border-b border-[#262626] flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          {activeQuadrant === 1 && <span className="text-xl floating-animation">🔥</span>}
          {activeQuadrant === 2 && <span className="text-xl floating-animation">📋</span>}
          {activeQuadrant === 3 && <span className="text-xl floating-animation">⏰</span>}
          {activeQuadrant === 4 && <span className="text-xl floating-animation">🍃</span>}
          <h2 className={`text-lg font-bold ${activeQuadrant > 0 ? 'text-gradient' : 'text-white'}`}>
            {activeQuadrant === 1 ? "ทำทันที" :
             activeQuadrant === 2 ? "วางแผนทำ" :
             activeQuadrant === 3 ? "มอบหมาย" :
             activeQuadrant === 4 ? "ตัดทิ้ง" : "รายการทั้งหมด"}
            &nbsp;
            ({activeQuadrant > 0 ? getQuadrantTodos(activeQuadrant).length : todos.length})
          </h2>
        </div>
        
        {completedTasks > 0 && (
          <button
            onClick={clearCompleted}
            className="badge-modern !bg-[#262626] hover:!bg-[#3d3d3d] flex items-center gap-1 transition-colors"
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
        {activeQuadrant > 0 ? (
          getQuadrantTodos(activeQuadrant).length === 0 ? (
            <div className="text-center text-gray-400 py-10 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-3 floating-animation" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mb-2">ไม่มีรายการในหมวดนี้</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-3 gradient-text text-sm flex items-center gap-1"
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
                  tags={todo.tags}
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
                          tags={subtask.tags}
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
          )
        ) : (
          todos.length === 0 ? (
            <div className="text-center text-gray-400 py-12 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4 floating-animation" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="mb-2 text-gradient font-medium">ยังไม่มีรายการที่ต้องทำ</p>
              <p className="text-xs text-gray-500 mb-3">เริ่มเพิ่มรายการแรกของคุณได้เลย</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="btn-modern text-sm flex items-center gap-1.5 py-2.5 px-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มรายการแรก
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
                  tags={todo.tags}
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
                          tags={subtask.tags}
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
          )
        )}
      </div>
      
      {/* ปุ่มเพิ่มรายการลอยด้านล่าง */}
      <button 
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 gradient-bg text-white rounded-full shadow-lg flex items-center justify-center z-10 md:hidden hover:bg-[#ff7a30] transition-colors glow-effect pulse-animation"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
      
      {/* แสดงการตั้งค่าเพิ่มเติมเมื่อกดปุ่ม - Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div 
            className="glassmorphism rounded-xl p-5 w-full max-w-md border border-[#3d3d3d] shadow-xl popup-effect max-h-[90vh] overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-4 text-gradient flex items-center gap-2 sticky top-0 bg-[#1e1e1e] py-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              เพิ่มรายการใหม่
              <button 
                onClick={() => setShowAddModal(false)}
                className="ml-auto text-gray-400 hover:text-white"
                aria-label="ปิด"
              >
                ✕
              </button>
            </h3>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">รายละเอียด</label>
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="รายละเอียดงาน..."
                className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">ลำดับความสำคัญ</label>
              <div className="flex items-center justify-between px-2">
                <span className="text-xs text-gray-400">ต่ำ</span>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => setNewPriority(value)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        newPriority === value 
                          ? 'bg-gradient-to-br from-[#ff6100] to-[#ff8f4d] text-white' 
                          : 'bg-[#2d2d2d] text-gray-300'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-gray-400">สูง</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">ประเภทงาน</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('high'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'high' && newUrgency === 'high' ? 'gradient-bg text-white border border-red-500' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
                >
                  <span className="text-lg floating-animation">🔥</span>
                  <span>ทำทันที</span>
                </button>
                <button
                  onClick={() => { setNewImportance('high'); setNewUrgency('low'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'high' && newUrgency === 'low' ? 'gradient-bg text-white border border-[#ff6100]' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
                >
                  <span className="text-lg floating-animation">📋</span>
                  <span>วางแผนทำ</span>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('high'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'low' && newUrgency === 'high' ? 'gradient-bg text-white border border-yellow-500' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
                >
                  <span className="text-lg floating-animation">⏰</span>
                  <span>มอบหมาย</span>
                </button>
                <button
                  onClick={() => { setNewImportance('low'); setNewUrgency('low'); }}
                  className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-1.5 transition-colors ${newImportance === 'low' && newUrgency === 'low' ? 'gradient-bg text-white border border-green-500' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
                >
                  <span className="text-lg floating-animation">🍃</span>
                  <span>ตัดทิ้ง</span>
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 block mb-2">หมวดหมู่</label>
              <div className="flex flex-wrap gap-1.5 mb-3">
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
                      className={`badge-modern ${
                        newCategories.includes(category)
                          ? '!bg-[#ff6100] text-white'
                          : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-300 block mb-2">
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  กำหนดเวลา
                </div>
              </label>
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
                  className="checkbox-custom"
                />
                <label htmlFor="all-day-new" className="text-sm text-gray-300">ทั้งวัน</label>
              </div>
              
              {!newIsAllDay && newDueDate && (
                <div className="grid grid-cols-2 gap-3">
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
            
            <div className="flex justify-between mt-6 mb-2 sticky bottom-0 bg-[#1e1e1e] py-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewTodo('');
                  setNewDueDate(undefined);
                  setNewReminderDate(undefined);
                  setNewCategories([]);
                  setNewTags([]);
                }}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors focus:ring-2 focus:ring-gray-600"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => {
                  if (newTodo.trim() !== '') {
                    addTodo();
                    setShowAddModal(false);
                  }
                }}
                className={`px-5 py-2.5 bg-[#ff6100] hover:bg-[#ff7a30] text-white rounded-lg transition-colors focus:ring-2 focus:ring-[#ff6100]/50 ${
                  newTodo.trim() === '' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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