'use client';

import { memo, useCallback, useEffect, useState } from 'react';
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

function TodoItem({
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
  const [editedCategories, setEditedCategories] = useState<string[]>(categories);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // อัปเดต state เมื่อ props เปลี่ยน
  useEffect(() => {
    setEditedText(text);
    setEditedImportance(importance);
    setEditedUrgency(urgency);
    setEditedDueDate(dueDate);
    setEditedCategories(categories);
  }, [text, importance, urgency, dueDate, categories]);

  // จัดการการแสดงปุ่มควบคุม
  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!isExpanded && !isEditing) {
      setShowControls(false);
    }
  }, [isExpanded, isEditing]);

  // จัดการการแก้ไข
  const handleEdit = useCallback(() => {
    if (editedText.trim() === '') return;
    onEdit(
      id,
      editedText,
      editedImportance,
      editedUrgency,
      editedDueDate,
      reminderDate,
      editedCategories,
      tags,
      startTime,
      endTime,
      isAllDay
    );
    setIsEditing(false);
  }, [editedText, editedImportance, editedUrgency, editedDueDate, reminderDate, editedCategories, tags, startTime, endTime, isAllDay, id, onEdit]);

  // จัดการการลบ
  const handleDelete = useCallback(() => {
    if (isDeleting) {
      onDelete(id);
    } else {
      setIsDeleting(true);
      setTimeout(() => {
        setIsDeleting(false);
      }, 2000);
    }
  }, [isDeleting, id, onDelete]);

  // จัดการการจับเวลา Pomodoro
  const handlePomodoroComplete = useCallback((todoId: number, sessionTime: number) => {
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
  }, [id, text, importance, urgency, dueDate, reminderDate, categories, tags, startTime, endTime, isAllDay, timeSpent, pomodoroSessions, efficiency, onEdit]);

  // จัดการการหยุดจับเวลา Pomodoro
  const handlePomodoroPause = useCallback((todoId: number, elapsedTime: number) => {
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
  }, [id, text, importance, urgency, dueDate, reminderDate, categories, tags, startTime, endTime, isAllDay, timeSpent, pomodoroSessions, efficiency, onEdit]);

  // กำหนดสีขอบตามประเภทงาน
  const getBorderColor = useCallback(() => {
    if (completed) return 'border-gray-600';
    if (quadrant === 1) return 'border-[var(--priority-1)]';
    if (quadrant === 2) return 'border-[var(--priority-2)]';
    if (quadrant === 3) return 'border-[var(--priority-3)]';
    if (quadrant === 4) return 'border-[var(--priority-4)]';
    return 'border-gray-700';
  }, [completed, quadrant]);

  // ไอคอนประเภทงาน
  const getQuadrantIcon = useCallback(() => {
    if (quadrant === 1) return '🔥';
    if (quadrant === 2) return '📋';
    if (quadrant === 3) return '⏰';
    if (quadrant === 4) return '🍃';
    return '';
  }, [quadrant]);

  // สีและชื่อตามประเภทงาน
  const getQuadrantInfo = useCallback(() => {
    if (importance === 'high' && urgency === 'high')
      return { name: 'ทำทันที', color: 'text-[var(--priority-1)]', bgColor: 'bg-[var(--priority-1)]', gradient: 'from-[var(--priority-1)] to-[var(--priority-1)]' };
    if (importance === 'high' && urgency === 'low')
      return { name: 'วางแผนทำ', color: 'text-[var(--priority-2)]', bgColor: 'bg-[var(--priority-2)]', gradient: 'from-[var(--priority-2)] to-[var(--priority-2)]' };
    if (importance === 'low' && urgency === 'high')
      return { name: 'มอบหมาย', color: 'text-[var(--priority-3)]', bgColor: 'bg-[var(--priority-3)]', gradient: 'from-[var(--priority-3)] to-[var(--priority-3)]' };
    if (importance === 'low' && urgency === 'low')
      return { name: 'ตัดทิ้ง', color: 'text-[var(--priority-4)]', bgColor: 'bg-[var(--priority-4)]', gradient: 'from-[var(--priority-4)] to-[var(--priority-4)]' };
    return { name: '', color: 'text-gray-400', bgColor: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' };
  }, [importance, urgency]);

  // แปลงเวลาเป็นรูปแบบที่อ่านง่าย
  const formatTime = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds} วินาที`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} นาที`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ชั่วโมง ${remainingMinutes > 0 ? `${remainingMinutes} นาที` : ''}`;
  }, []);

  // แปลงวันที่เป็นรูปแบบที่อ่านง่าย
  const formatDate = useCallback((dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // ตรวจสอบว่าวันที่เลยกำหนดหรือไม่
  const isOverdue = useCallback(() => {
    if (!dueDate || completed) return false;
    return new Date(dueDate) < new Date();
  }, [dueDate, completed]);

  // คำนวณเวลาที่เหลือ
  const getTimeRemaining = useCallback(() => {
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
  }, [dueDate, completed]);

  // กำหนดสีของเวลาที่เหลือตามความเร่งด่วน
  const getTimeRemainingColor = useCallback(() => {
    if (!dueDate) return '';
    const now = new Date();
    const due = new Date(dueDate);

    if (due < now && !completed) {
      return 'text-[var(--priority-1)]';
    }

    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        return 'text-[var(--priority-1)]';
      }
      return 'text-[var(--priority-3)]';
    } else if (diffDays <= 3) {
      return 'text-[var(--priority-3)]';
    } else {
      return 'text-[var(--priority-4)]';
    }
  }, [dueDate, completed]);

  // หากกำลังแก้ไข ให้แสดงฟอร์มแก้ไข
  if (isEditing) {
    return (
      <div
        id={`todo-${id}`}
        className="app-card p-4 my-3 shadow-lg animate-fadeIn"
      >
        <h3 className="text-lg font-medium mb-4 text-gradient-purple">แก้ไขรายการ</h3>

        <input
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full p-3 mb-4 bg-[var(--gray-medium)] text-white text-sm rounded-lg border border-[var(--gray-light)] focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
          autoFocus
          placeholder="รายละเอียดงาน..."
        />

        <div className="mb-4">
          <div className="text-sm font-medium text-gray-300 mb-2">ประเภทงาน</div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'high'
                ? 'bg-gradient-to-br from-[var(--priority-1)] to-[var(--priority-1)] text-white'
                : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
            >
              <span className="text-lg">🔥</span>
              <span>ทำทันที</span>
            </button>
            <button
              onClick={() => { setEditedImportance('high'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'high' && editedUrgency === 'low'
                ? 'bg-gradient-to-br from-[var(--priority-2)] to-[var(--priority-2)] text-white'
                : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
            >
              <span className="text-lg">📋</span>
              <span>วางแผนทำ</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('high'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'high'
                ? 'bg-gradient-to-br from-[var(--priority-3)] to-[var(--priority-3)] text-white'
                : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
            >
              <span className="text-lg">⏰</span>
              <span>มอบหมาย</span>
            </button>
            <button
              onClick={() => { setEditedImportance('low'); setEditedUrgency('low'); }}
              className={`p-2.5 text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${editedImportance === 'low' && editedUrgency === 'low'
                ? 'bg-gradient-to-br from-[var(--priority-4)] to-[var(--priority-4)] text-white'
                : 'bg-[var(--gray-medium)] text-gray-300 border border-[var(--gray-light)]'}`}
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
            className="w-full p-3 mb-3 bg-[var(--gray-medium)] text-white text-sm rounded-lg border border-[var(--gray-light)] focus:border-[var(--primary-color)] focus:ring-1 focus:ring-[var(--primary-color)] outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleEdit}
            className="app-button app-button-primary flex-1 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            บันทึก
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="app-button app-button-secondary px-4 py-3 flex items-center justify-center gap-2"
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

              {categories.length > 0 && categories.slice(0, 2).map((category, index) => (
                <span key={index} className="category-chip text-xs">
                  {category}
                </span>
              ))}

              {categories.length > 2 && (
                <span className="category-chip text-xs">
                  +{categories.length - 2}
                </span>
              )}
            </div>

            {/* แสดงรายละเอียดเมื่อคลิกขยาย */}
            {isExpanded && (
              <div className="mt-3 pl-1 pt-3 border-t border-gray-700/50 text-sm space-y-2 animate-fadeIn">
                {dueDate && (
                  <div className={`${isOverdue() ? 'text-[var(--priority-1)]' : 'text-gray-300'}`}>
                    <span className="font-medium mr-1">กำหนด:</span>
                    <span>{formatDate(dueDate)}</span>
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
                          className={`h-2 rounded-full ${efficiency >= 7 ? 'bg-[var(--priority-4)]' :
                            efficiency >= 4 ? 'bg-[var(--priority-3)]' : 'bg-[var(--priority-1)]'
                            }`}
                          style={{ width: `${efficiency * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* แสดงรายละเอียดหมวดหมู่ */}
                {categories.length > 0 && (
                  <div className="text-gray-300">
                    <span className="font-medium mr-1">หมวดหมู่:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {categories.map((category, index) => (
                        <span key={index} className="category-chip text-xs">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มจัดการ */}
        <div className={`flex space-x-1 ml-1 transition-opacity duration-200 ${showControls ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
          <button
            onClick={() => setShowPomodoro(!showPomodoro)}
            className="todo-action-btn"
            aria-label="จับเวลา Pomodoro"
            title="จับเวลา Pomodoro"
          >
            {showPomodoro ? '⏱️' : '🍅'}
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="todo-action-btn"
            aria-label={isExpanded ? 'ย่อ' : 'ขยาย'}
            title={isExpanded ? 'ย่อ' : 'ขยาย'}
          >
            {isExpanded ? '▲' : '▼'}
          </button>

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
            className={`todo-action-btn ${isDeleting ? 'bg-[var(--priority-1)]/80 text-white' : ''}`}
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
          <span className="inline-flex items-center text-[var(--primary-color)] font-medium">
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

// ใช้ memo เพื่อป้องกันการเรนเดอร์ซ้ำที่ไม่จำเป็น
export default memo(TodoItem);