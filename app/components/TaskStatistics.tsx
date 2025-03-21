'use client';

import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
Chart.register(...registerables);

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  importance: 'high' | 'low';
  urgency: 'high' | 'low';
  categories: string[];
  timeSpent?: number;
  pomodoroSessions?: number;
  efficiency?: number;
}

interface TaskStatisticsProps {
  todos: Todo[];
  onRateEfficiency: (todoId: number, efficiency: number) => void;
}

export default function TaskStatistics({ todos, onRateEfficiency }: TaskStatisticsProps) {
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [efficiencyRating, setEfficiencyRating] = useState(5);

  // คำนวณสถิติ
  useEffect(() => {
    // คำนวณรวม
    let total = 0;
    let pomodoros = 0;

    todos.forEach(todo => {
      total += todo.timeSpent || 0;
      pomodoros += todo.pomodoroSessions || 0;
    });

    setTotalTimeSpent(total);
    setCompletedPomodoros(pomodoros);

    // สร้างแผนภูมิสถิติถ้ามีข้อมูล
    const trackedTodos = getTrackedTodos();
    if (trackedTodos.length > 0) {
      createChart(trackedTodos);
    }
  }, [todos]);

  // สร้างแผนภูมิ
  const createChart = (trackedTodos: Todo[]) => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const canvas = document.getElementById('timeChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // จัดเตรียมข้อมูลสำหรับแผนภูมิ
    const chartData = trackedTodos.map(todo => ({
      todoName: todo.text.length > 15 ? todo.text.substring(0, 15) + '...' : todo.text,
      timeSpent: Math.round((todo.timeSpent || 0) / 60), // แปลงเป็นนาที
      completed: todo.completed
    }));

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(item => item.todoName),
        datasets: [
          {
            label: 'เวลาที่ใช้ (นาที)',
            data: chartData.map(item => item.timeSpent),
            backgroundColor: chartData.map(item =>
              item.completed ? 'rgba(75, 192, 192, 0.7)' : 'rgba(153, 102, 255, 0.7)'
            ),
            borderColor: chartData.map(item =>
              item.completed ? 'rgba(75, 192, 192, 1)' : 'rgba(153, 102, 255, 1)'
            ),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'เวลา (นาที)'
            }
          }
        }
      }
    });

    setChartInstance(newChart);
  };

  // แปลงเวลาให้อ่านง่าย
  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} ชั่วโมง ${minutes} นาที`;
    }
    return `${minutes} นาที`;
  };

  // เปิด modal ให้คะแนนประสิทธิภาพ
  const openEfficiencyRating = (todoId: number) => {
    const todo = todos.find(t => t.id === todoId);
    setSelectedTodoId(todoId);
    setEfficiencyRating(todo?.efficiency || 5);
    setShowEfficiencyModal(true);
  };

  // บันทึกคะแนนประสิทธิภาพ
  const submitEfficiencyRating = () => {
    if (selectedTodoId !== null) {
      onRateEfficiency(selectedTodoId, efficiencyRating);
      setShowEfficiencyModal(false);
      setSelectedTodoId(null);
    }
  };

  // กรองและแสดงรายการที่มีการติดตามเวลา
  const getTrackedTodos = () => {
    return todos.filter(todo => todo.timeSpent && todo.timeSpent > 0)
      .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
  };

  return (
    <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">สถิติเวลา</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-[var(--card-bg-secondary)] p-3 rounded-lg">
          <h3 className="text-sm font-medium mb-1">เวลาทั้งหมด</h3>
          <p className="text-xl font-bold">{formatTotalTime(totalTimeSpent)}</p>
        </div>
        <div className="bg-[var(--card-bg-secondary)] p-3 rounded-lg">
          <h3 className="text-sm font-medium mb-1">Pomodoro สำเร็จ</h3>
          <p className="text-xl font-bold">{completedPomodoros}</p>
        </div>
        <div className="bg-[var(--card-bg-secondary)] p-3 rounded-lg">
          <h3 className="text-sm font-medium mb-1">ประสิทธิภาพเฉลี่ย</h3>
          <p className="text-xl font-bold">
            {todos.some(t => t.efficiency !== undefined)
              ? (todos.reduce((sum, t) => sum + (t.efficiency || 0), 0) /
                todos.filter(t => t.efficiency !== undefined).length).toFixed(1)
              : 'ไม่มีข้อมูล'}
          </p>
        </div>
      </div>

      {getTrackedTodos().length > 0 && (
        <>
          <div className="mb-4 w-full h-48">
            <canvas id="timeChart" />
          </div>

          <h3 className="text-lg font-medium mb-2">รายการที่ติดตาม</h3>
          <ul className="space-y-2">
            {getTrackedTodos().slice(0, 5).map((todo) => (
              <li key={todo.id} className="bg-[var(--card-bg-secondary)] p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className={`font-medium ${todo.completed ? 'line-through text-gray-500' : ''}`}>
                    {todo.text}
                  </p>
                  <p className="text-sm text-gray-400">
                    เวลาที่ใช้: {formatTotalTime(todo.timeSpent || 0)}
                    {todo.pomodoroSessions ? ` (${todo.pomodoroSessions} Pomodoro)` : ''}
                  </p>
                </div>
                <button
                  className="bg-[var(--primary-color)] text-white text-sm px-2 py-1 rounded hover:bg-[var(--primary-hover)]"
                  onClick={() => openEfficiencyRating(todo.id)}
                >
                  ให้คะแนน
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Modal ให้คะแนนประสิทธิภาพ */}
      {showEfficiencyModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] p-4 rounded-lg max-w-xs w-full">
            <h3 className="text-lg font-medium mb-4">ให้คะแนนประสิทธิภาพ</h3>

            <div className="flex justify-between my-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  className={`w-8 h-8 rounded-full ${efficiencyRating === rating
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-[var(--gray-medium)]'
                    }`}
                  onClick={() => setEfficiencyRating(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>

            <div className="flex justify-between mt-4">
              <button
                className="bg-[var(--gray-medium)] text-white px-3 py-1 rounded"
                onClick={() => setShowEfficiencyModal(false)}
              >
                ยกเลิก
              </button>
              <button
                className="bg-[var(--primary-color)] text-white px-3 py-1 rounded"
                onClick={submitEfficiencyRating}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}