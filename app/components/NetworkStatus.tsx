'use client';

import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าเราอยู่ในฝั่งไคลเอนต์หรือไม่
    if (typeof window === 'undefined') return;

    // เซ็ตค่าเริ่มต้นจากสถานะเครือข่ายปัจจุบัน
    setIsOnline(navigator.onLine);

    // เพิ่ม event listeners สำหรับการตรวจสอบการเชื่อมต่อ
    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      setIsAnimating(true);
      // ซ่อนข้อความหลังจาก 5 วินาที
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setShowMessage(false), 300); // รอให้ animation เสร็จก่อนซ่อน
      }, 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
      setIsAnimating(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // ลบ event listeners เมื่อ component unmounts
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ถ้าไม่ต้องการแสดงข้อความ
  if (!showMessage) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className={`flex items-center space-x-3 px-5 py-3 rounded-full shadow-lg backdrop-blur-md
        ${isOnline
          ? 'bg-gradient-to-r from-emerald-500/90 to-emerald-600/90 text-white shadow-emerald-500/20'
          : 'bg-gradient-to-r from-red-500/90 to-red-600/90 text-white shadow-red-500/20'}`}>

        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-emerald-300' : 'bg-red-300'}`}></div>
          <div className={`absolute top-0 left-0 w-3 h-3 rounded-full ${isOnline ? 'bg-white' : 'bg-white'} 
            animate-ping opacity-75`}></div>
        </div>

        <p className="text-sm font-medium">
          {isOnline ? 'กลับมาออนไลน์แล้ว' : 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต'}
        </p>

        {!isOnline && (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>
    </div>
  );
}