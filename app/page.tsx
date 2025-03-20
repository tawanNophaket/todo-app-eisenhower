import Image from "next/image";
import Todo from './components/Todo';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import NetworkStatus from './components/NetworkStatus';

export default function Home() {
  return (
    <div className="min-h-screen bg-black py-4 px-2 sm:px-4 md:py-8 relative">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full opacity-40 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#ff6100] opacity-[0.025] blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#ff6100] opacity-[0.025] blur-[150px]"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#ff6100] opacity-[0.02] blur-[80px]"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff6100] opacity-[0.02] blur-[80px]"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <Todo />
        <PwaInstallPrompt />
        <NetworkStatus />
        
        <footer className="text-center text-gray-500 text-xs mt-8 mb-4">
          <div className="flex items-center justify-center mb-1">
            <div className="bg-[#ff6100] w-4 h-0.5 mr-2"></div>
            <p>พัฒนาด้วย Next.js, React และ TailwindCSS</p>
            <div className="bg-[#ff6100] w-4 h-0.5 ml-2"></div>
          </div>
          <p className="text-xs text-[#ff6100]">EISENHOWER MATRIX</p>
          <p className="max-w-xs mx-auto mt-1 text-gray-600">
            หลักการ Eisenhower Matrix ช่วยให้คุณจัดลำดับความสำคัญของงานได้อย่างมีประสิทธิภาพ
          </p>
        </footer>
      </div>
    </div>
  );
}
