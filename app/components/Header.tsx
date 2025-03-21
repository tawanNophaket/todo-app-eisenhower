'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // ตรวจจับการเลื่อนหน้าเพื่อเปลี่ยนการแสดงผลของ header
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full ${scrolled ? 'bg-[var(--background-dark)]/90' : 'bg-transparent'} backdrop-blur-sm transition-all duration-200`}>
      <div className="container mx-auto max-w-[var(--max-content-width)] px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-white font-semibold">
          Life Manager
        </Link>

        <nav className="flex items-center">
          <Link
            href="/"
            className={`mx-1 p-2 rounded-md ${pathname === '/' ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' : 'text-white/80'}`}
            title="รายการงาน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </Link>

          <Link
            href="/calendar"
            className={`mx-1 p-2 rounded-md ${pathname === '/calendar' ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' : 'text-white/80'}`}
            title="ปฏิทิน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </Link>

          <Link
            href="/offline"
            className={`mx-1 p-2 rounded-md ${pathname === '/offline' ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)]' : 'text-white/80'}`}
            title="ข้อมูลออฟไลน์"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Link>
        </nav>
      </div>
    </header>
  );
}