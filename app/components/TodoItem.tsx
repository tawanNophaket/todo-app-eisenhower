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
    if (quadrant === 1) return '📌';
    if (quadrant === 2) return '📝';
    if (quadrant === 3) return '📢';
    if (quadrant === 4) return '⏭️';
    return '';
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

  if (isEditing) {
    return (
      <div 
        id={`todo-${id}`}
        className="bg-[#1e1e1e] p-3 my-2 rounded-lg shadow"
      >
        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-2 mb-2 bg-[#2d2d2d] text-white text-sm rounded border-none"
          autoFocus
          placeholder="รายละเอียดงาน..."
        />
        
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => { setEditedImportance('high'); setEditedUrgency('high'); }}
            className={`px-2 py-1 text-xs rounded ${editedImportance === 'high' && editedUrgency === 'high' ? 'bg-red-600 text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
          >
            ทำทันที
          </button>
          <button
            onClick={() => { setEditedImportance('high'); setEditedUrgency('low'); }}
            className={`px-2 py-1 text-xs rounded ${editedImportance === 'high' && editedUrgency === 'low' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
          >
            วางแผนทำ
          </button>
          <button
            onClick={() => { setEditedImportance('low'); setEditedUrgency('high'); }}
            className={`px-2 py-1 text-xs rounded ${editedImportance === 'low' && editedUrgency === 'high' ? 'bg-yellow-500 text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
          >
            มอบหมาย
          </button>
          <button
            onClick={() => { setEditedImportance('low'); setEditedUrgency('low'); }}
            className={`px-2 py-1 text-xs rounded ${editedImportance === 'low' && editedUrgency === 'low' ? 'bg-green-500 text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
          >
            ตัดทิ้ง
          </button>
        </div>
        
        <div className="mb-2">
          <div className="text-xs text-gray-400 mb-1">วันที่ครบกำหนด:</div>
          <input 
            type="datetime-local" 
            value={editedDueDate || ''} 
            onChange={(e) => setEditedDueDate(e.target.value)}
            className="w-full p-2 mb-2 bg-[#2d2d2d] text-white text-xs rounded border-none"
          />
          
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={editedIsAllDay}
              onChange={(e) => setEditedIsAllDay(e.target.checked)}
              className="mr-2"
            />
            <span className="text-xs text-gray-400">ทั้งวัน</span>
          </div>
          
          {!editedIsAllDay && (
            <>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <div className="text-xs text-gray-400 mb-1">เวลาเริ่มต้น:</div>
                  <input
                    type="time"
                    value={editedStartTime || ''}
                    onChange={(e) => setEditedStartTime(e.target.value)}
                    className="w-full p-2 bg-[#2d2d2d] text-white text-xs rounded border-none"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">เวลาสิ้นสุด:</div>
                  <input
                    type="time"
                    value={editedEndTime || ''}
                    onChange={(e) => setEditedEndTime(e.target.value)}
                    className="w-full p-2 bg-[#2d2d2d] text-white text-xs rounded border-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 px-3 py-1.5 text-white bg-[#ff6100] rounded font-medium text-sm"
          >
            บันทึก
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 text-white bg-[#2d2d2d] rounded text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      id={`todo-${id}`}
      className={`p-2 my-2 rounded-lg ${getBorderColor()} ${getBackgroundColor()} transition-all duration-200 border-l-4 ${completed ? 'opacity-70' : 'opacity-100'} ${isOverdue() ? 'border-red-500' : ''}`}
      onClick={() => !isMobile && setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center">
        <div className="mr-2" onClick={(e) => { e.stopPropagation(); onToggle(id); }}>
          <input
            type="checkbox"
            checked={completed}
            onChange={() => {}}
            className="w-5 h-5 cursor-pointer"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={`text-sm ${completed ? 'line-through text-gray-400' : 'text-white'} break-words`}>
            {text}
          </div>
          
          {/* แสดงรายละเอียดทั้งหมดสำหรับมือถือ หรือเมื่อกดขยายบนจอใหญ่ */}
          {(isMobile || isExpanded) ? (
            <>
              {dueDate && (
                <div className={`text-xs mt-1 ${isOverdue() ? 'text-red-400' : 'text-gray-400'}`}>
                  <span className="mr-1">📅</span>
                  {formatDate(dueDate)} 
                  {isAllDay ? ' (ทั้งวัน)' : startTime && endTime ? ` (${startTime.substring(0, 5)}-${endTime.substring(0, 5)})` : ` (${getTimeRemaining()})`}
                </div>
              )}
              
              {/* แสดงหมวดหมู่และแท็ก */}
              {(categories.length > 0 || tags.length > 0) && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {categories.map(category => {
                    if (typeof category !== 'string') return null;
                    return (
                      <span 
                        key={typeof category === 'string' ? category : `category-${Math.random()}`}
                        className="inline-block px-1.5 py-0.5 bg-[#262626] text-gray-300 rounded text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {typeof category === 'string' ? category : ''}
                      </span>
                    );
                  })}
                  
                  {tags.map(tag => {
                    if (typeof tag !== 'string') return null;
                    return (
                      <span 
                        key={typeof tag === 'string' ? tag : `tag-${Math.random()}`}
                        className="inline-block px-1.5 py-0.5 bg-[#1f2937] text-blue-300 rounded text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{typeof tag === 'string' ? tag : ''}
                      </span>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center mt-1">
              {dueDate && (
                <span className={`text-xs mr-2 ${isOverdue() ? 'text-red-400' : 'text-gray-400'}`}>
                  <span className="mr-1">📅</span>
                  {isAllDay ? 'ทั้งวัน' : getTimeRemaining()}
                </span>
              )}
              
              {categories.length > 0 && (
                <span className="text-xs text-gray-400">
                  {categories[0]}{categories.length > 1 ? ` +${categories.length - 1}` : ''}
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="ml-2 flex space-x-1">
          <button
            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
            disabled={completed}
            className="p-1.5 text-white rounded hover:bg-[#2d2d2d] text-xs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(); }}
            className={`p-1.5 rounded text-xs ${isDeleting ? 'bg-red-600' : ''}`}
          >
            {isDeleting ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" fill="none">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* ปุ่มขยาย/ย่อสำหรับจอใหญ่เท่านั้น (ไม่แสดงบนมือถือ) */}
      {!isMobile && (dueDate || categories.length > 0 || tags.length > 0) && !isExpanded && (
        <div className="flex justify-center mt-1">
          <button className="text-xs text-gray-400">แสดงเพิ่มเติม</button>
        </div>
      )}
    </div>
  );
} 