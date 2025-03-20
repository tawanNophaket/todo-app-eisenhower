'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    'beforeinstallprompt': BeforeInstallPromptEvent;
  }
}

export default function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ตรวจสอบว่าเป็น iOS หรือไม่
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIos(isIosDevice);
    
    // ตรวจสอบว่าแอพถูกติดตั้งแล้วหรือไม่
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;

    // จัดการการณ์ beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // ป้องกันไม่ให้โพรมต์ของเบราว์เซอร์แสดงอัตโนมัติ
      e.preventDefault();
      // เก็บกิจกรรมไว้เพื่อให้สามารถใช้ภายหลัง
      setInstallPrompt(e);
      // แสดงโพรมต์ของเราเอง
      setShowPrompt(true);
    };

    // เพิ่ม event listener หากแอพยังไม่ได้ติดตั้ง
    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    }

    // ลบ event listener เมื่อคอมโพเนนต์ unmounts
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  // จัดการการติดตั้ง PWA
  const handleInstall = async () => {
    if (!installPrompt) return;
    
    // แสดงข้อความโพรมต์การติดตั้ง
    installPrompt.prompt();
    
    // รอผลลัพธ์จากการเลือกของผู้ใช้
    const choiceResult = await installPrompt.userChoice;
    
    // รีเซ็ต installPrompt ไม่ว่าผู้ใช้จะเลือกยอมรับหรือปฏิเสธ
    setInstallPrompt(null);
    setShowPrompt(false);
    
    // บันทึกข้อมูลการติดตั้ง (สำหรับการวิเคราะห์)
    console.log('User choice:', choiceResult.outcome);
  };

  // ปิดการแจ้งเตือนแต่ไม่ติดตั้ง
  const handleDismiss = () => {
    setShowPrompt(false);
    // บันทึกการปฏิเสธในเซสชันเพื่อไม่แสดงซ้ำ
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // ถ้าไม่ต้องการแสดงการแจ้งเตือน ให้ไม่แสดงอะไรเลย
  if (!showPrompt) {
    return null;
  }

  // สำหรับ iOS เราต้องแสดงคำแนะนำพิเศษเพราะ beforeinstallprompt ไม่ทำงานบน iOS
  if (isIos) {
    return (
      <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-[#1e1e1e] p-4 rounded-lg shadow-lg z-50 border border-[#2d2d2d] animate-fade-in">
        <div className="flex items-start mb-3">
          <div className="mr-3 mt-0.5 text-[#ff6100] flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-white mb-1">ติดตั้งลงหน้าจอหลัก</h4>
            <p className="text-xs text-gray-300 mb-2">วิธีติดตั้งบน iOS:</p>
            <ol className="text-xs text-gray-300 ml-4 list-decimal mb-3">
              <li>แตะที่ไอคอนแชร์</li>
              <li>เลื่อนลงและแตะ "เพิ่มไปยังหน้าจอหลัก"</li>
              <li>แตะ "เพิ่ม"</li>
            </ol>
            <button
              onClick={handleDismiss}
              className="bg-[#2d2d2d] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#3d3d3d] transition-colors duration-200"
            >
              ปิดข้อความนี้
            </button>
          </div>
        </div>
      </div>
    );
  }

  // สำหรับ Android และเบราว์เซอร์ที่สนับสนุน
  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-80 bg-[#1e1e1e] p-4 rounded-lg shadow-lg z-50 border border-[#2d2d2d] animate-fade-in">
      <div className="flex items-start mb-3">
        <div className="mr-3 mt-0.5 text-[#ff6100] flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white mb-1">ติดตั้งแอพลงมือถือ</h4>
          <p className="text-xs text-gray-300 mb-3">ติดตั้งเป็นแอพเพื่อการใช้งานที่ดีขึ้น ไม่ต้องเปิดเบราว์เซอร์</p>
          <div className="flex space-x-2">
            <button
              onClick={handleInstall}
              className="bg-[#ff6100] text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-[#ff884d] transition-colors duration-200"
            >
              ติดตั้ง
            </button>
            <button
              onClick={handleDismiss}
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