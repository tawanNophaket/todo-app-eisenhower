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
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'month' | 'week' | 'day'>('month');
  
  // วันในสัปดาห์ภาษาไทย
  const thaiDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
  // เดือนภาษาไทย
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  // อัพเดทเวลาปัจจุบันทุกนาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // อัพเดททุก 1 นาที
    
    return () => clearInterval(timer);
  }, []);
  
  // ตั้งค่าวันที่ที่เลือกเป็นวันปัจจุบันเมื่อโหลดครั้งแรก
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
  }, []);

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

  // คำนวณเวลาปัจจุบันในรูปแบบ HH:MM
  const getCurrentTimeString = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // คำนวณเปอร์เซ็นต์ของเวลาปัจจุบันในวัน (สำหรับแสดงเส้นเวลาปัจจุบัน)
  const getCurrentTimePercentage = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (minutes / (24 * 60)) * 100;
  };

  // ตรวจสอบว่าวันที่ที่กำหนดเป็นวันนี้หรือไม่
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // รูปแบบการแสดงหน้าปฏิทินตามมุมมองที่เลือก
  const renderCalendarView = () => {
    switch (currentView) {
      case 'month':
        return (
          <div className="calendar">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {thaiDays.map((day, index) => (
                <div key={index} className="text-center text-sm font-medium text-gray-400 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth().map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="p-2 border border-[#2d2d2d] bg-[#1a1a1a] rounded-lg"></div>;
                }
                
                const hasEventsOnDay = hasEvents(date);
                const isTodayDate = isToday(date);
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = selectedDate && 
                  date.getDate() === selectedDate.getDate() && 
                  date.getMonth() === selectedDate.getMonth() && 
                  date.getFullYear() === selectedDate.getFullYear();
                
                return (
                  <div 
                    key={date.toString()}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      min-h-[80px] p-2 text-sm border ${isCurrentMonth ? 'border-[#2d2d2d]' : 'border-[#222]'} 
                      ${isCurrentMonth ? 'bg-[#1e1e1e]' : 'bg-[#1a1a1a]'} 
                      ${isSelected ? 'ring-2 ring-[#ff6100]' : ''} 
                      ${isTodayDate ? 'border-blue-500' : ''} 
                      rounded-lg cursor-pointer transition-all hover:bg-[#252525] relative overflow-hidden
                    `}
                  >
                    <div className={`
                      flex justify-center items-center w-7 h-7 rounded-full mb-1
                      ${isTodayDate ? 'bg-blue-500 text-white' : isCurrentMonth ? 'text-white' : 'text-gray-500'}
                    `}>
                      {date.getDate()}
                    </div>
                    
                    {hasEventsOnDay && (
                      <div className="space-y-1">
                        {getEventsForDate(date).slice(0, 3).map(event => (
                          <div 
                            key={event.id} 
                            className={`
                              text-xs px-1 py-0.5 rounded truncate 
                              ${event.completed ? 'bg-gray-600 text-gray-300' : getEventColor(event.importance, event.urgency, event.completed)}
                            `}
                          >
                            {event.isAllDay ? '🕒 ' : ''}
                            {event.title}
                          </div>
                        ))}
                        {getEventsForDate(date).length > 3 && (
                          <div className="text-xs text-blue-400 text-right mt-1">
                            +{getEventsForDate(date).length - 3} รายการ
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* แสดงเส้นเวลาปัจจุบันเฉพาะในวันนี้ */}
                    {isTodayDate && (
                      <div 
                        className="absolute left-0 right-0 border-t border-red-500 z-10"
                        style={{ top: `${getCurrentTimePercentage()}%` }}
                      >
                        <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
        
      case 'week':
        // สร้างวันในสัปดาห์ปัจจุบัน
        const startOfWeek = new Date(currentMonth);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const daysInWeek = Array.from({ length: 7 }, (_, i) => {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          return day;
        });
        
        return (
          <div className="week-view">
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="text-center text-sm font-medium text-gray-400 p-2">เวลา</div>
              {daysInWeek.map((day, index) => (
                <div 
                  key={index} 
                  className={`text-center text-sm font-medium p-2 ${isToday(day) ? 'text-blue-400' : 'text-gray-400'}`}
                >
                  <div>{thaiDays[index]}</div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1 ${isToday(day) ? 'bg-blue-500 text-white' : ''}`}>
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>
            <div className="relative">
              {/* ช่องเวลา */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="grid grid-cols-8 gap-1 border-t border-[#2d2d2d]">
                  <div className="text-xs text-gray-400 p-1 text-right pr-2">
                    {i.toString().padStart(2, '0')}:00
                  </div>
                  {daysInWeek.map((day, dayIndex) => (
                    <div 
                      key={`${i}-${dayIndex}`} 
                      className={`h-12 p-1 ${isToday(day) ? 'bg-[#1f1f1f]' : 'bg-[#1a1a1a]'}`}
                    >
                      {/* แสดงอีเวนต์ที่อยู่ในช่วงเวลานี้ */}
                      {events.filter(event => {
                        const eventDate = new Date(event.start);
                        const eventHour = eventDate.getHours();
                        return (
                          eventDate.getDate() === day.getDate() &&
                          eventDate.getMonth() === day.getMonth() &&
                          eventDate.getFullYear() === day.getFullYear() &&
                          eventHour === i
                        );
                      }).map(event => (
                        <div 
                          key={event.id} 
                          className={`text-xs px-1 py-0.5 rounded truncate mb-1 ${getEventColor(event.importance, event.urgency, event.completed)}`}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
              
              {/* เส้นแสดงเวลาปัจจุบัน */}
              <div 
                className="absolute left-0 right-0 border-t border-red-500 z-10 pointer-events-none"
                style={{ 
                  top: `${(currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * (24 * 48)}px` 
                }}
              >
                <div className="absolute left-16 -top-2 bg-red-500 text-white text-xs px-1 rounded">
                  {getCurrentTimeString()}
                </div>
                <div className="absolute left-12 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
              </div>
            </div>
          </div>
        );
        
      case 'day':
        // มุมมองรายวัน
        const selectedDay = selectedDate || new Date();
        
        return (
          <div className="day-view">
            <div className="text-center mb-4">
              <h3 className="text-xl font-medium">
                {selectedDay.getDate()} {thaiMonths[selectedDay.getMonth()]} {selectedDay.getFullYear() + 543}
              </h3>
              <p className={`text-sm ${isToday(selectedDay) ? 'text-blue-400' : 'text-gray-400'}`}>
                {thaiDays[selectedDay.getDay()]}
                {isToday(selectedDay) && ' (วันนี้)'}
              </p>
            </div>
            
            <div className="relative">
              {/* ตารางเวลารายชั่วโมง */}
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="flex border-t border-[#2d2d2d]">
                  <div className="w-16 text-xs text-gray-400 p-1 text-right pr-2">
                    {i.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 h-16 p-1 bg-[#1a1a1a]">
                    {/* แสดงอีเวนต์ที่อยู่ในช่วงเวลานี้ */}
                    {events.filter(event => {
                      const eventDate = new Date(event.start);
                      const eventHour = eventDate.getHours();
                      return (
                        eventDate.getDate() === selectedDay.getDate() &&
                        eventDate.getMonth() === selectedDay.getMonth() &&
                        eventDate.getFullYear() === selectedDay.getFullYear() &&
                        eventHour === i
                      );
                    }).map(event => (
                      <div 
                        key={event.id} 
                        className={`text-sm px-2 py-1 rounded mb-1 ${getEventColor(event.importance, event.urgency, event.completed)}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs">
                          {event.start.getHours().toString().padStart(2, '0')}:
                          {event.start.getMinutes().toString().padStart(2, '0')} - 
                          {event.end.getHours().toString().padStart(2, '0')}:
                          {event.end.getMinutes().toString().padStart(2, '0')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* เส้นแสดงเวลาปัจจุบัน (แสดงเฉพาะถ้าเป็นวันนี้) */}
              {isToday(selectedDay) && (
                <div 
                  className="absolute left-0 right-0 border-t border-red-500 z-10 pointer-events-none"
                  style={{ 
                    top: `${(currentTime.getHours() * 60 + currentTime.getMinutes()) / (24 * 60) * (24 * 64)}px` 
                  }}
                >
                  <div className="absolute left-16 -top-2 bg-red-500 text-white text-xs px-1 rounded">
                    {getCurrentTimeString()}
                  </div>
                  <div className="absolute left-12 -top-1 w-2 h-2 rounded-full bg-red-500"></div>
                </div>
              )}
            </div>
          </div>
        );
    }
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
    <div className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)] pb-12">
      <Header />
      
      <div className="container max-w-4xl mx-auto mt-6 bg-[var(--card-bg)] rounded-xl p-5 shadow-lg">
        <div className="app-card-header">
          <button 
            onClick={goToHome} 
            className="app-button app-button-secondary flex items-center text-[var(--text-secondary)]"
            title="กลับหน้าหลัก"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>หน้าหลัก</span>
          </button>
          
          <h1 className="text-xl font-medium text-center flex-1">ปฏิทินจัดการงาน</h1>
          
          <button 
            onClick={goToCurrentMonth} 
            className="app-button app-button-primary flex items-center"
            title="ไปที่วันนี้"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>วันนี้</span>
          </button>
        </div>
        
        <div className="mb-6 pb-4 border-b border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={goToPreviousMonth} 
                className="app-button app-button-secondary p-2"
                aria-label="เดือนก่อนหน้า"
                title="เดือนก่อนหน้า"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <h2 className="text-lg font-medium">
                {thaiMonths[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
              </h2>
              
              <button 
                onClick={goToNextMonth} 
                className="app-button app-button-secondary p-2"
                aria-label="เดือนถัดไป"
                title="เดือนถัดไป"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentView('month')} 
                className={`app-button text-sm rounded-lg transition-colors ${currentView === 'month' ? 'app-button-primary' : 'app-button-secondary'}`}
                title="มุมมองรายเดือน"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                เดือน
              </button>
              <button 
                onClick={() => setCurrentView('week')} 
                className={`app-button text-sm rounded-lg transition-colors ${currentView === 'week' ? 'app-button-primary' : 'app-button-secondary'}`}
                title="มุมมองรายสัปดาห์"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                สัปดาห์
              </button>
              <button 
                onClick={() => setCurrentView('day')} 
                className={`app-button text-sm rounded-lg transition-colors ${currentView === 'day' ? 'app-button-primary' : 'app-button-secondary'}`}
                title="มุมมองรายวัน"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                วัน
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="category-chip">
              <span className="priority-badge priority-1">1</span>
              <span>ทำทันที</span>
            </div>
            <div className="category-chip">
              <span className="priority-badge priority-2">2</span>
              <span>วางแผนทำ</span>
            </div>
            <div className="category-chip">
              <span className="priority-badge priority-3">3</span>
              <span>มอบหมาย</span>
            </div>
            <div className="category-chip">
              <span className="priority-badge priority-4">4</span>
              <span>ตัดทิ้ง</span>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-[var(--primary-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[var(--text-secondary)]">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        ) : (
          <div className="bg-[#151515] p-4 rounded-lg overflow-x-auto shadow-inner">
            {renderCalendarView()}
          </div>
        )}
        
        {selectedDate && currentView === 'month' && (
          <div className="mt-6 content-section">
            <h3 className="section-title">
              รายการวันที่ {selectedDate.getDate()} {thaiMonths[selectedDate.getMonth()]} {selectedDate.getFullYear() + 543}
              {isToday(selectedDate) && ' (วันนี้)'}
            </h3>
            
            <div className="bg-[#151515] p-4 rounded-lg shadow-inner">
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-3">
                  {getEventsForDate(selectedDate).map(event => {
                    let priorityClass = '';
                    let badgeContent = '';
                    
                    if (event.importance === 'high' && event.urgency === 'high') {
                      priorityClass = 'priority-1';
                      badgeContent = '1';
                    } else if (event.importance === 'high' && event.urgency === 'low') {
                      priorityClass = 'priority-2';
                      badgeContent = '2';
                    } else if (event.importance === 'low' && event.urgency === 'high') {
                      priorityClass = 'priority-3';
                      badgeContent = '3';
                    } else {
                      priorityClass = 'priority-4';
                      badgeContent = '4';
                    }
                    
                    return (
                      <div 
                        key={event.id} 
                        className={`p-3 rounded-lg border-l-4 hover-lift ${
                          event.completed 
                            ? 'border-gray-600 bg-[#1a1a1a]' 
                            : `border-${priorityClass.replace('priority-', '')} bg-[#1e1e1e]`
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`priority-badge ${priorityClass}`}>{badgeContent}</span>
                              <h4 className={`font-medium ${event.completed ? 'line-through text-gray-400' : 'text-white'}`}>{event.title}</h4>
                            </div>
                            <div className="flex flex-wrap mt-2 gap-3 text-xs">
                              <span className="category-chip">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.isAllDay 
                                  ? 'ทั้งวัน' 
                                  : `${event.start.getHours().toString().padStart(2, '0')}:${event.start.getMinutes().toString().padStart(2, '0')} - 
                                     ${event.end.getHours().toString().padStart(2, '0')}:${event.end.getMinutes().toString().padStart(2, '0')}`
                                }
                              </span>
                              {event.categories.length > 0 && (
                                <span className="category-chip">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {event.categories.join(', ')}
                                </span>
                              )}
                              <span className="category-chip">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {event.completed ? 'เสร็จสิ้น' : 'อยู่ระหว่างดำเนินการ'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-[var(--border-color)] mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div className="text-[var(--text-secondary)]">ไม่มีรายการในวันนี้</div>
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">เพิ่มรายการใหม่ได้ที่หน้ารายการงาน</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 