export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-[#121212] max-w-md w-full p-8 rounded-xl text-center">
        <div className="mb-6 text-[#ff6100]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m-3.536-3.536a3 3 0 010-5.656m-6.364 5.656a9 9 0 010-12.728m3.536 3.536a3 3 0 010 5.656M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">อยู่ในโหมดออฟไลน์</h1>
        <p className="text-gray-300 mb-6">
          คุณกำลังใช้งานในโหมดออฟไลน์ รายการที่คุณเพิ่มจะถูกบันทึกในเครื่องและซิงค์เมื่อมีการเชื่อมต่ออินเทอร์เน็ต
        </p>
        
        <div className="mb-6">
          <div className="w-full bg-[#1e1e1e] h-2 rounded-full">
            <div className="bg-[#ff6100] h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
          <div className="text-xs text-gray-400 mt-2">กำลังรอการเชื่อมต่อ...</div>
        </div>
        
        <a 
          href="/"
          className="inline-block bg-[#ff6100] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#ff884d] transition-colors"
        >
          ลองโหลดใหม่
        </a>
      </div>
    </div>
  );
} 