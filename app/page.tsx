import Image from "next/image";
import Todo from './components/Todo';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import NotificationManager from './components/NotificationManager';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)] pb-24">
      <div className="container mx-auto max-w-[var(--max-content-width)] px-4 pt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-center sm:text-left">
            Life Manager <span className="text-[var(--primary-color)]">ระบบจัดการงาน</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm text-center sm:text-left">
            จัดการงานให้มีประสิทธิภาพด้วยหลัก Eisenhower Matrix แบ่งลำดับความสำคัญตามความเร่งด่วน
          </p>
        </div>
      
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <div className="mb-4 p-4 bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[var(--primary-color)] rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold">รายการงานของคุณ</h2>
                  <p className="text-xs text-[var(--text-tertiary)]">จัดการและติดตามงานทั้งหมดของคุณที่นี่</p>
                </div>
              </div>
            </div>
            <Todo />
          </div>
          
          <div className="md:col-span-4 space-y-6">
            <div className="app-card p-5">
              <h2 className="text-lg font-medium mb-4 border-l-4 border-[var(--primary-color)] pl-3">เกี่ยวกับ Eisenhower Matrix</h2>
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-secondary)]">
                  Eisenhower Matrix ช่วยจัดลำดับความสำคัญงานตามหลักเกณฑ์ 2 ประการ คือ ความสำคัญ (Importance) และความเร่งด่วน (Urgency)
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="app-card p-3 !bg-[#1e1e1e] flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">1</span>
                      <span className="font-medium text-sm">ทำทันที</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">สำคัญ + เร่งด่วน</p>
                  </div>
                  
                  <div className="app-card p-3 !bg-[#1e1e1e] flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#ff6100] flex items-center justify-center text-white">2</span>
                      <span className="font-medium text-sm">วางแผนทำ</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">สำคัญ + ไม่เร่งด่วน</p>
                  </div>
                  
                  <div className="app-card p-3 !bg-[#1e1e1e] flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white">3</span>
                      <span className="font-medium text-sm">มอบหมาย</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">ไม่สำคัญ + เร่งด่วน</p>
                  </div>
                  
                  <div className="app-card p-3 !bg-[#1e1e1e] flex flex-col gap-2 transition-transform hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">4</span>
                      <span className="font-medium text-sm">ตัดทิ้ง</span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">ไม่สำคัญ + ไม่เร่งด่วน</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="app-card p-5">
              <h2 className="text-lg font-medium mb-4 border-l-4 border-[var(--primary-color)] pl-3">ตั้งค่าแอปพลิเคชัน</h2>
              <div className="space-y-4">
                <div className="bg-[#1e1e1e] p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    ติดตั้งแอป
                  </h3>
                  <PwaInstallPrompt />
                </div>
                
                <div className="bg-[#1e1e1e] p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                    สถานะเครือข่าย
                  </h3>
                  <NetworkStatus />
                </div>
                
                <div className="bg-[#1e1e1e] p-3 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--primary-color)]" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    การแจ้งเตือน
                  </h3>
                  <NotificationManager />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
