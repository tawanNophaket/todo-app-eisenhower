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
              // ถ้ามี startTime ให้ตั้งเวลาเริ่มต้นตาม startTime
              if (todo.startTime && todo.dueDate) {
                const [hours, minutes] = todo.startTime.split(':').map(Number);
                start.setHours(hours, minutes);
              }
              
              // ถ้าไม่มี endTime ให้กำหนดเวลาสิ้นสุดเป็น 1 ชั่วโมงหลังจากเวลาเริ่มต้น
              let end;
              if (todo.endTime && todo.dueDate) {
                // ถ้ามี endTime ให้ใช้วันที่เดียวกับ dueDate แต่เวลาตาม endTime
                const dueDate = new Date(todo.dueDate);
                const [hours, minutes] = todo.endTime.split(':').map(Number);
                end = new Date(dueDate);
                end.setHours(hours, minutes);
              } else {
                end = new Date(start.getTime() + 60 * 60 * 1000);
              }
              
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

  // ย้อนกลับไปยังเดือนปัจจุบัน
  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
    const today = new Date();
    setSelectedDate(today);
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
    }).sort((a, b) => {
      // เรียงตามเวลาเริ่มต้น
      return a.start.getTime() - b.start.getTime();
    });
  };

  // ย้อนกลับไปยังหน้าหลัก
  const goToHome = () => {
    router.push('/');
  };
  
  // ฟังก์ชันให้สีของ event ตามความสำคัญและความเร่งด่วน
  const getEventColor = (importance: 'high' | 'low', urgency: 'high' | 'low', completed: boolean) => {
    if (completed) return 'bg-gray-600 border-gray-600';
    
    if (importance === 'high' && urgency === 'high') return 'bg-red-500 border-red-500';
    if (importance === 'high' && urgency === 'low') return 'bg-[#ff6100] border-[#ff6100]';
    if (importance === 'low' && urgency === 'high') return 'bg-yellow-500 border-yellow-500';
    return 'bg-green-500 border-green-500';
  };

  // ไอคอนประเภทงาน
  const getEventIcon = (importance: 'high' | 'low', urgency: 'high' | 'low') => {
    if (importance === 'high' && urgency === 'high') return '🔥';
    if (importance === 'high' && urgency === 'low') return '📋';
    if (importance === 'low' && urgency === 'high') return '⏰';
    return '🍃';
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

  // ตรวจสอบว่าเป็นวันที่ในเดือนปัจจุบันหรือไม่
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === new Date().getMonth() && 
           date.getFullYear() === new Date().getFullYear();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-lg mx-auto px-3 min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-14 h-14 border-4 border-[#ff6100] border-t-transparent rounded-full animate-spin mb-5"></div>
          <p className="text-gray-400 font-light">กำลังโหลดข้อมูลปฏิทิน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 min-h-screen pb-24 bg-[#0a0a0a]">
      <div className="mb-4 pt-3">
        <Header />
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={goToHome} 
          className="glass-card p-2.5 rounded-full hover:bg-[#2a2a2a] transition-all duration-300 shadow-md flex items-center justify-center hover:scale-105"
          aria-label="กลับไปหน้าหลัก"
          title="กลับไปหน้าหลัก"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff6100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h1 className="text-xl font-bold text-gradient">ปฏิทินงาน</h1>
        </div>
        
        <button 
          onClick={goToCurrentMonth} 
          className="glass-card p-2.5 rounded-full hover:bg-[#2a2a2a] transition-all duration-300 shadow-md flex items-center justify-center hover:scale-105"
          title="กลับไปยังเดือนปัจจุบัน"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      {/* ปฏิทิน */}
      <div className="glass-card overflow-hidden border-0 mb-6 animate-fadeIn shadow-lg">
        {/* ส่วนหัวปฏิทิน */}
        <div className="flex justify-between items-center p-4 border-b border-[#2a2a2a] bg-[rgba(26,26,26,0.8)]">
          <button 
            onClick={goToPreviousMonth} 
            className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors flex items-center justify-center hover-pulse"
            aria-label="เดือนก่อนหน้า"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <h2 className="text-lg font-bold flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#ff6100]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{thaiMonths[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}</span>
          </h2>
          
          <button 
            onClick={goToNextMonth} 
            className="p-2 rounded-full hover:bg-[#2a2a2a] transition-colors flex items-center justify-center hover-pulse"
            aria-label="เดือนถัดไป"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* วันในสัปดาห์ */}
        <div className="grid grid-cols-7 bg-[rgba(26,26,26,0.6)]">
          {thaiDays.map((day, index) => (
            <div key={index} className="py-2 text-center">
              <span className={`text-sm font-medium ${index === 0 ? 'text-red-400' : 'text-gray-300'}`}>
                {day}
              </span>
            </div>
          ))}
        </div>
        
        {/* วันในเดือน */}
        <div className="grid grid-cols-7">
          {renderCalendarWeeks().map((week, weekIndex) => (
            <React.Fragment key={`week-${weekIndex}`}>
              {week.map((day, dayIndex) => {
                if (!day) return (
                  <div 
                    key={`empty-${weekIndex}-${dayIndex}`} 
                    className="p-1 border-t border-[#2a2a2a] min-h-[70px] bg-[#0d0d0d] bg-opacity-40"
                  ></div>
                );
                
                const isToday = new Date().toDateString() === day.toDateString();
                const hasEventsForDay = hasEvents(day);
                const isSelected = selectedDate && selectedDate.toDateString() === day.toDateString();
                const eventsForDay = getEventsForDate(day);
                
                return (
                  <div 
                    key={`day-${day.toDateString()}`} 
                    className={`p-1 border-t border-[#2a2a2a] min-h-[70px] cursor-pointer transition-all duration-300
                      ${isToday ? 'bg-[#1f1f1f]' : ''}
                      ${isSelected ? 'bg-[#2a2a2a]' : ''}
                      ${!isCurrentMonth(day) ? 'opacity-50' : ''}
                      hover:bg-[#252525] hover:shadow-inner
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className="relative h-full">
                      <div className="flex justify-between items-center mb-1">
                        <div className={`
                          w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
                          ${isToday ? 'bg-gradient-to-br from-[#ff6100] to-[#ff884d] text-white shadow-sm' : ''}
                        `}>
                          {day.getDate()}
                        </div>
                        {hasEventsForDay && !isToday && (
                          <div className="w-2 h-2 rounded-full bg-[#ff6100] animate-pulse"></div>
                        )}
                      </div>
                      
                      {/* แสดงรายการ events */}
                      <div className="space-y-1 overflow-hidden max-h-[40px]">
                        {eventsForDay.slice(0, 2).map(event => {
                          // กำหนด class ของ border ที่เหมาะสม
                          let borderLeftClass = 'border-l-2 border-l-white';
                          if (event.completed) {
                            borderLeftClass = 'border-l-2 border-l-gray-600';
                          } else if (event.importance === 'high' && event.urgency === 'high') {
                            borderLeftClass = 'border-l-2 border-l-red-500';
                          } else if (event.importance === 'high' && event.urgency === 'low') {
                            borderLeftClass = 'border-l-2 border-l-[#ff6100]';
                          } else if (event.importance === 'low' && event.urgency === 'high') {
                            borderLeftClass = 'border-l-2 border-l-yellow-500';
                          } else if (event.importance === 'low' && event.urgency === 'low') {
                            borderLeftClass = 'border-l-2 border-l-green-500';
                          }
                          
                          return (
                            <div 
                              key={`event-${event.id}`} 
                              className={`text-xs px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 bg-[rgba(42,42,42,0.7)] backdrop-blur-sm ${borderLeftClass}`}
                            >
                              <span className="text-[10px]">{getEventIcon(event.importance, event.urgency)}</span>
                              <span className={`truncate ${event.completed ? 'line-through opacity-50' : ''}`}>
                                {event.title}
                              </span>
                            </div>
                          );
                        })}
                        
                        {eventsForDay.length > 2 && (
                          <div className="text-xs text-gray-400 pl-1 flex items-center gap-1 opacity-70">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                            </svg>
                            <span>+{eventsForDay.length - 2} เพิ่มเติม</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* แสดงรายละเอียดของวันที่เลือก */}
      {selectedDate && (
        <div className="mb-24 animate-fadeIn">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6100] to-[#ff884d] border border-[#2d2d2d] flex items-center justify-center text-white font-bold shadow-lg">
              {selectedDate.getDate()}
            </div>
            <h3 className="text-lg font-medium">
              {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
            </h3>
          </div>
          
          <div className="glass-card p-5 border-0 shadow-lg">
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="text-gray-400 text-center py-8 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-600 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mb-1">ไม่มีรายการในวันนี้</p>
                <p className="text-xs text-gray-500 mb-5">คุณสามารถเพิ่มรายการใหม่ได้ง่ายๆ</p>
                <button 
                  onClick={() => {
                    router.push('/');
                  }}
                  className="btn-modern py-2 px-4 flex items-center gap-2 scale-on-press"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  เพิ่มรายการใหม่
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => {
                  const eventColor = getEventColor(event.importance, event.urgency, event.completed);
                  const icon = getEventIcon(event.importance, event.urgency);
                  
                  // กำหนด class ของ border ที่เหมาะสม
                  let borderClass = 'border-transparent-30';
                  if (event.completed) {
                    borderClass = 'border-gray-transparent';
                  } else if (event.importance === 'high' && event.urgency === 'high') {
                    borderClass = 'border-red-transparent';
                  } else if (event.importance === 'high' && event.urgency === 'low') {
                    borderClass = 'border-orange-transparent';
                  } else if (event.importance === 'low' && event.urgency === 'high') {
                    borderClass = 'border-yellow-transparent';
                  } else if (event.importance === 'low' && event.urgency === 'low') {
                    borderClass = 'border-green-transparent';
                  }
                  
                  // เตรียมค่าสำหรับเอฟเฟกต์เลื่อน
                  const glassBg = event.completed ? 'rgba(45, 45, 45, 0.4)' : 'rgba(26, 26, 26, 0.7)';
                  
                  return (
                    <div 
                      key={`event-detail-${event.id}`} 
                      className={`p-4 rounded-xl ${eventColor} bg-opacity-5 border ${borderClass} bg-shine backdrop-blur-sm animate-slide-up`}
                      style={{backgroundColor: glassBg}}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex-shrink-0 w-8 h-8 ${eventColor} bg-opacity-20 rounded-full flex items-center justify-center text-white shadow-inner border border-white border-opacity-10`}>
                          <span className="text-sm">{icon}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium text-white ${event.completed ? 'line-through opacity-60' : ''} text-sm`}>
                            {event.title}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2.5 text-gray-300">
                            <div className="flex items-center text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.isAllDay ? 'ทั้งวัน' : (
                                <>
                                  {event.start.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} 
                                  - 
                                  {event.end.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </>
                              )}
                            </div>
                            
                            {event.categories.length > 0 && (
                              <div className="flex items-center text-xs">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {event.categories[0]}
                                {event.categories.length > 1 && ` +${event.categories.length - 1}`}
                              </div>
                            )}
                            
                            <div className="flex items-center text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {event.completed ? 'เสร็จสิ้น' : 'ยังไม่เสร็จ'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* ปุ่มลอยด้านล่างเพื่อไปยังหน้าหลัก */}
      <button 
        onClick={goToHome}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-[#ff6100] to-[#ff884d] text-white rounded-full shadow-lg flex items-center justify-center z-10 hover:scale-110 transition-all duration-300 hover-glow"
        aria-label="กลับสู่หน้าหลัก"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
    </div>
  );
} 