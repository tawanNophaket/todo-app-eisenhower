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
    if (quadrant === 1) return 'priority_high';
    if (quadrant === 2) return 'event_note';
    if (quadrant === 3) return 'schedule';
    if (quadrant === 4) return 'spa';
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
      return { text: 'เลยกำหนดแล้ว', status: 'overdue', diff: (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24) };
    }
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return { text: `อีก ${diffMinutes} นาที`, status: 'urgent', value: diffMinutes, unit: 'minute' };
      }
      return { text: `อีก ${diffHours} ชั่วโมง`, status: 'soon', value: diffHours, unit: 'hour' };
    } else if (diffDays === 1) {
      return { text: 'พรุ่งนี้', status: 'tomorrow', value: 1, unit: 'day' };
    } else if (diffDays <= 3) {
      return { text: `อีก ${diffDays} วัน`, status: 'upcoming', value: diffDays, unit: 'day' };
    } else {
      return { text: `อีก ${diffDays} วัน`, status: 'future', value: diffDays, unit: 'day' };
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
  const timeRemaining = dueDate ? getTimeRemaining() : null;

  // ฟังก์ชั่นเพื่อกำหนดสีของเวลาที่เหลือตามความเร่งด่วน
  const getTimeRemainingColor = () => {
    if (!timeRemaining) return '';
    
    switch (timeRemaining.status) {
      case 'overdue':
        return 'text-red-500 font-semibold';
      case 'urgent':
        return 'text-red-400 font-semibold';
      case 'soon':
        return 'text-yellow-500 font-semibold';
      case 'tomorrow':
        return 'text-amber-400 font-semibold';
      case 'upcoming':
        return 'text-blue-400 font-semibold';
      case 'future':
        return 'text-gray-400 font-semibold';
      default:
        return 'text-gray-400';
    }
  };

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
      className={`relative w-full mb-3 p-3 rounded-lg border-l-4 ${getBorderColor()} transition-all shadow-md ${getBackgroundColor()} ${completed ? 'opacity-70' : 'hover:bg-[#222]'} todo-item hover-lift`}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start flex-1 gap-3 min-w-0">
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(id)}
              className="w-5 h-5 rounded-full bg-[#2d2d2d] border-[#3d3d3d] checked:bg-[#ff6100] checked:border-[#ff6100] focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`flex flex-col ${completed ? 'line-through text-gray-500' : ''}`}>
              <p className="text-sm font-medium break-words">{text}</p>
            </div>
            
            <div className="flex flex-wrap mt-2 gap-2">
              {importance && urgency && (
                <div className={`rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 ${completed ? 'bg-[#2a2a2a] text-gray-400' : `bg-gradient-to-r ${quadrantInfo.gradient} text-white`}`}>
                  <span className="material-symbols-rounded text-sm">{getQuadrantIcon()}</span>
                  <span>{quadrantInfo.name}</span>
                </div>
              )}
              
              {timeRemaining && (
                <div className={`bg-[#2a2a2a] rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1.5 ${getTimeRemainingColor()}`}>
                  <span className="material-symbols-rounded text-sm">timer</span>
                  <span>{timeRemaining.text}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap mt-2 gap-2">
              {dueDate && (
                <div className="bg-[#2a2a2a] rounded-full px-3 py-1 text-xs flex items-center gap-1.5 text-gray-300">
                  <span className="material-symbols-rounded text-sm">calendar_today</span>
                  <span>{formatDate(dueDate)}</span>
                </div>
              )}
              
              {categories.length > 0 && (
                <div className="bg-[#2a2a2a] rounded-full px-3 py-1 text-xs flex items-center gap-1.5 text-gray-300">
                  <span className="material-symbols-rounded text-sm">folder</span>
                  <span>{categories.join(', ')}</span>
                </div>
              )}
              
              {tags.length > 0 && (
                <div className="bg-[#2a2a2a] rounded-full px-3 py-1 text-xs flex items-center gap-1.5 text-gray-300">
                  <span className="material-symbols-rounded text-sm">tag</span>
                  <span>{tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs p-2 bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white rounded-lg transition-colors flex items-center justify-center"
            title="แก้ไข"
          >
            <span className="material-symbols-rounded">edit</span>
          </button>
          <button
            onClick={handleDelete}
            className={`text-xs p-2 ${isDeleting ? 'bg-red-600 text-white' : 'bg-[#2d2d2d] text-gray-300 hover:bg-[#3d3d3d] hover:text-white'} rounded-lg transition-colors flex items-center justify-center`}
            title={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
          >
            <span className="material-symbols-rounded">{isDeleting ? 'check' : 'delete'}</span>
          </button>
        </div>
      </div>
      
      {timeRemaining && (timeRemaining.status === 'overdue' || timeRemaining.status === 'urgent' || timeRemaining.status === 'soon') && (
        <div className="mt-2 pt-2 border-t border-[#3d3d3d]">
          <div className={`text-sm font-medium flex items-center gap-2 ${getTimeRemainingColor()}`}>
            <span className="material-symbols-rounded">
              {timeRemaining.status === 'overdue' ? 'warning' : 'alarm'}
            </span>
            <span>
              {timeRemaining.status === 'overdue' ? 
                `เลยกำหนดมาแล้ว ${Math.ceil(timeRemaining.diff || 0)} วัน` :
                `เหลือเวลาอีก ${timeRemaining.value} ${timeRemaining.unit === 'minute' ? 'นาที' : timeRemaining.unit === 'hour' ? 'ชั่วโมง' : 'วัน'}`
              }
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 