'use client';

import { useEffect, useState } from 'react';

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
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // ตรวจสอบว่าเป็น iOS หรือไม่
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIos(isIosDevice);

    // ตรวจสอบว่าแอพถูกติดตั้งแล้วหรือไม่
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    // ตรวจสอบว่าเคยปฏิเสธการติดตั้งไปแล้วหรือไม่
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');

    // ระยะเวลาตั้งแต่ปฏิเสธครั้งล่าสุด - 7 วัน
    const dismissedLongEnough = !hasDismissed ||
      (Date.now() - parseInt(hasDismissed)) > 7 * 24 * 60 * 60 * 1000;

    // จัดการการณ์ beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // ป้องกันไม่ให้โพรมต์ของเบราว์เซอร์แสดงอัตโนมัติ
      e.preventDefault();

      // เก็บกิจกรรมไว้เพื่อให้สามารถใช้ภายหลัง
      setInstallPrompt(e);

      // แสดงโพรมต์ของเราเองหากยังไม่เคยปฏิเสธหรือเวลาผ่านไปนานพอ
      if (dismissedLongEnough) {
        // รอให้แอพโหลดเสร็จก่อนแสดง prompt
        setTimeout(() => {
          setShowPrompt(true);
          setIsAnimating(true);
        }, 3000);
      }
    };

    // เพิ่ม event listener หากแอพยังไม่ได้ติดตั้ง
    if (!isStandalone) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

      // สำหรับ iOS ให้แสดงหลังจากรอสักครู่
      if (isIosDevice && dismissedLongEnough && !isStandalone) {
        setTimeout(() => {
          setShowPrompt(true);
          setIsAnimating(true);
        }, 3000);
      }
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
    setIsAnimating(false);

    // รอให้ animation เสร็จก่อนซ่อน
    setTimeout(() => {
      setShowPrompt(false);
    }, 300);

    // บันทึกข้อมูลการติดตั้ง (สำหรับการวิเคราะห์)
    console.log('User choice:', choiceResult.outcome);
  };

  // ปิดการแจ้งเตือนแต่ไม่ติดตั้ง
  const handleDismiss = () => {
    setIsAnimating(false);

    // รอให้ animation เสร็จก่อนซ่อน
    setTimeout(() => {
      setShowPrompt(false);
    }, 300);

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
      <div className={`fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 transition-all duration-300
        ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="relative overflow-hidden app-card border border-indigo-500/20 p-4 rounded-xl shadow-lg">
          {/* พื้นหลังแบบ gradient ที่เคลื่อนไหว */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 background-animate"></div>

          <div className="relative z-10">
            <div className="flex items-start mb-3">
              <div className="flex-shrink-0 bg-indigo-500/20 p-2 rounded-xl mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gradient-purple mb-1">ติดตั้งลงหน้าจอหลัก</h4>
                <p className="text-xs text-gray-300 mb-2">วิธีติดตั้งบน iOS:</p>
                <ol className="text-xs text-gray-300 ml-4 list-decimal mb-3 space-y-1">
                  <li>แตะที่ไอคอนแชร์ <span className="bg-gray-800 px-1 py-0.5 rounded inline-flex items-center"><svg className="w-3 h-3" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 10V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7l-5 3v1h16v-1l-5-3zM4 16l4-2.5 4 2.5v1H4v-1z"></path></svg></span></li>
                  <li>เลื่อนลงและแตะ "เพิ่มไปยังหน้าจอหลัก"</li>
                  <li>แตะ "เพิ่ม"</li>
                </ol>
                <button
                  onClick={handleDismiss}
                  className="bg-gray-800/80 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-700/80 transition-all duration-200 shadow hover:shadow-lg hover:-translate-y-0.5"
                >
                  เข้าใจแล้ว
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // สำหรับ Android และเบราว์เซอร์ที่สนับสนุน
  return (
    <div className={`fixed bottom-4 right-4 left-4 md:left-auto md:w-80 z-50 transition-all duration-300
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <div className="relative overflow-hidden app-card border border-indigo-500/20 p-4 rounded-xl shadow-lg">
        {/* พื้นหลังแบบ gradient ที่เคลื่อนไหว */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 background-animate"></div>

        <div className="relative z-10">
          <div className="flex items-start mb-3">
            <div className="flex-shrink-0 bg-indigo-500/20 p-2 rounded-xl mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gradient-purple mb-1">ติดตั้งแอพลงมือถือ</h4>
              <p className="text-xs text-gray-300 mb-3">ติดตั้งเป็นแอพเพื่อการใช้งานที่ดีขึ้น ไม่ต้องเปิดเบราว์เซอร์</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInstall}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
                >
                  ติดตั้ง
                </button>
                <button
                  onClick={handleDismiss}
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