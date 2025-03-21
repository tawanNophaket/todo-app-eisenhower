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
      
        <div className="w-full">
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
      </div>
    </main>
  );
}
