export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[var(--background-dark)] flex flex-col items-center justify-center p-4">
      <div className="app-card max-w-md w-full p-8 rounded-2xl text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl opacity-30 animate-pulse"></div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-indigo-400 relative animate-float" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a3 3 0 010-5.656m-6.364 5.656a9 9 0 010-12.728m3.536 3.536a3 3 0 010 5.656M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gradient-purple mb-4">อยู่ในโหมดออฟไลน์</h1>
        <p className="text-indigo-200 mb-6">
          คุณกำลังใช้งานในโหมดออฟไลน์ รายการที่คุณเพิ่มจะถูกบันทึกในเครื่องและซิงค์เมื่อมีการเชื่อมต่ออินเทอร์เน็ต
        </p>

        <div className="mb-8">
          <div className="w-full h-2 rounded-full bg-indigo-900/30 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full relative animate-pulse">
              <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-indigo-300/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          <div className="text-xs text-indigo-300 mt-2 flex justify-center items-center">
            <span className="animate-pulse w-2 h-2 bg-indigo-400 rounded-full mr-2"></span>
            กำลังรอการเชื่อมต่อ...
          </div>
        </div>

        <div className="space-y-4">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5"
          >
            ลองโหลดใหม่
          </a>

          <div className="text-indigo-300 text-sm pt-4">
            <p className="mb-2">สิ่งที่คุณสามารถทำได้ในโหมดออฟไลน์:</p>
            <ul className="text-xs text-indigo-200/70 space-y-1">
              <li>• ดูรายการงานที่บันทึกไว้แล้ว</li>
              <li>• เพิ่มรายการงานใหม่</li>
              <li>• แก้ไขหรือลบรายการเดิม</li>
              <li>• ใช้ฟีเจอร์ Pomodoro Timer</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}