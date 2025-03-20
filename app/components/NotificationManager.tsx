'use client';

import { useEffect, useState } from 'react';
import { 
  isNotificationSupported, 
  requestNotificationPermission, 
  registerServiceWorker 
} from '../utils/notificationManager';

interface NotificationManagerProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export default function NotificationManager({ onPermissionChange }: NotificationManagerProps) {
  const [notificationSupported, setNotificationSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPrompt, setShowPrompt] = useState(false);

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
        setShowPrompt(Notification.permission === 'default');
        
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
  }, [notificationPermission, onPermissionChange]);

  // ขอสิทธิ์การแจ้งเตือน
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    setShowPrompt(false);
  };

  // ปิดการแจ้งเตือนโดยไม่ขอสิทธิ์
  const handleDismissPrompt = () => {
    setShowPrompt(false);
  };

  // ถ้าเบราว์เซอร์ไม่รองรับ หรือไม่ต้องการแสดงการแจ้งเตือนให้ขอสิทธิ์ ให้ไม่แสดงอะไรเลย
  if (!notificationSupported || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-[#1e1e1e] p-4 rounded-lg shadow-lg z-50 border border-[#2d2d2d] animate-fade-in">
      <div className="flex items-start mb-3">
        <div className="mr-3 mt-0.5 text-[#ff6100] flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">เปิดการแจ้งเตือน</h4>
          <p className="text-xs text-gray-300 mb-3">เปิดการแจ้งเตือนเพื่อรับแจ้งเตือนเมื่อใกล้ถึงกำหนดเวลาของรายการ</p>
          <div className="flex space-x-2">
            <button
              onClick={handleRequestPermission}
              className="bg-[#ff6100] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#ff884d] transition-colors duration-200"
            >
              เปิดการแจ้งเตือน
            </button>
            <button
              onClick={handleDismissPrompt}
              className="bg-[#2d2d2d] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#3d3d3d] transition-colors duration-200"
            >
              ไม่ ขอบคุณ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 