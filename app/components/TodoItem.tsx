import { useState } from 'react';

interface TodoItemProps {
  id: number;
  text: string;
  completed: boolean;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  dueDate?: string;
  reminderDate?: string;
  quadrant?: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number, newText: string, importance?: 'high' | 'low', urgency?: 'high' | 'low', dueDate?: string, reminderDate?: string) => void;
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
  onToggle, 
  onDelete, 
  onEdit 
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [editedImportance, setEditedImportance] = useState<'high' | 'low'>(importance);
  const [editedUrgency, setEditedUrgency] = useState<'high' | 'low'>(urgency);
  const [editedDueDate, setEditedDueDate] = useState<string | undefined>(dueDate);
  const [editedReminderDate, setEditedReminderDate] = useState<string | undefined>(reminderDate);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    if (editedText.trim() === '') return;
    onEdit(id, editedText, editedImportance, editedUrgency, editedDueDate, editedReminderDate);
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

  return (
    <div 
      id={`todo-${id}`}
      className={`flex flex-col p-4 mb-3 border-l-4 rounded-lg ${getBorderColor()} ${getBackgroundColor()} transition-all duration-200 ${completed ? 'opacity-70' : 'opacity-100'} ${isOverdue() ? 'border-red-500' : ''}`}
    >
      {isEditing ? (
        <div className="flex flex-col w-full space-y-3">
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="flex-1 p-3 border border-[#2d2d2d] rounded bg-[#121212] text-white resize-none min-h-[80px]"
            autoFocus
            placeholder="รายละเอียดงาน..."
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#121212] border border-[#2d2d2d] p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-300 mb-2">กำหนดส่ง:</div>
              <input 
                type="datetime-local" 
                value={editedDueDate || ''} 
                onChange={(e) => setEditedDueDate(e.target.value)}
                className="w-full p-1.5 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#ff6100]"
              />
            </div>
            
            <div className="bg-[#121212] border border-[#2d2d2d] p-3 rounded-lg">
              <div className="text-sm font-medium text-gray-300 mb-2">แจ้งเตือน:</div>
              <input 
                type="datetime-local" 
                value={editedReminderDate || ''} 
                onChange={(e) => setEditedReminderDate(e.target.value)}
                className="w-full p-1.5 bg-[#2d2d2d] text-white text-sm rounded-lg border border-[#3d3d3d] focus:outline-none focus:ring-1 focus:ring-[#ff6100]"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-gray-400">สำคัญ:</span>
                <button
                  onClick={() => setEditedImportance('high')}
                  className={`px-2 py-0.5 text-xs rounded-full ${editedImportance === 'high' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                >
                  ใช่
                </button>
                <button
                  onClick={() => setEditedImportance('low')}
                  className={`px-2 py-0.5 text-xs rounded-full ${editedImportance === 'low' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                >
                  ไม่
                </button>
              </div>
              
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-gray-400">เร่งด่วน:</span>
                <button
                  onClick={() => setEditedUrgency('high')}
                  className={`px-2 py-0.5 text-xs rounded-full ${editedUrgency === 'high' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                >
                  ใช่
                </button>
                <button
                  onClick={() => setEditedUrgency('low')}
                  className={`px-2 py-0.5 text-xs rounded-full ${editedUrgency === 'low' ? 'bg-[#ff6100] text-white' : 'bg-[#2d2d2d] text-gray-300'}`}
                >
                  ไม่
                </button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="px-3 py-1.5 text-white bg-[#ff6100] rounded hover:bg-[#ff884d] font-medium text-sm transition-colors duration-200"
              >
                บันทึก
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-white bg-[#2d2d2d] rounded hover:bg-[#3d3d3d] text-sm transition-colors duration-200"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <div className="mr-3 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() => onToggle(id)}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center mb-1">
                  <span className="text-xs mr-1.5 text-gray-400">{getQuadrantIcon()}</span>
                  <span className={`text-base ${completed ? 'line-through text-gray-400' : 'text-white'} break-words`}>
                    {text}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1 text-xs">
                  <span className={`px-1.5 py-0.5 rounded-full ${importance === 'high' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {importance === 'high' ? '🔴 สำคัญ' : '🟢 ไม่สำคัญ'}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded-full ${urgency === 'high' ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {urgency === 'high' ? '⚡ เร่งด่วน' : '⏱️ ไม่เร่งด่วน'}
                  </span>
                  {dueDate && (
                    <span className={`px-1.5 py-0.5 rounded-full ${isOverdue() ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'}`}>
                      📅 {getTimeRemaining()}
                    </span>
                  )}
                </div>
                {dueDate && (
                  <div className="text-xs text-gray-400 mt-2">
                    กำหนดส่ง: {formatDate(dueDate)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex ml-2 space-x-1">
              <button
                onClick={() => setIsEditing(true)}
                disabled={completed}
                className={`p-1.5 text-white rounded hover:bg-[#2d2d2d] text-xs transition-colors duration-200 ${completed ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="แก้ไข"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className={`p-1.5 rounded text-xs transition-colors duration-200 ${isDeleting ? 'bg-red-600 hover:bg-red-700' : 'text-white hover:bg-[#2d2d2d]'}`}
                title={isDeleting ? 'คลิกอีกครั้งเพื่อยืนยันการลบ' : 'ลบ'}
              >
                {isDeleting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 