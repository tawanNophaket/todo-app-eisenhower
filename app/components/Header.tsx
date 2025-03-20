'use client';

import { useState } from 'react';

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center">
          <div className="mr-4 w-1.5 h-12 bg-[#ff6100] rounded-full"></div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              บริหาร<span className="text-[#ff6100]">ชีวิต</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1">จัดการงานและเวลาด้วย Eisenhower Matrix</p>
          </div>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[#ff6100] hover:bg-[#2d2d2d] transition-colors duration-300 hover-glow"
        >
          <span className="text-lg font-medium">{showInfo ? '×' : '?'}</span>
        </button>
      </div>
      
      {showInfo && (
        <div className="bg-[#1e1e1e] p-5 rounded-lg mb-6 animate-fade-in text-sm border-l-4 border-[#ff6100]">
          <h2 className="font-bold text-[#ff6100] mb-4 text-xl">วิธีใช้ Eisenhower Matrix</h2>
          <p className="mb-4 leading-relaxed">Eisenhower Matrix ช่วยให้คุณจัดลำดับความสำคัญของงานตามความสำคัญและความเร่งด่วน เพื่อเพิ่มประสิทธิภาพในการบริหารเวลาของคุณ:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="flex items-start bg-[#121212] p-3 rounded">
              <span className="bg-red-600 w-5 h-5 inline-block mr-3 rounded-sm mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold block text-white text-base mb-1">ทำทันที</span>
                <span className="text-sm text-gray-300">งานที่ทั้งสำคัญและเร่งด่วน ควรจัดการก่อนเป็นอันดับแรก ไม่ควรผัดผ่อน</span>
              </div>
            </div>
            <div className="flex items-start bg-[#121212] p-3 rounded">
              <span className="bg-[#ff6100] w-5 h-5 inline-block mr-3 rounded-sm mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold block text-white text-base mb-1">วางแผนทำ</span>
                <span className="text-sm text-gray-300">งานที่สำคัญแต่ไม่เร่งด่วน ควรวางแผนเวลาทำอย่างชัดเจน เพราะมีผลต่อเป้าหมายระยะยาว</span>
              </div>
            </div>
            <div className="flex items-start bg-[#121212] p-3 rounded">
              <span className="bg-yellow-500 w-5 h-5 inline-block mr-3 rounded-sm mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold block text-white text-base mb-1">มอบหมาย</span>
                <span className="text-sm text-gray-300">งานที่เร่งด่วนแต่ไม่สำคัญ ควรมอบหมายให้ผู้อื่นหรือทำให้เสร็จเร็ว ลดเวลาที่ต้องใช้ให้น้อยที่สุด</span>
              </div>
            </div>
            <div className="flex items-start bg-[#121212] p-3 rounded">
              <span className="bg-green-500 w-5 h-5 inline-block mr-3 rounded-sm mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold block text-white text-base mb-1">ตัดทิ้ง</span>
                <span className="text-sm text-gray-300">งานที่ไม่สำคัญและไม่เร่งด่วน ควรตัดทิ้งหรือลดความสำคัญลง เพราะมักทำให้เสียเวลาโดยเปล่าประโยชน์</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-400 bg-[#121212] p-3 rounded flex items-center flex-wrap">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#ff6100] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1">นอกจากคลิกที่ช่องสี่เหลี่ยมเพื่อดูรายการในแต่ละหมวดหมู่แล้ว คุณยังสามารถคลิกปุ่ม + เพื่อเพิ่มรายการใหม่ในหมวดนั้นๆ ได้โดยตรง</span>
          </div>
        </div>
      )}
    </div>
  );
} 