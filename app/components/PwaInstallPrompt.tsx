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

    // ระยะเวลาตั้งแต่ปฏิเสธครั้งล่าสุด - 3 วัน
    const dismissedLongEnough = !hasDismissed ||
      (Date.now() - parseInt(hasDismissed)) > 3 * 24 * 60 * 60 * 1000;

    // จัดการการณ์ beforeinstallprompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);

      if (dismissedLongEnough) {
        setTimeout(() => {
          setShowPrompt(true);
          setIsAnimating(true);
        }, 2000);
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
        }, 2000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  // จัดการการติดตั้ง PWA
  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const choiceResult = await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsAnimating(false);

    setTimeout(() => {
      setShowPrompt(false);
    }, 300);
  };

  // ปิดการแจ้งเตือน
  const handleDismiss = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPrompt(false);
    }, 300);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className="bg-[var(--card-bg)] p-3 rounded-full shadow-lg border border-[var(--border-color)] flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--primary-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>

        <span className="text-sm text-white">
          {isIos ? 'เพิ่มเข้าหน้าจอหลัก' : 'ติดตั้งแอปนี้'}
        </span>

        {!isIos && (
          <button
            onClick={handleInstall}
            className="bg-[var(--primary-color)] text-white text-xs px-2 py-1 rounded-full"
          >
            ติดตั้ง
          </button>
        )}

        <button
          onClick={handleDismiss}
          className="text-white text-lg leading-none ml-1"
        >
          ×
        </button>
      </div>
    </div>
  );
}