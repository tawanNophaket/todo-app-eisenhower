import { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';

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
  timeSpent?: number;
  pomodoroSessions?: number;
  efficiency?: number;
  lastPomodoroDate?: string;
  parentId?: number;
  subtasks?: number[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string, categories?: string[], tags?: string[], startTime?: string, endTime?: string, isAllDay?: boolean, timeSpent?: number, pomodoroSessions?: number, efficiency?: number, lastPomodoroDate?: string) => void;
  onAddSubtask?: (parentId: number) => void;
  hasChildTasks?: boolean;
  isSubtask?: boolean;
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
  timeSpent = 0,
  pomodoroSessions = 0,
  efficiency,
  lastPomodoroDate,
  parentId,
  subtasks = [],
  onToggle, 
  onDelete, 
  onEdit,
  onAddSubtask,
  hasChildTasks = false,
  isSubtask = false
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPomodoro, setShowPomodoro] = useState(false);
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

  // กำหนดสถานะของงานตามความสำคัญและความเร่งด่วน
  const isImportantUrgent = importance === 'high' && urgency === 'high';
  const isImportantNotUrgent = importance === 'high' && urgency === 'low';
  const isNotImportantUrgent = importance === 'low' && urgency === 'high';
  const isNotImportantNotUrgent = importance === 'low' && urgency === 'low';

  // ตรวจสอบขนาดหน้าจอเมื่อโหลดครั้งแรกและเมื่อขนาดหน้าจอเปลี่ยนแปลง
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setIsExpanded(true); // เปิดขยายอัตโนมัติสำหรับมือถือ
      }
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

  // จัดการเมื่อ Pomodoro เสร็จสิ้น
  const handlePomodoroComplete = (todoId: number, sessionTime: number) => {
    onEdit(
      id,
      text,
      importance,
      urgency,
      dueDate,
      reminderDate,
      categories,
      tags,
      startTime,
      endTime,
      isAllDay,
      (timeSpent || 0) + sessionTime,
      (pomodoroSessions || 0) + 1,
      efficiency,
      new Date().toISOString()
    );
  };

  // จัดการเมื่อหยุด Pomodoro
  const handlePomodoroPause = (todoId: number, elapsedTime: number) => {
    if (elapsedTime > 0) {
      onEdit(
        id,
        text,
        importance,
        urgency,
        dueDate,
        reminderDate,
        categories,
        tags,
        startTime,
        endTime,
        isAllDay,
        (timeSpent || 0) + elapsedTime,
        pomodoroSessions,
        efficiency,
        new Date().toISOString()
      );
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

  // ฟอร์แมตเวลาในรูปแบบที่อ่านง่าย
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} วินาที`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาที`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ชั่วโมง ${remainingMinutes} นาที`;
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
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now && !completed) {
      const diffDays = Math.round((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
      return `เลยกำหนดแล้ว ${diffDays} วัน`;
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
    } else if (diffDays <= 3) {
      return `อีก ${diffDays} วัน`;
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
  const timeRemaining = dueDate ? getTimeRemaining() : '';

  // ฟังก์ชั่นเพื่อกำหนดสีของเวลาที่เหลือตามความเร่งด่วน
  const getTimeRemainingColor = () => {
    if (!dueDate) return '';
    
    const now = new Date();
    const due = new Date(dueDate);
    
    if (due < now && !completed) {
      return 'text-red-500';
    }
    
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        return 'text-red-500';
      }
      return 'text-amber-500';
    } else if (diffDays <= 3) {
      return 'text-amber-400';
    } else {
      return 'text-green-400';
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
    <li className={`mb-3 p-3 rounded-lg border-l-4 ${getBorderColor()} ${getBackgroundColor()} transition-all duration-200 shadow-lg ${isSubtask ? 'ml-6' : ''}`}>
      {/* ส่วนหัวของรายการ */}
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div>
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(id)}
              className="mr-3 form-checkbox h-5 w-5 text-green-500 rounded focus:ring-0 focus:ring-offset-0 focus:ring-transparent"
            />
          </div>
          <div className="flex-1">
            {!isEditing ? (
              <div className="flex flex-col">
                <div className={`text-lg ${completed ? 'line-through text-gray-500' : ''}`}>
                  {text}
                </div>
                {dueDate && !completed && (
                  <div className={`text-sm ${getTimeRemainingColor()}`}>
                    {getTimeRemaining()}
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-2">
                <input
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full p-1 mb-2 bg-gray-800 border border-gray-600 rounded-md"
                  autoFocus
                />
              </div>
            )}
            
            {/* แสดงแท็ก หมวดหมู่ และวันที่กำหนด */}
            <div className="flex flex-wrap mt-1 gap-1">
              {importance && urgency && !isEditing && (
                <span 
                  className={`
                    inline-flex items-center text-xs font-medium mr-1 px-2 py-0.5 rounded-md 
                    bg-gradient-to-b ${getQuadrantInfo().gradient}
                  `}
                >
                  {getQuadrantIcon()} {getQuadrantInfo().name}
                </span>
              )}
              
              {categories.length > 0 && !isEditing && categories.map((category, index) => (
                <span key={index} className="bg-blue-800 text-blue-100 text-xs font-medium mr-1 px-2 py-0.5 rounded">
                  {category}
                </span>
              ))}
              
              {tags.length > 0 && !isEditing && tags.map((tag, index) => (
                <span key={index} className="bg-gray-700 text-gray-200 text-xs font-medium mr-1 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
            
            {/* แสดงรายละเอียดวันที่และเวลา */}
            <div className="text-sm mt-1">
              {isExpanded && (
                <>
                  {dueDate && (
                    <div className={`mt-1 ${isOverdue() ? 'text-red-400' : 'text-gray-400'}`}>
                      <span className="font-medium mr-1">กำหนด:</span>
                      <span>{formatDate(dueDate)}</span>
                      {isOverdue() && !completed && (
                        <span className="ml-2 text-red-500 font-medium">
                          {getTimeRemaining()}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {reminderDate && (
                    <div className="mt-1 text-gray-400">
                      <span className="font-medium mr-1">แจ้งเตือน:</span>
                      <span>{formatDate(reminderDate)}</span>
                    </div>
                  )}
                  
                  {/* แสดงข้อมูลการติดตามเวลา */}
                  {(timeSpent > 0 || pomodoroSessions > 0) && (
                    <div className="mt-1 text-gray-400">
                      <span className="font-medium mr-1">เวลาที่ใช้:</span>
                      <span>{formatTime(timeSpent)}</span>
                      {pomodoroSessions > 0 && (
                        <span className="ml-2">({pomodoroSessions} Pomodoro)</span>
                      )}
                    </div>
                  )}
                  
                  {/* แสดงคะแนนประสิทธิภาพถ้ามี */}
                  {efficiency !== undefined && (
                    <div className="mt-1 text-gray-400 flex items-center">
                      <span className="font-medium mr-1">ประสิทธิภาพ:</span>
                      <div className="flex items-center">
                        <span className="mr-1">{efficiency}/10</span>
                        <div className="w-20 h-2 bg-gray-700 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              efficiency >= 7 ? 'bg-green-500' : 
                              efficiency >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${efficiency * 10}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {lastPomodoroDate && (
                    <div className="mt-1 text-gray-400">
                      <span className="font-medium mr-1">Pomodoro ล่าสุด:</span>
                      <span>{new Date(lastPomodoroDate).toLocaleDateString('th-TH')}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* ปุ่มจัดการ */}
        <div className="flex space-x-2 ml-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setShowPomodoro(!showPomodoro)} 
                className="text-blue-400 hover:text-blue-300"
                aria-label="จับเวลา Pomodoro"
                title="จับเวลา Pomodoro"
              >
                {showPomodoro ? '⏱️' : '🍅'}
              </button>
              {!isMobile && (
                <button 
                  onClick={() => setIsExpanded(!isExpanded)} 
                  className="text-gray-400 hover:text-white"
                  aria-label={isExpanded ? 'ย่อ' : 'ขยาย'}
                  title={isExpanded ? 'ย่อ' : 'ขยาย'}
                >
                  {isExpanded ? '▲' : '▼'}
                </button>
              )}
              <button 
                onClick={() => setIsEditing(true)} 
                className="text-yellow-400 hover:text-yellow-300"
                aria-label="แก้ไข"
                title="แก้ไข"
              >
                ✏️
              </button>
              {!isSubtask && onAddSubtask && (
                <button 
                  onClick={() => onAddSubtask(id)} 
                  className="text-green-400 hover:text-green-300"
                  aria-label="สร้างงานย่อย"
                  title="สร้างงานย่อย"
                >
                  📋+
                </button>
              )}
              <button 
                onClick={handleDelete} 
                className={`${isDeleting ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                aria-label={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
                title={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
              >
                {isDeleting ? '❌' : '🗑️'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEdit} 
                className="text-green-400 hover:text-green-300"
                aria-label="บันทึก"
                title="บันทึก"
              >
                ✅
              </button>
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(text);
                  setEditedImportance(importance);
                  setEditedUrgency(urgency);
                  setEditedDueDate(dueDate);
                  setEditedReminderDate(reminderDate);
                  setEditedCategories(categories);
                  setEditedTags(tags);
                }} 
                className="text-red-400 hover:text-red-300"
                aria-label="ยกเลิก"
                title="ยกเลิก"
              >
                ❌
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* แสดง Pomodoro Timer เมื่อคลิกปุ่ม */}
      {showPomodoro && (
        <div className="mt-3">
          <PomodoroTimer 
            todoId={id} 
            isCompleted={completed}
            onSessionComplete={handlePomodoroComplete}
            onPause={handlePomodoroPause}
          />
        </div>
      )}
      
      {/* แสดงฟอร์มแก้ไขเมื่อคลิกปุ่มแก้ไข */}
      {isEditing && (
        <div className="mt-3 space-y-2">
          {/* ส่วนเลือกความสำคัญ */}
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
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
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
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
        </div>
      )}

      {/* แสดงสถานะงานย่อยถ้ามี */}
      {hasChildTasks && (
        <div className="mt-2 ml-4 text-sm text-blue-400">
          มี {subtasks?.length || 0} งานย่อย
        </div>
      )}
    </li>
  );
} 