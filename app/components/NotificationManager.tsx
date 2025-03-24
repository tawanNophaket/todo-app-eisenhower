'use client';

import { useEffect, useState } from 'react';
import {
  isNotificationSupported,
  registerServiceWorker,
  requestNotificationPermission,
  testNotification
} from '../utils/notificationManager';

interface NotificationManagerProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export default function NotificationManager({ onPermissionChange }: NotificationManagerProps) {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);
  const [showTestButton, setShowTestButton] = useState(false);

  // ตรวจสอบสถานะการสนับสนุน Notification API และสิทธิ์
  useEffect(() => {
    // ตรวจสอบเฉพาะเมื่ออยู่ในฝั่งไคลเอนต์
    if (typeof window !== 'undefined') {
      const supported = isNotificationSupported();
      setNotificationSupported(supported);

      if (supported) {
        // ตั้งค่าสิทธิ์ปัจจุบัน
        setNotificationPermission(Notification.permission);

        // แสดงส่วนแจ้งเตือนให้ขอสิทธิ์เฉพาะเมื่อยังไม่ได้ตัดสินใจ
        if (Notification.permission === 'default') {
          // รอสักครู่ก่อนแสดง prompt เพื่อไม่ให้กวนผู้ใช้ทันที
          setTimeout(() => {
            setShowPrompt(true);
            setIsAnimating(true);
          }, 3000);
        } else if (Notification.permission === 'granted') {
          // แสดงปุ่มทดสอบถ้ามีสิทธิ์แล้ว
          setShowTestButton(true);
        }

        // ลงทะเบียน Service Worker
        registerServiceWorker();
      }
    }
  }, []);

  // เมื่อมีการเปลี่ยนแปลงสิทธิ์ ให้แจ้งคอมโพเนนต์แม่
  useEffect(() => {
    if (onPermissionChange) {
      onPermissionChange(notificationPermission);
    }
    
    // แสดงปุ่มทดสอบถ้ามีสิทธิ์แล้ว
    if (notificationPermission === 'granted') {
      setShowTestButton(true);
    }
  }, [notificationPermission, onPermissionChange]);

  // ขอสิทธิ์การแจ้งเตือน
  const handleRequestPermission = async () => {
    setIsAnimating(false);

    // รอให้ animation เสร็จก่อนขอสิทธิ์
    setTimeout(async () => {
      const permission = await requestNotificationPermission();
      setNotificationPermission(permission);
      setShowPrompt(false);
      
      if (permission === 'granted') {
        setShowTestButton(true);
        
        // แสดงการทดสอบอัตโนมัติเมื่อได้รับสิทธิ์
        handleTestNotification();
      }
    }, 300);
  };

  // ปิดการแจ้งเตือนโดยไม่ขอสิทธิ์
  const handleDismissPrompt = () => {
    setIsAnimating(false);

    // รอให้ animation เสร็จก่อนซ่อน
    setTimeout(() => {
      setShowPrompt(false);
    }, 300);
  };
  
  // ทดสอบการแจ้งเตือน
  const handleTestNotification = async () => {
    const result = await testNotification();
    setTestResult(result);
    
    // ซ่อนผลลัพธ์หลังจาก 5 วินาที
    setTimeout(() => {
      setTestResult(null);
    }, 5000);
  };

  // ถ้าเบราว์เซอร์ไม่รองรับ ให้ไม่แสดงอะไรเลย
  if (!notificationSupported) {
    return null;
  }
  
  // แสดงปุ่มทดสอบเมื่อมีสิทธิ์แล้ว
  if (showTestButton && !showPrompt) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        {testResult && (
          <div className={`mb-3 p-3 rounded-lg text-sm ${testResult.success ? 'bg-green-800/80' : 'bg-red-800/80'} text-white shadow-lg max-w-xs animate-fadeIn`}>
            {testResult.message}
          </div>
        )}
        <button 
          onClick={handleTestNotification}
          className="p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-all duration-200"
          title="ทดสอบการแจ้งเตือน"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>
    );
  }

  // ถ้าไม่ต้องการแสดงการแจ้งเตือนให้ขอสิทธิ์ ให้ไม่แสดงอะไรเลย
  if (!showPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 transition-all duration-300
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative overflow-hidden app-card border border-indigo-500/20 p-4 rounded-xl shadow-lg">
        {/* พื้นหลังแบบ gradient ที่เคลื่อนไหว */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 background-animate"></div>

        <div className="relative z-10">
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0 bg-indigo-500/20 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gradient-purple mb-1">เปิดการแจ้งเตือน</h4>
              <p className="text-xs text-gray-300 mb-3">เปิดการแจ้งเตือนเพื่อรับแจ้งเตือนเมื่อใกล้ถึงกำหนดเวลาของรายการ</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleRequestPermission}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  เปิดการแจ้งเตือน
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700/80 transition-all duration-200"
                >
                  ไม่ ขอบคุณ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}