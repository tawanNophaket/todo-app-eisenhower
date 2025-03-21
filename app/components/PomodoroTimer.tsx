'use client';

import { memo, useCallback, useEffect, useState } from 'react';

interface PomodoroTimerProps {
  todoId: number;
  isCompleted: boolean;
  onSessionComplete: (todoId: number, timeSpent: number) => void;
  onPause: (todoId: number, timeSpent: number) => void;
}

function PomodoroTimer({ todoId, isCompleted, onSessionComplete, onPause }: PomodoroTimerProps) {
  // ค่าคงที่สำหรับตั้งค่าเวลา
  const POMODORO_TIME = 25 * 60; // 25 นาที (วินาที)
  const SHORT_BREAK = 5 * 60;    // 5 นาที
  const LONG_BREAK = 15 * 60;    // 15 นาที
  const MAX_SESSIONS = 4;        // จำนวนรอบต่อเซสชัน

  // สถานะต่างๆ
  const [timer, setTimer] = useState(POMODORO_TIME);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [sessions, setSessions] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [timeLeft, setTimeLeft] = useState('25:00');
  const [progress, setProgress] = useState(100);
  const [showSettings, setShowSettings] = useState(false);

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
        // บันทึกว่าทำงานเสร็จแล้ว 1 pomodoro
        onSessionComplete(todoId, POMODORO_TIME);
        setSessions(prev => prev + 1);

        // เลือกว่าควรพักสั้นหรือพักยาว
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
        // เมื่อหมดเวลาพัก กลับไปโหมด pomodoro
        setMode('pomodoro');
        setTimer(POMODORO_TIME);

        // แจ้งเตือนเมื่อหมดเวลาพัก
        notifyUser('เวลาพักเสร็จสิ้น! กลับมาทำงานต่อ');
      }
    }

    // อัปเดตการแสดงผลเวลาที่เหลือ
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
  const notifyUser = useCallback((message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', { body: message });
    }

    // ทำเสียงแจ้งเตือนง่ายๆ
    try {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdYiVi2ZTRUleanJqVEA9Umh}';
      audio.volume = 0.5;
      audio.play();
    } catch (error) {
      console.log('ไม่สามารถเล่นเสียงแจ้งเตือนได้');
    }
  }, []);

  // เริ่มจับเวลา
  const handleStart = useCallback(() => {
    setIsActive(true);
  }, []);

  // หยุดจับเวลา
  const handlePause = useCallback(() => {
    setIsActive(false);
    if (mode === 'pomodoro') {
      onPause(todoId, totalTimeSpent);
    }
  }, [mode, onPause, todoId, totalTimeSpent]);

  // รีเซ็ตเวลา
  const handleReset = useCallback(() => {
    setIsActive(false);
    setMode('pomodoro');
    setTimer(POMODORO_TIME);
    if (totalTimeSpent > 0) {
      onPause(todoId, totalTimeSpent);
      setTotalTimeSpent(0);
    }
  }, [POMODORO_TIME, onPause, todoId, totalTimeSpent]);

  // เปลี่ยนโหมด
  const switchMode = useCallback((newMode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
    if (isActive) {
      handlePause();
    }
    setMode(newMode);
    setTimer(
      newMode === 'pomodoro' ? POMODORO_TIME :
        newMode === 'shortBreak' ? SHORT_BREAK : LONG_BREAK
    );
  }, [POMODORO_TIME, SHORT_BREAK, LONG_BREAK, isActive, handlePause]);

  // รูปแบบของตัวจับเวลาตามโหมด
  const getProgressColor = useCallback(() => {
    if (mode === 'pomodoro') return 'bg-gradient-to-r from-red-500 to-red-600';
    if (mode === 'shortBreak') return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
    return 'bg-gradient-to-r from-blue-500 to-blue-600';
  }, [mode]);

  const getBackgroundColor = useCallback(() => {
    if (mode === 'pomodoro') return 'from-red-900/20 to-red-800/5';
    if (mode === 'shortBreak') return 'from-emerald-900/20 to-emerald-800/5';
    return 'from-blue-900/20 to-blue-800/5';
  }, [mode]);

  return (
    <div className={`w-full p-4 rounded-xl bg-gradient-to-br ${getBackgroundColor()} border border-gray-800 shadow-md`}>
      <div className="text-center">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-white">
            {mode === 'pomodoro' ? '🍅 โหมดทำงาน' :
              mode === 'shortBreak' ? '☕ พักสั้น' : '🌴 พักยาว'}
          </h3>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            {showSettings ? '▲' : '▼'}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 flex justify-center gap-2 animate-fadeIn">
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

        <div className="mb-3">
          <div className="flex justify-center">
            <div className="bg-gray-900/70 rounded-2xl text-center p-4 w-[120px] backdrop-blur-sm">
              <p className="text-3xl font-bold text-white">{timeLeft}</p>
            </div>
          </div>

          {/* แถบความคืบหน้า */}
          <div className="w-full h-1.5 bg-gray-800 rounded-full mt-3">
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
              className={`w-2 h-2 mx-1 rounded-full ${i < sessions
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
            className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all ${isCompleted
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5'
              }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            เริ่ม
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg flex items-center gap-1.5 hover:shadow-lg hover:from-amber-500 hover:to-amber-600 hover:-translate-y-0.5 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V9a1 1 0 00-1-1H7z" clipRule="evenodd" />
            </svg>
            หยุด
          </button>
        )}
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg flex items-center gap-1.5 hover:shadow-lg hover:from-gray-600 hover:to-gray-700 hover:-translate-y-0.5 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
          รีเซ็ต
        </button>
      </div>

      {/* สถิติ */}
      {mode === 'pomodoro' && totalTimeSpent > 0 && (
        <div className="mt-3 text-sm text-gray-300 text-center">
          <span className="bg-gray-800/70 px-2 py-1 rounded-full inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.floor(totalTimeSpent / 60)}:{(totalTimeSpent % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}
    </div>
  );
}

export default memo(PomodoroTimer);