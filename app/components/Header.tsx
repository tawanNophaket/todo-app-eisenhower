'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-50 w-full bg-[#111]/90 backdrop-blur-lg border-b border-[#2d2d2d] shadow-md">
      <div className="container mx-auto max-w-[var(--max-content-width)] px-4 h-[var(--header-height)] flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <div className="w-10 h-10 bg-gradient-to-br from-[#ff6100] to-[#ff884d] rounded-lg flex items-center justify-center shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="hidden sm:block">
            <span className="font-semibold text-lg block">Life Manager</span>
            <span className="text-xs text-gray-400">จัดการงานด้วย Eisenhower Matrix</span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-2">
          <Link 
            href="/" 
            className={`app-button py-2 px-4 text-sm ${pathname === '/' ? 'app-button-primary' : 'app-button-secondary'}`}
            title="รายการงาน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span className="hidden sm:inline">รายการงาน</span>
          </Link>
          
          <Link 
            href="/calendar" 
            className={`app-button py-2 px-4 text-sm ${pathname === '/calendar' ? 'app-button-primary' : 'app-button-secondary'}`}
            title="ปฏิทิน"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            <span className="hidden sm:inline">ปฏิทิน</span>
          </Link>
          
          <Link 
            href="/offline" 
            className={`app-button py-2 px-4 text-sm ${pathname === '/offline' ? 'app-button-primary' : 'app-button-secondary'}`}
            title="โหมดออฟไลน์"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
            <span className="hidden sm:inline">ออฟไลน์</span>
          </Link>
        </nav>
      </div>
    </header>
  );
} 
