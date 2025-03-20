'use client';

import { useState } from 'react';

export default function Header() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <div className="mr-2 w-1 h-8 bg-[#ff6100] rounded-full"></div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            บริหาร<span className="text-[#ff6100]">ชีวิต</span>
          </h1>
        </div>
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="w-8 h-8 rounded-full bg-[#1e1e1e] flex items-center justify-center text-[#ff6100]"
        >
          <span className="text-lg font-medium">{showInfo ? '×' : '?'}</span>
        </button>
      </div>
      
      {showInfo && (
        <div className="bg-[#1e1e1e] p-2 rounded-lg mb-3 text-xs border-l-2 border-[#ff6100]">
          <p className="mb-2 leading-relaxed">Eisenhower Matrix ช่วยจัดลำดับความสำคัญงานตาม:</p>
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="flex items-center bg-[#121212] p-1.5 rounded">
              <span className="bg-red-600 w-3 h-3 inline-block mr-1 rounded-sm flex-shrink-0"></span>
              <div>
                <span className="block text-white font-semibold">ทำทันที</span>
                <span className="text-xs text-gray-300">สำคัญ + เร่งด่วน</span>
              </div>
            </div>
            <div className="flex items-center bg-[#121212] p-1.5 rounded">
              <span className="bg-[#ff6100] w-3 h-3 inline-block mr-1 rounded-sm flex-shrink-0"></span>
              <div>
                <span className="block text-white font-semibold">วางแผนทำ</span>
                <span className="text-xs text-gray-300">สำคัญ + ไม่เร่งด่วน</span>
              </div>
            </div>
            <div className="flex items-center bg-[#121212] p-1.5 rounded">
              <span className="bg-yellow-500 w-3 h-3 inline-block mr-1 rounded-sm flex-shrink-0"></span>
              <div>
                <span className="block text-white font-semibold">มอบหมาย</span>
                <span className="text-xs text-gray-300">ไม่สำคัญ + เร่งด่วน</span>
              </div>
            </div>
            <div className="flex items-center bg-[#121212] p-1.5 rounded">
              <span className="bg-green-500 w-3 h-3 inline-block mr-1 rounded-sm flex-shrink-0"></span>
              <div>
                <span className="block text-white font-semibold">ตัดทิ้ง</span>
                <span className="text-xs text-gray-300">ไม่สำคัญ + ไม่เร่งด่วน</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowInfo(false)}
            className="w-full bg-[#2d2d2d] py-1 rounded-sm text-xs text-center text-gray-300 hover:bg-[#3d3d3d]"
          >
            ปิด
          </button>
        </div>
      )}
    </div>
  );
} 
