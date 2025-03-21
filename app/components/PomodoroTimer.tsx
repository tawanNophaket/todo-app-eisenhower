'use client';

import { useCallback, useEffect, useState } from 'react';

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
  const [expandedSettings, setExpandedSettings] = useState(false);

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

  // เปลี่ยนโหมดโดยตรง
  const switchMode = (newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    if (isActive) {
      handlePause();
    }
    setMode(newMode);
    setTimer(newMode === 'pomodoro' ? POMODORO_TIME : newMode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK);
  };

  // สีแถบความคืบหน้าตามโหมด
  const getProgressColor = () => {
    if (mode === 'pomodoro') return 'bg-gradient-to-r from-red-500 to-red-600';
    if (mode === 'shortBreak') return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  };

  // สีพื้นหลังตามโหมด
  const getBackgroundColor = () => {
    if (mode === 'pomodoro') return 'from-red-900/20 to-red-800/5';
    if (mode === 'shortBreak') return 'from-emerald-900/20 to-emerald-800/5';
    return 'from-blue-900/20 to-blue-800/5';
  };

  return (
    <div className={`w-full p-5 rounded-xl shadow-lg bg-gradient-to-br ${getBackgroundColor()} border border-gray-800`}>
      <div className="text-center mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold text-white">
            {mode === 'pomodoro' ? '🍅 โหมดทำงาน' :
              mode === 'shortBreak' ? '☕ พักสั้น' : '🌴 พักยาว'}
          </h3>

          <button
            onClick={() => setExpandedSettings(!expandedSettings)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
            title={expandedSettings ? "ซ่อนการตั้งค่า" : "แสดงการตั้งค่า"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        {expandedSettings && (
          <div className="mb-4 p-3 bg-gray-900/50 rounded-lg flex justify-center gap-2 animate-fadeIn">
            <button
              onClick={() => switchMode('pomodoro')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'pomodoro' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🍅 ทำงาน
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'shortBreak' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              ☕ พักสั้น
            </button>
            <button
              onClick={() => switchMode('longBreak')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${mode === 'longBreak' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              🌴 พักยาว
            </button>
          </div>
        )}

        <div className="relative mb-3">
          <div className="flex justify-center">
            <div className="bg-gray-900/70 rounded-2xl text-center p-5 w-[160px] backdrop-blur-sm">
              <p className="text-4xl font-bold mb-1 text-white">{timeLeft}</p>
            </div>
          </div>

          {/* แถบความคืบหน้า */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-4">
            <div
              className={`h-1.5 rounded-full ${getProgressColor()}`}
              style={{ width: `${progress}%` }}>
            </div>
          </div>
        </div>

        {/* จำนวนเซสชันที่เสร็จสิ้น */}
        <div className="mb-4 flex justify-center">
          {Array.from({ length: MAX_SESSIONS }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 mx-1 rounded-full ${i < sessions
                ? mode === 'pomodoro' ? 'bg-red-500' : mode === 'shortBreak' ? 'bg-emerald-500' : 'bg-blue-500'
                : 'bg-gray-700'
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
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${isCompleted
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            เริ่ม
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-1 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z" clipRule="evenodd" />
            </svg>
            หยุด
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg flex items-center gap-2 hover:shadow-lg hover:shadow-gray-700/20 hover:-translate-y-1 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          รีเซ็ต
        </button>
      </div>

      {/* สถิติ */}
      {mode === 'pomodoro' && totalTimeSpent > 0 && (
        <div className="mt-4 text-sm text-gray-300 text-center">
          <span className="bg-gray-800/70 px-3 py-1.5 rounded-full inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            เวลาที่ใช้ไป: {Math.floor(totalTimeSpent / 60)}:{(totalTimeSpent % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}