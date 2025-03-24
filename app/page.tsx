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

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 pb-10">
          <p>Life Manager © 2025 - บริหารชีวิตด้วย Eisenhower Matrix</p>
          <p className="mt-1">พัฒนาด้วย Next.js, React และ TailwindCSS</p>
        </footer>
      </div>
    </main>
  );
}