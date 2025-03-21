import { useEffect, useState } from 'react';
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
  const [showExpand, setShowExpand] = useState(false);

  // ตรวจสอบขนาดหน้าจอ
  useEffect(() => {
    const checkIfMobile = () => {
      const mobileView = window.innerWidth < 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setIsExpanded(false);
      }
      setShowExpand(!mobileView);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // เมื่อโฮเวอร์ให้แสดงปุ่มขยาย
  const handleMouseEnter = () => {
    if (!isMobile) {
      setShowExpand(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isExpanded) {
      setShowExpand(false);
    }
  };

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
    if (completed) return 'border-gray-600';
    if (quadrant === 1) return 'border-red-500';
    if (quadrant === 2) return 'border-indigo-500';
    if (quadrant === 3) return 'border-amber-500';
    if (quadrant === 4) return 'border-emerald-500';
    return 'border-gray-700';
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
      return { name: 'ทำทันที', color: 'text-red-500', bgColor: 'bg-red-500', gradient: 'from-red-500 to-red-600' };
    if (importance === 'high' && urgency === 'low')
      return { name: 'วางแผนทำ', color: 'text-indigo-500', bgColor: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600' };
    if (importance === 'low' && urgency === 'high')
      return { name: 'มอบหมาย', color: 'text-amber-500', bgColor: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' };
    if (importance === 'low' && urgency === 'low')
      return { name: 'ตัดทิ้ง', color: 'text-emerald-500', bgColor: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600' };
    return { name: '', color: 'text-gray-400', bgColor: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' };
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
      return `เลยกำหนด ${diffDays} วัน`;
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
      return 'text-emerald-400';
    }
  };

  if (isEditing) {
    return (
      <div
        id={`todo-${id}`}
        className="glass-card p-5 my-4 shadow-lg animate-fadeIn"
      >
        <h3 className="text-lg font-medium mb-4 text-gradient-purple">แก้ไขรายการ</h3>

        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-800/40 text-white text-sm rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          autoFocus
          placeholder="รายละเอียดงาน..."
        />

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">ประเภทงาน</div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'high' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 'bg-gray-800/40 text-gray-300 border border-gray-700'}`}
            >
              <span className="text-lg">🔥</span>
              <span>ทำทันที</span>
            </button>
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'low' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white' : 'bg-gray-800/40 text-gray-300 border border-gray-700'}`}
            >
              <span className="text-lg">📋</span>
              <span>วางแผนทำ</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'high' ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' : 'bg-gray-800/40 text-gray-300 border border-gray-700'}`}
            >
              <span className="text-lg">⏰</span>
              <span>มอบหมาย</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'low' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white' : 'bg-gray-800/40 text-gray-300 border border-gray-700'}`}
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
            className="w-full p-3 mb-3 bg-gray-800/40 text-white text-sm rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
          />

          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              id={`all-day-${id}`}
              checked={editedIsAllDay}
              onChange={(e) => setEditedIsAllDay(e.target.checked)}
              className="checkbox-custom"
            />
            <label htmlFor={`all-day-${id}`} className="text-sm text-gray-300 ml-2">ทั้งวัน</label>
          </div>

          {!editedIsAllDay && (
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <div className="text-xs text-gray-400 mb-1">เวลาเริ่มต้น</div>
                <input
                  type="time"
                  value={editedStartTime || ''}
                  onChange={(e) => setEditedStartTime(e.target.value)}
                  className="w-full p-3 bg-gray-800/40 text-white text-sm rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">เวลาสิ้นสุด</div>
                <input
                  type="time"
                  value={editedEndTime || ''}
                  onChange={(e) => setEditedEndTime(e.target.value)}
                  className="w-full p-3 bg-gray-800/40 text-white text-sm rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
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

  const quadrantInfo = getQuadrantInfo();

  return (
    <li
      className={`todo-item mb-3 p-3 ${getBorderColor()} ${completed ? 'opacity-75' : ''} ${isSubtask ? 'ml-6' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* ส่วนหัวของรายการ */}
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 gap-3">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => onToggle(id)}
              className="checkbox-custom"
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className={`text-lg font-medium ${completed ? 'line-through text-gray-500' : 'text-white'}`}>
                {text}
              </div>
              {dueDate && !completed && (
                <div className={`text-sm mt-1 font-medium ${getTimeRemainingColor()} flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getTimeRemaining()}
                </div>
              )}
            </div>

            {/* แสดงแท็ก หมวดหมู่ */}
            <div className="flex flex-wrap mt-2 gap-1.5">
              {importance && urgency && (
                <span
                  className={`
                    inline-flex items-center text-xs font-medium mr-1 px-2 py-1 rounded-md 
                    bg-gradient-to-r ${quadrantInfo.gradient} text-white
                  `}
                >
                  {getQuadrantIcon()} {quadrantInfo.name}
                </span>
              )}

              {categories.length > 0 && categories.map((category, index) => (
                <span key={index} className="category-chip text-xs">
                  {category}
                </span>
              ))}

              {tags.length > 0 && tags.map((tag, index) => (
                <span key={index} className="badge-modern text-xs">
                  #{tag}
                </span>
              ))}
            </div>

            {/* แสดงรายละเอียดเมื่อคลิกขยาย */}
            {isExpanded && (
              <div className="mt-3 pl-1 pt-3 border-t border-gray-700/50 text-sm space-y-2 animate-fadeIn">
                {dueDate && (
                  <div className={`${isOverdue() ? 'text-red-400' : 'text-gray-300'}`}>
                    <span className="font-medium mr-1">กำหนด:</span>
                    <span>{formatDate(dueDate)}</span>
                  </div>
                )}

                {reminderDate && (
                  <div className="text-gray-300">
                    <span className="font-medium mr-1">แจ้งเตือน:</span>
                    <span>{formatDate(reminderDate)}</span>
                  </div>
                )}

                {/* แสดงข้อมูลการติดตามเวลา */}
                {(timeSpent > 0 || pomodoroSessions > 0) && (
                  <div className="text-gray-300">
                    <span className="font-medium mr-1">เวลาที่ใช้:</span>
                    <span>{formatTime(timeSpent)}</span>
                    {pomodoroSessions > 0 && (
                      <span className="ml-2 badge-modern">🍅 {pomodoroSessions} Pomodoro</span>
                    )}
                  </div>
                )}

                {/* แสดงคะแนนประสิทธิภาพถ้ามี */}
                {efficiency !== undefined && (
                  <div className="text-gray-300 flex items-center">
                    <span className="font-medium mr-1">ประสิทธิภาพ:</span>
                    <div className="flex items-center">
                      <span className="mr-2">{efficiency}/10</span>
                      <div className="w-20 h-2 bg-gray-700 rounded-full">
                        <div
                          className={`h-2 rounded-full ${efficiency >= 7 ? 'bg-emerald-500' :
                            efficiency >= 4 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${efficiency * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มจัดการ */}
        <div className="flex space-x-1 ml-1">
          <button
            onClick={() => setShowPomodoro(!showPomodoro)}
            className="todo-action-btn"
            aria-label="จับเวลา Pomodoro"
            title="จับเวลา Pomodoro"
          >
            {showPomodoro ? '⏱️' : '🍅'}
          </button>

          {(showExpand || isExpanded) && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="todo-action-btn"
              aria-label={isExpanded ? 'ย่อ' : 'ขยาย'}
              title={isExpanded ? 'ย่อ' : 'ขยาย'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="todo-action-btn"
            aria-label="แก้ไข"
            title="แก้ไข"
          >
            ✏️
          </button>

          {!isSubtask && onAddSubtask && (
            <button
              onClick={() => onAddSubtask(id)}
              className="todo-action-btn"
              aria-label="สร้างงานย่อย"
              title="สร้างงานย่อย"
            >
              📋+
            </button>
          )}

          <button
            onClick={handleDelete}
            className={`todo-action-btn ${isDeleting ? 'bg-red-500/80 text-white' : ''}`}
            aria-label={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
            title={isDeleting ? 'ยืนยันการลบ' : 'ลบ'}
          >
            {isDeleting ? '❌' : '🗑️'}
          </button>
        </div>
      </div>

      {/* แสดงสถานะงานย่อยถ้ามี */}
      {hasChildTasks && (
        <div className="mt-2 ml-4 text-sm flex items-center">
          <span className="inline-flex items-center text-indigo-400 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {subtasks?.length || 0} งานย่อย
          </span>
        </div>
      )}

      {/* แสดง Pomodoro Timer เมื่อคลิกปุ่ม */}
      {showPomodoro && (
        <div className="mt-3 animate-fadeIn">
          <PomodoroTimer
            todoId={id}
            isCompleted={completed}
            onSessionComplete={handlePomodoroComplete}
            onPause={handlePomodoroPause}
          />
        </div>
      )}
    </li>
  );
}