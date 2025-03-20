'use client';

import { useState, useEffect } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่าเราอยู่ในฝั่งไคลเอนต์หรือไม่
    if (typeof window === 'undefined') return;

    // เซ็ตค่าเริ่มต้นจากสถานะเครือข่ายปัจจุบัน
    setIsOnline(navigator.onLine);

    // เพิ่ม event listeners สำหรับการตรวจสอบการเชื่อมต่อ
    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      // ซ่อนข้อความหลังจาก 5 วินาที
      setTimeout(() => setShowMessage(false), 5000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
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
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 animate-fade-in ${isOnline ? 'bg-green-700' : 'bg-red-700'}`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <p className="text-sm font-medium text-white">
          {isOnline ? 'กลับมาออนไลน์แล้ว' : 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต'}
        </p>
      </div>
    </div>
  );
} 