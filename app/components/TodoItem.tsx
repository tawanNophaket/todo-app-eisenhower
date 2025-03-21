import { useState, useEffect } from 'react';

interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  dueDate?: string;
  reminderDate?: string;
  quadrant?: number;
  categories: string[];
  tags: string[];
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[], startTime?: string, endTime?: string, isAllDay?: boolean) => void;
}

export default function TodoItem({ 
  id, 
  text, 
  completed, 
  importance, 
  urgency, 
  dueDate,
  reminderDate,
  quadrant = 0,
  categories = [],
  tags = [],
  startTime,
  endTime,
  isAllDay = false,
  onToggle, 
  onDelete, 
  onEdit 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [editedImportance, setEditedImportance] = useState<'high' | 'low'>(importance);
  const [editedUrgency, setEditedUrgency] = useState<'high' | 'low'>(urgency);
  const [editedDueDate, setEditedDueDate] = useState<string | undefined>(dueDate);
  const [editedReminderDate, setEditedReminderDate] = useState<string | undefined>(reminderDate);
  const [editedCategories, setEditedCategories] = useState<string[]>(categories);
  const [editedTags, setEditedTags] = useState<string[]>(tags);
  const [editedStartTime, setEditedStartTime] = useState<string | undefined>(startTime);
  const [editedEndTime, setEditedEndTime] = useState<string | undefined>(endTime);
  const [editedIsAllDay, setEditedIsAllDay] = useState<boolean>(isAllDay);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ตรวจสอบขนาดหน้าจอเมื่อโหลดครั้งแรกและเมื่อขนาดหน้าจอเปลี่ยนแปลง
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // ตรวจสอบขนาดหน้าจอเมื่อโหลดครั้งแรก
    checkIfMobile();
    
    // ตรวจสอบขนาดหน้าจอเมื่อขนาดหน้าจอเปลี่ยนแปลง
    window.addEventListener('resize', checkIfMobile);
    
    // เก็บกวาดเมื่อ unmount
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleEdit = () => {
    if (editedText.trim() === '') return;
    onEdit(
      id, 
      editedText, 
      editedImportance, 
      editedUrgency, 
      editedDueDate, 
      editedReminderDate,
      editedCategories,
      editedTags,
      editedStartTime,
      editedEndTime,
      editedIsAllDay
    );
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (isDeleting) {
      onDelete(id);
    } else {
      setIsDeleting(true);
      setTimeout(() => {
        setIsDeleting(false);
      }, 2000);
    }
  };

  // กำหนดสีของกรอบตามประเภทของงาน
  const getBorderColor = () => {
    if (quadrant === 1) return 'border-red-500';
    if (quadrant === 2) return 'border-[#ff6100]';
    if (quadrant === 3) return 'border-yellow-500';
    if (quadrant === 4) return 'border-green-500';
    return 'border-gray-700';
  };

  // สีพื้นหลังที่แตกต่างกันเล็กน้อยเพื่อความสวยงาม
  const getBackgroundColor = () => {
    if (completed) return 'bg-[#191919]';
    return 'bg-[#1e1e1e]';
  };

  // สัญลักษณ์ที่แสดงในแต่ละประเภทงาน
  const getQuadrantIcon = () => {
    if (quadrant === 1) return '🔥';
    if (quadrant === 2) return '📋';
    if (quadrant === 3) return '⏰';
    if (quadrant === 4) return '🍃';
    return '';
  };

  // สีและชื่อตามความสำคัญและความเร่งด่วน
  const getQuadrantInfo = () => {
    if (importance === 'high' && urgency === 'high') 
      return { name: 'ทำทันที', color: 'text-red-500', bgColor: 'bg-red-500', gradient: 'from-red-500 to-red-700' };
    if (importance === 'high' && urgency === 'low') 
      return { name: 'วางแผนทำ', color: 'text-[#ff6100]', bgColor: 'bg-[#ff6100]', gradient: 'from-[#ff6100] to-[#cc4d00]' };
    if (importance === 'low' && urgency === 'high') 
      return { name: 'มอบหมาย', color: 'text-yellow-500', bgColor: 'bg-yellow-500', gradient: 'from-yellow-500 to-yellow-700' };
    if (importance === 'low' && urgency === 'low') 
      return { name: 'ตัดทิ้ง', color: 'text-green-500', bgColor: 'bg-green-500', gradient: 'from-green-500 to-green-700' };
    return { name: '', color: 'text-gray-400', bgColor: 'bg-gray-500', gradient: 'from-gray-500 to-gray-700' };
  };

  // ฟอร์แมตวันที่ให้อ่านง่าย
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ตรวจสอบว่าเลยกำหนดหรือไม่
  const isOverdue = () => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  };

  // คำนวณเวลาที่เหลือ
  const getTimeRemaining = () => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now && !completed) {
      return 'เลยกำหนดแล้ว';
    }
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `อีก ${diffMinutes} นาที`;
      }
      return `อีก ${diffHours} ชั่วโมง`;
    } else if (diffDays === 1) {
      return 'พรุ่งนี้';
    } else {
      return `อีก ${diffDays} วัน`;
    }
  };

  // จัดการกับการเพิ่ม/ลบหมวดหมู่
  const toggleCategory = (category: string) => {
    if (editedCategories.includes(category)) {
      setEditedCategories(editedCategories.filter(c => c !== category));
    } else {
      setEditedCategories([...editedCategories, category]);
    }
  };

  // จัดการกับการเพิ่ม/ลบแท็ก
  const toggleTag = (tag: string) => {
    if (editedTags.includes(tag)) {
      setEditedTags(editedTags.filter(t => t !== tag));
    } else {
      setEditedTags([...editedTags, tag]);
    }
  };

  const quadrantInfo = getQuadrantInfo();

  if (isEditing) {
    return (
      <div 
        id={`todo-${id}`}
        className="glass-card p-5 my-4 shadow-lg animate-fadeIn"
      >
        <h3 className="text-lg font-medium mb-4 text-gradient">แก้ไขรายการ</h3>
        
        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-3 mb-4 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
          autoFocus
          placeholder="รายละเอียดงาน..."
        />
        
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">ประเภทงาน</div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'high' ? 'bg-gradient-to-br from-red-500 to-red-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
            >
              <span className="text-lg">🔥</span>
              <span>ทำทันที</span>
            </button>
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'low' ? 'bg-gradient-to-br from-[#ff6100] to-[#cc4d00] text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
            >
              <span className="text-lg">📋</span>
              <span>วางแผนทำ</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'high' ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
            >
              <span className="text-lg">⏰</span>
              <span>มอบหมาย</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'low' ? 'bg-gradient-to-br from-green-500 to-green-700 text-white' : 'bg-[#2d2d2d] text-gray-300 border border-[#3d3d3d]'}`}
            >
              <span className="text-lg">🍃</span>
              <span>ตัดทิ้ง</span>
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">วันที่และเวลา</div>
          <input 
            type="datetime-local" 
            value={editedDueDate || ''} 
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="w-full p-3 mb-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
          />
          
          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id={`all-day-${id}`}
              checked={editedIsAllDay}
              onChange={(e) => setEditedIsAllDay(e.target.checked)}
              className="w-4 h-4 mr-2 accent-[#ff6100]"
            />
            <label htmlFor={`all-day-${id}`} className="text-sm text-gray-300">ทั้งวัน</label>
          </div>
          
          {!editedIsAllDay && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">เวลาเริ่มต้น</div>
                <input
                  type="time"
                  value={editedStartTime || ''}
                  onChange={(e) => setEditedStartTime(e.target.value)}
                  className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">เวลาสิ้นสุด</div>
                <input
                  type="time"
                  value={editedEndTime || ''}
                  onChange={(e) => setEditedEndTime(e.target.value)}
                  className="w-full p-3 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:border-[#ff6100] focus:ring-1 focus:ring-[#ff6100] outline-none transition-all"
                />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleEdit}
            className="btn-modern flex-1 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            บันทึก
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn-secondary px-4 py-3 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`todo-${id}`}
      className={`card p-3.5 my-3 ${getBorderColor()} ${completed ? 'opacity-70' : 'opacity-100'} ${isOverdue() ? 'border-red-400' : ''} bg-shine relative overflow-hidden animate-fadeIn transition-all duration-300 hover:translate-y-[-2px]`}
      onClick={() => !isMobile && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center gap-3 relative z-10">
        <div className="relative">
          <input
            type="checkbox"
            checked={completed}
            onChange={() => onToggle(id)}
            className="peer w-5 h-5 cursor-pointer accent-[#ff6100] rounded-md transition-all duration-200"
          />
          <span className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 transition-transform peer-checked:scale-100 
                            text-white text-xs duration-200 ease-out scale-on-press`}>
            ✓
          </span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-6 h-6 rounded-full ${quadrantInfo.bgColor} bg-opacity-20 flex items-center justify-center`}>
              <span className="text-xs" title={quadrantInfo.name}>{getQuadrantIcon()}</span>
            </div>
            <span className={`text-xs font-medium ${quadrantInfo.color}`}>{quadrantInfo.name}</span>
            
            {isOverdue() && (
              <span className="ml-auto text-xs bg-red-500 bg-opacity-20 text-red-400 px-2 py-0.5 rounded-full flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                เลยกำหนด
              </span>
            )}
          </div>
          
          <div className={`text-sm font-medium ${completed ? 'line-through text-gray-500' : 'text-white'} break-words`}>
            {text}
          </div>
          
          {/* แสดงรายละเอียดทั้งหมดสำหรับมือถือ หรือเมื่อกดขยายบนจอใหญ่ */}
          {(isMobile || isExpanded) && (
            <div className="mt-3 text-xs space-y-2 bg-[#1a1a1a] p-2.5 rounded-lg animate-fadeIn">
              {dueDate && (
                <div className={`flex items-center ${isOverdue() ? 'text-red-400' : 'text-gray-400'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>
                    {formatDate(dueDate)} 
                    {isAllDay ? ' (ทั้งวัน)' : startTime && endTime ? ` (${startTime.substring(0, 5)}-${endTime.substring(0, 5)})` : ` (${getTimeRemaining()})`}
                  </span>
                </div>
              )}
              
              {/* แสดงหมวดหมู่และแท็ก */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center text-gray-400 min-w-full mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span>หมวดหมู่:</span>
                  </div>
                  {categories.map(category => {
                    if (typeof category !== 'string') return null;
                    return (
                      <span 
                        key={typeof category === 'string' ? category : `category-${Math.random()}`}
                        className="inline-flex items-center px-2 py-1 bg-[#2a2a2a] hover:bg-[#333333] text-gray-300 rounded-full text-xs transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {typeof category === 'string' ? category : ''}
                      </span>
                    );
                  })}
                </div>
              )}
              
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center text-gray-400 min-w-full mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                    <span>แท็ก:</span>
                  </div>
                  {tags.map(tag => {
                    if (typeof tag !== 'string') return null;
                    return (
                      <span 
                        key={typeof tag === 'string' ? tag : `tag-${Math.random()}`}
                        className="inline-flex items-center px-2 py-1 bg-[#1f2937] hover:bg-[#2a3647] text-blue-300 rounded-full text-xs transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                        {typeof tag === 'string' ? tag : ''}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          {!isMobile && !isExpanded && (dueDate || categories.length > 0 || tags.length > 0) && (
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {dueDate && (
                <span className={`flex items-center ${isOverdue() ? 'text-red-400' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isAllDay ? 'ทั้งวัน' : getTimeRemaining()}
                </span>
              )}
              
              {categories.length > 0 && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {categories[0]}{categories.length > 1 ? ` +${categories.length - 1}` : ''}
                </span>
              )}
              
              {tags.length > 0 && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  {tags.length}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-2 flex space-x-2">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            disabled={completed}
            className={`p-2 rounded-full hover:bg-[#2d2d2d] transition-colors ${completed ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover-pulse'}`}
            title="แก้ไข"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className={`p-2 rounded-full hover:bg-[#2d2d2d] transition-colors ${isDeleting ? 'bg-red-500' : ''} hover-pulse`}
            title={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
          >
            {isDeleting ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* ปุ่มขยาย/ย่อสำหรับจอใหญ่เท่านั้น (ไม่แสดงบนมือถือ) */}
      {!isMobile && (dueDate || categories.length > 0 || tags.length > 0) && !isExpanded && (
        <div className="flex justify-center mt-2">
          <button className="text-xs text-gray-400 flex items-center hover:text-[#ff6100] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            แสดงเพิ่มเติม
          </button>
        </div>
      )}
      {!isMobile && (dueDate || categories.length > 0 || tags.length > 0) && isExpanded && (
        <div className="flex justify-center mt-2">
          <button className="text-xs text-gray-400 flex items-center hover:text-[#ff6100] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            ซ่อนข้อมูล
          </button>
        </div>
      )}
    </div>
  );
} 