'use client';

import { useState, useEffect, useCallback } from 'react';

interface PomodoroTimerProps {
  todoId: number;
  isCompleted: boolean;
  onSessionComplete: (todoId: number, timeSpent: number) => void;
  onPause: (todoId: number, timeSpent: number) => void;
}

export default function PomodoroTimer({ todoId, isCompleted, onSessionComplete, onPause }: PomodoroTimerProps) {
  // กำหนดค่าเริ่มต้น
  const POMODORO_TIME = 25 * 60; // 25 นาที (เป็นวินาที)
  const SHORT_BREAK = 5 * 60;    // 5 นาที
  const LONG_BREAK = 15 * 60;    // 15 นาที
  const MAX_SESSIONS = 4;        // จำนวนเซสชันต่อรอบ

  // สถานะต่างๆ
  const [timer, setTimer] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [sessions, setSessions] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState('25:00');
  const [progress, setProgress] = useState(100);

  // คำนวณเวลาที่เหลือและความคืบหน้า
  const calculateTimeLeft = useCallback(() => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    setTimeLeft(
      `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
    
    const maxTime = 
      mode === 'pomodoro' ? POMODORO_TIME : 
      mode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK;
    
    setProgress(Math.floor((timer / maxTime) * 100));
  }, [timer, mode, POMODORO_TIME, SHORT_BREAK, LONG_BREAK]);

  // ตัวจับเวลา
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
        
        if (mode === 'pomodoro') {
          setTotalTimeSpent(prev => prev + 1);
        }
      }, 1000);
    } else if (isActive && timer === 0) {
      // เมื่อหมดเวลา
      if (mode === 'pomodoro') {
        // อัปเดตสถิติเมื่อทำ Pomodoro เสร็จ
        onSessionComplete(todoId, POMODORO_TIME);
        setSessions(prev => prev + 1);
        
        // ตรวจสอบว่าควรพักสั้นหรือพักยาว
        if (sessions < MAX_SESSIONS - 1) {
          setMode('shortBreak');
          setTimer(SHORT_BREAK);
        } else {
          setMode('longBreak');
          setTimer(LONG_BREAK);
          setSessions(0);
        }
        
        // แจ้งเตือนเมื่อหมดเวลา
        notifyUser('Pomodoro เสร็จสิ้น! เวลาพัก');
      } else {
        // เมื่อหมดเวลาพัก ให้กลับไปเริ่ม Pomodoro ใหม่
        setMode('pomodoro');
        setTimer(POMODORO_TIME);
        
        // แจ้งเตือนเมื่อหมดเวลาพัก
        notifyUser('เวลาพักเสร็จสิ้น! กลับมาทำงานต่อ');
      }
    }
    
    // ทุกครั้งที่ timer เปลี่ยน ให้อัปเดตการแสดงผล
    calculateTimeLeft();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timer, mode, sessions, calculateTimeLeft, onSessionComplete, todoId, POMODORO_TIME, SHORT_BREAK, LONG_BREAK, MAX_SESSIONS]);

  // หยุดเมื่องานเสร็จสมบูรณ์
  useEffect(() => {
    if (isCompleted && isActive) {
      handlePause();
    }
  }, [isCompleted]);

  // แจ้งเตือนผู้ใช้
  const notifyUser = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', { body: message });
    }
    
    // เสียงแจ้งเตือน
    const audio = new Audio('/notification.mp3');
    audio.play().catch(error => console.log('เล่นเสียงแจ้งเตือนไม่ได้:', error));
  };

  // เริ่มจับเวลา
  const handleStart = () => {
    setIsActive(true);
  };

  // หยุดจับเวลา
  const handlePause = () => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      onPause(todoId, totalTimeSpent);
    }
  };

  // รีเซ็ตเวลา
  const handleReset = () => {
    setIsActive(false);
    setMode('pomodoro');
    setTimer(POMODORO_TIME);
    if (totalTimeSpent > 0) {
      onPause(todoId, totalTimeSpent);
      setTotalTimeSpent(0);
    }
  };

  // สีแถบความคืบหน้าตามโหมด
  const getProgressColor = () => {
    if (mode === 'pomodoro') return 'bg-red-500';
    if (mode === 'shortBreak') return 'bg-green-500';
    return 'bg-blue-500';
  };

  return (
    <div className="w-full p-4 bg-gray-900 rounded-lg shadow-md">
      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold">
          {mode === 'pomodoro' ? '🍅 โหมดทำงาน' : 
           mode === 'shortBreak' ? '☕ พักสั้น' : '🌴 พักยาว'}
        </h3>
        <p className="text-3xl font-bold my-3">{timeLeft}</p>
        
        {/* แถบความคืบหน้า */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700 mb-4">
          <div 
            className={`h-2.5 rounded-full ${getProgressColor()}`} 
            style={{ width: `${progress}%` }}>
          </div>
        </div>
        
        {/* จำนวนเซสชันที่เสร็จสิ้น */}
        <div className="mb-3 flex justify-center">
          {[...Array(MAX_SESSIONS)].map((_, i) => (
            <span 
              key={i} 
              className={`w-3 h-3 mx-1 rounded-full ${
                i < sessions ? 'bg-red-500' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* ปุ่มควบคุม */}
      <div className="flex justify-center space-x-3">
        {!isActive ? (
          <button
            onClick={handleStart}
            disabled={isCompleted}
            className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${
              isCompleted ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            เริ่ม
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            หยุด
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          รีเซ็ต
        </button>
      </div>
      
      {/* สถิติ */}
      {mode === 'pomodoro' && totalTimeSpent > 0 && (
        <div className="mt-3 text-sm text-gray-400 text-center">
          เวลาที่ใช้ไป: {Math.floor(totalTimeSpent / 60)}:{(totalTimeSpent % 60).toString().padStart(2, '0')}
        </div>
      )}
    </div>
  );
} 