'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';

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
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  completed: boolean;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  isAllDay?: boolean;
  categories: string[];
}

export default function CalendarView() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // วันในสัปดาห์ภาษาไทย
  const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  // เดือนภาษาไทย
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // โหลดข้อมูล todos จาก localStorage เมื่อคอมโพเนนต์โหลด
  useEffect(() => {
    setIsLoading(true);
    
    // จำลองการโหลดข้อมูลช้าๆ
    setTimeout(() => {
      const savedTodos = localStorage.getItem('todos');
      
      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos);
          setTodos(parsedTodos);
          
          // แปลง todos ที่มี dueDate เป็น events สำหรับปฏิทิน
          const calendarEvents = parsedTodos
            .filter((todo: Todo) => todo.dueDate)
            .map((todo: Todo) => {
              const start = new Date(todo.dueDate!);
              // ถ้าไม่มี endTime ให้กำหนดเวลาสิ้นสุดเป็น 1 ชั่วโมงหลังจากเวลาเริ่มต้น
              const end = todo.endTime ? new Date(todo.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
              
              return {
                id: todo.id,
                title: todo.text,
                start,
                end,
                completed: todo.completed,
                importance: todo.importance,
                urgency: todo.urgency,
                isAllDay: todo.isAllDay || false,
                categories: todo.categories
              };
            });
          
          setEvents(calendarEvents);
        } catch (error) {
          console.error('Error parsing saved todos:', error);
          setTodos([]);
          setEvents([]);
        }
      }
      
      setIsLoading(false);
    }, 800);
  }, []);

  // สร้างอาร์เรย์ของวันที่ในเดือนปัจจุบัน
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // วันแรกของเดือน
    const firstDay = new Date(year, month, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 = อาทิตย์, 1 = จันทร์, ...
    
    // วันสุดท้ายของเดือน
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // สร้างอาร์เรย์วันที่ โดยเริ่มต้นด้วยวันว่างสำหรับวันก่อนวันที่ 1 ของเดือน
    const days = Array(firstDayOfWeek).fill(null);
    
    // เพิ่มวันที่ของเดือนปัจจุบัน
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  // ไปยังเดือนก่อนหน้า
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // ไปยังเดือนถัดไป
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // ตรวจสอบว่ามี event ในวันนี้หรือไม่
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // ย้อนกลับไปยังหน้าหลัก
  const goToHome = () => {
    router.push('/');
  };
  
  // ฟังก์ชันให้สีของ event ตามความสำคัญและความเร่งด่วน
  const getEventColor = (importance: 'high' | 'low', urgency: 'high' | 'low', completed: boolean) => {
    if (completed) return 'bg-gray-600';
    
    if (importance === 'high' && urgency === 'high') return 'bg-red-500';
    if (importance === 'high' && urgency === 'low') return 'bg-[#ff6100]';
    if (importance === 'low' && urgency === 'high') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // ตรวจสอบว่าวันที่ที่กำหนดมี event หรือไม่
  const hasEvents = (date: Date) => {
    return events.some(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // สร้างแถว 7 วันสำหรับปฏิทิน
  const renderCalendarWeeks = () => {
    const days = getDaysInMonth();
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks;
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 pb-20">
      <div className="mb-4">
        <Header />
      </div>
      
      <div className="flex justify-between items-center my-6">
        <button onClick={goToHome} className="bg-[#1e1e1e] text-white p-2 rounded">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">ปฏิทินงาน</h1>
        <div className="w-8"></div> {/* Spacer */}
      </div>
      
      {/* ปฏิทิน */}
      <div className="bg-[#1e1e1e] rounded-lg shadow overflow-hidden">
        {/* ส่วนหัวปฏิทิน */}
        <div className="flex justify-between items-center p-4 border-b border-[#2d2d2d]">
          <button onClick={goToPreviousMonth} className="p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-lg font-bold">
            {thaiMonths[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
          </h2>
          <button onClick={goToNextMonth} className="p-2 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* วันในสัปดาห์ */}
        <div className="grid grid-cols-7 bg-[#262626] text-center">
          {thaiDays.map((day, index) => (
            <div key={index} className="py-2 text-sm font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* วันในเดือน */}
        <div className="grid grid-cols-7">
          {renderCalendarWeeks().map((week, weekIndex) => (
            <>
              {week.map((day, dayIndex) => {
                if (!day) return <div key={`empty-${dayIndex}`} className="p-2 border-t border-[#2d2d2d] min-h-[60px]"></div>;
                
                const isToday = new Date().toDateString() === day.toDateString();
                const hasEventsForDay = hasEvents(day);
                const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                
                return (
                  <div 
                    key={day.toDateString()} 
                    className={`p-1 border-t border-[#2d2d2d] min-h-[60px] cursor-pointer
                      ${isToday ? 'bg-[#2d2d2d]' : ''}
                      ${isSelected ? 'bg-[#3d3d3d]' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="relative">
                      <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-[#ff6100]' : ''}`}>
                        {day.getDate()}
                      </div>
                      {hasEventsForDay && (
                        <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#ff6100]"></div>
                      )}
                      {/* แสดงเฉพาะ event แรก (ถ้ามี) */}
                      {getEventsForDate(day).slice(0, 1).map(event => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-0.5 rounded truncate mb-0.5 ${getEventColor(event.importance, event.urgency, event.completed)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {getEventsForDate(day).length > 1 && (
                        <div className="text-xs text-gray-400">+{getEventsForDate(day).length - 1} อื่นๆ</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      
      {/* แสดงรายละเอียดของวันที่เลือก */}
      {selectedDate && (
        <div className="mt-4 bg-[#1e1e1e] rounded-lg shadow p-3">
          <h3 className="text-lg font-bold mb-2">
            {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
          </h3>
          
          {getEventsForDate(selectedDate).length === 0 ? (
            <div className="text-gray-400 text-center py-4">ไม่มีรายการในวันนี้</div>
          ) : (
            <div className="space-y-2">
              {getEventsForDate(selectedDate).map(event => (
                <div 
                  key={event.id} 
                  className={`p-2 rounded-lg ${getEventColor(event.importance, event.urgency, event.completed)} bg-opacity-20 border-l-4 ${getEventColor(event.importance, event.urgency, event.completed)}`}
                >
                  <div className={`font-medium ${event.completed ? 'line-through text-gray-400' : ''}`}>{event.title}</div>
                  <div className="text-xs flex justify-between mt-1">
                    <div>
                      {event.isAllDay ? 'ทั้งวัน' : `${event.start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} - ${event.end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                    {event.categories.length > 0 && (
                      <div className="text-xs opacity-70">{event.categories[0]}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* ปุ่มลอยด้านล่างเพื่อไปยังหน้าหลัก */}
      <button 
        onClick={goToHome}
        className="fixed bottom-4 right-4 w-14 h-14 bg-[#ff6100] text-white rounded-full shadow-lg flex items-center justify-center z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  );
} 