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

      <div className="container mx-auto max-w-[var(--max-content-width)] px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 relative inline-block">
            <span className="text-gradient-purple">Life Manager</span>
            <svg className="absolute -top-6 -right-10 text-indigo-500 w-8 h-8 sm:w-10 sm:h-10 animate-pulse opacity-75" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
          </h1>
          <p className="text-base sm:text-lg text-indigo-200 max-w-2xl mx-auto px-2">
            จัดการชีวิตให้มีประสิทธิภาพด้วยหลัก Eisenhower Matrix
            แบ่งงานตามความสำคัญและความเร่งด่วน
          </p>
          
          {/* คำแนะนำการใช้งานการแจ้งเตือน */}
          <div className="mt-4 app-card mx-auto max-w-2xl p-4 text-left text-sm sm:text-base">
            <h3 className="text-base sm:text-lg font-semibold text-gradient-purple mb-3">วิธีการเปิดใช้งานการแจ้งเตือน</h3>
            <p className="mb-2 text-indigo-100">เพื่อให้ได้รับการแจ้งเตือนเมื่อถึงกำหนดเวลาของรายการงานที่สำคัญ:</p>
            <ol className="list-decimal pl-5 space-y-2 text-indigo-200">
              <li>เมื่อเข้าใช้งานครั้งแรก ระบบจะขออนุญาตแจ้งเตือน กด <span className="text-white font-medium">"เปิดการแจ้งเตือน"</span></li>
              <li>ยอมรับการขออนุญาตจากเบราว์เซอร์ของคุณ</li>
              <li>หากต้องการทดสอบว่าการแจ้งเตือนทำงานได้ถูกต้อง ให้กดที่ปุ่มไอคอนการแจ้งเตือนที่มุมขวาล่าง</li>
              <li>หากไม่สามารถรับการแจ้งเตือนได้ ให้ตรวจสอบการตั้งค่าของเบราว์เซอร์เพื่ออนุญาตการแจ้งเตือน</li>
            </ol>
            <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/20">
              <p className="text-xs sm:text-sm flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>สำหรับอุปกรณ์มือถือ: คุณจะได้รับการแจ้งเตือนแม้เมื่อไม่ได้เปิดแอปพลิเคชัน ถ้าติดตั้งเป็น PWA (Progressive Web App) และอนุญาตการแจ้งเตือน</span>
              </p>
            </div>
          </div>
        </div>

        {/* Todo Component */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 px-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">งานของคุณ</h2>
              <p className="text-xs sm:text-sm text-indigo-200">จัดการและติดตามงานด้วย Eisenhower Matrix</p>
            </div>
          </div>

          <Todo />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs sm:text-sm text-gray-500 pb-6 sm:pb-10 mt-6">
          <p>Life Manager © 2025 - บริหารชีวิตด้วย Eisenhower Matrix</p>
          <p className="mt-1">พัฒนาด้วย Next.js, React และ TailwindCSS</p>
        </footer>
      </div>
    </main>
  );
}