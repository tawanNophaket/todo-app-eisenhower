'use client';

import { useEffect, useState } from 'react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowMessage(true);
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => setShowMessage(false), 300);
      }, 2000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowMessage(true);
      setIsAnimating(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showMessage) return null;

  return (
    <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 
      ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
      <div className={`flex items-center px-4 py-2 rounded-full shadow-lg backdrop-blur-sm
        ${isOnline
          ? 'bg-emerald-500/90 text-white'
          : 'bg-red-500/90 text-white'}`}>
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-white' : 'bg-white'}`}></div>
          <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-white animate-ping opacity-75"></div>
        </div>
        <p className="ml-2 text-sm">
          {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
        </p>
      </div>
    </div>
  );
}