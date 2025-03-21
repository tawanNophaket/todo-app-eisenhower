import Image from "next/image";
import Todo from './components/Todo';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import NetworkStatus from './components/NetworkStatus';
import NotificationManager from './components/NotificationManager';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--background-dark)] text-[var(--text-primary)] pb-24 overflow-hidden">
      {/* พื้นหลังแบบ Gradient + Animation */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#ff6100] opacity-[0.03] blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full bg-[#ff6100] opacity-[0.03] blur-[150px] animate-pulse delay-700"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff6100] opacity-[0.02] blur-[80px] animate-floating"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff6100] opacity-[0.02] blur-[80px] animate-floating-reverse"></div>
      </div>
      
      <div className="relative z-10 container mx-auto max-w-[var(--max-content-width)] px-4 pt-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-center md:text-left flex items-center gap-2 justify-center md:justify-start">
              <span className="text-3xl text-[var(--primary-color)] animate-bounce">✨</span>
              Life Manager 
              <span className="text-[var(--primary-color)] relative">
                ระบบจัดการงาน
                <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[var(--primary-color)] animate-shimmer"></span>
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm text-center md:text-left">
              บริหารงานอย่างมีประสิทธิภาพด้วยการจัดลำดับความสำคัญตามความเร่งด่วน
            </p>
          </div>
          
          <div className="flex gap-2 justify-center md:justify-start">
            <PwaInstallPrompt />
            <NetworkStatus />
            <NotificationManager />
          </div>
        </div>
        
        <Todo />
      </div>
    </main>
  );
}
