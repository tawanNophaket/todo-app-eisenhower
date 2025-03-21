import Header from './components/Header';
import NetworkStatus from './components/NetworkStatus';
import NotificationManager from './components/NotificationManager';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import Todo from './components/Todo';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)] pb-24">
      {/* Header */}
      <Header />

      {/* Notification Components */}
      <PwaInstallPrompt />
      <NetworkStatus />
      <NotificationManager />

      <div className="container mx-auto max-w-[var(--max-content-width)] px-4 pt-6">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 relative inline-block">
            <span className="text-gradient-purple">Life Manager</span>
            <svg className="absolute -top-6 -right-10 text-indigo-500 w-10 h-10 animate-pulse opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </h1>
          <p className="text-lg text-indigo-200 max-w-2xl mx-auto">
            จัดการชีวิตให้มีประสิทธิภาพด้วยหลัก Eisenhower Matrix
            แบ่งงานตามความสำคัญและความเร่งด่วน
          </p>
        </div>

        {/* Eisenhower Matrix Quick Guide */}
        <div className="app-card p-5 mb-8 animate-fadeIn">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            เมทริกซ์ไอเซนฮาวร์
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-lg border border-red-500/30 bg-red-900/10">
              <div className="flex items-center mb-2">
                <span className="priority-badge priority-1 mr-2">1</span>
                <h3 className="font-medium text-red-400">ทำทันที</h3>
              </div>
              <p className="text-sm text-gray-300">สำคัญและเร่งด่วน</p>
            </div>

            <div className="p-4 rounded-lg border border-indigo-500/30 bg-indigo-900/10">
              <div className="flex items-center mb-2">
                <span className="priority-badge priority-2 mr-2">2</span>
                <h3 className="font-medium text-indigo-400">วางแผนทำ</h3>
              </div>
              <p className="text-sm text-gray-300">สำคัญแต่ไม่เร่งด่วน</p>
            </div>

            <div className="p-4 rounded-lg border border-amber-500/30 bg-amber-900/10">
              <div className="flex items-center mb-2">
                <span className="priority-badge priority-3 mr-2">3</span>
                <h3 className="font-medium text-amber-400">มอบหมาย</h3>
              </div>
              <p className="text-sm text-gray-300">ไม่สำคัญแต่เร่งด่วน</p>
            </div>

            <div className="p-4 rounded-lg border border-emerald-500/30 bg-emerald-900/10">
              <div className="flex items-center mb-2">
                <span className="priority-badge priority-4 mr-2">4</span>
                <h3 className="font-medium text-emerald-400">ตัดทิ้ง</h3>
              </div>
              <p className="text-sm text-gray-300">ไม่สำคัญและไม่เร่งด่วน</p>
            </div>
          </div>
        </div>

        {/* Todo Component */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">งานของคุณ</h2>
              <p className="text-indigo-200 text-sm">จัดการและติดตามงานด้วย Eisenhower Matrix</p>
            </div>
          </div>

          <Todo />
        </div>

        {/* Features Section */}
        <div className="app-card p-5 mb-10">
          <h2 className="text-xl font-semibold text-gradient-purple mb-5">คุณสมบัติเด่น</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-4 rounded-lg bg-indigo-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-medium text-indigo-300 mb-2">Pomodoro Timer</h3>
              <p className="text-sm text-gray-300">เพิ่มประสิทธิภาพด้วยเทคนิค Pomodoro ในการทำงานแต่ละอย่าง</p>
            </div>

            <div className="p-4 rounded-lg bg-indigo-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-indigo-300 mb-2">ปฏิทินรายงาน</h3>
              <p className="text-sm text-gray-300">ดูงานทั้งหมดในรูปแบบปฏิทิน สามารถวางแผนงานรายวัน รายสัปดาห์</p>
            </div>

            <div className="p-4 rounded-lg bg-indigo-900/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all hover:transform hover:-translate-y-1">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-medium text-indigo-300 mb-2">แจ้งเตือนอัตโนมัติ</h3>
              <p className="text-sm text-gray-300">รับการแจ้งเตือนเมื่อถึงกำหนดเวลาของงาน ไม่พลาดงานสำคัญ</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pb-10">
          <p>Life Manager © 2025 - บริหารชีวิตด้วย Eisenhower Matrix</p>
          <p className="mt-1">พัฒนาด้วย Next.js, React และ TailwindCSS</p>
        </footer>
      </div>
    </main>
  );
}