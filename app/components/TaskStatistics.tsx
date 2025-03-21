'use client';

import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
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

interface CategoryStats {
  category: string;
  totalTime: number;
  completedTasks: number;
  totalTasks: number;
  avgEfficiency: number;
}

interface TaskStatisticsProps {
  todos: Todo[];
  onRateEfficiency: (todoId: number, efficiency: number) => void;
}

export default function TaskStatistics({ todos, onRateEfficiency }: TaskStatisticsProps) {
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'efficiency'>('overview');
  const [showEfficiencyModal, setShowEfficiencyModal] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [efficiencyRating, setEfficiencyRating] = useState(5);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  // คำนวณสถิติ
  useEffect(() => {
    // คำนวณสถิติรวม
    let total = 0;
    let pomodoros = 0;
    
    // รวบรวมหมวดหมู่ทั้งหมด
    const categories = [...new Set(todos.flatMap(todo => todo.categories))];
    
    // คำนวณสถิติแยกตามหมวดหมู่
    const stats = categories.map(category => {
      const categoryTodos = todos.filter(todo => todo.categories.includes(category));
      const totalTime = categoryTodos.reduce((sum, todo) => sum + (todo.timeSpent || 0), 0);
      const completedTasks = categoryTodos.filter(todo => todo.completed).length;
      const avgEfficiency = categoryTodos
        .filter(todo => todo.efficiency !== undefined)
        .reduce((sum, todo) => sum + (todo.efficiency || 0), 0) / 
        (categoryTodos.filter(todo => todo.efficiency !== undefined).length || 1);
      
      return {
        category,
        totalTime,
        completedTasks,
        totalTasks: categoryTodos.length,
        avgEfficiency: parseFloat(avgEfficiency.toFixed(1))
      };
    });
    
    // เรียงตามเวลาที่ใช้มากไปน้อย
    stats.sort((a, b) => b.totalTime - a.totalTime);
    
    // คำนวณรวม
    todos.forEach(todo => {
      total += todo.timeSpent || 0;
      pomodoros += todo.pomodoroSessions || 0;
    });
    
    setCategoryStats(stats);
    setTotalTimeSpent(total);
    setCompletedPomodoros(pomodoros);

    // สร้างแผนภูมิสถิติถ้ามีข้อมูล
    if (stats.length > 0) {
      createCategoryChart(stats);
    }
  }, [todos]);

  // สร้างแผนภูมิ
  const createCategoryChart = (stats: CategoryStats[]) => {
    if (chartInstance) {
      chartInstance.destroy();
    }

    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stats.map(stat => stat.category),
        datasets: [
          {
            label: 'เวลาที่ใช้ (นาที)',
            data: stats.map(stat => Math.round(stat.totalTime / 60)),
            backgroundColor: 'rgba(255, 99, 132, 0.7)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          },
          {
            label: 'ประสิทธิภาพ (1-10)',
            data: stats.map(stat => stat.avgEfficiency),
            backgroundColor: 'rgba(54, 162, 235, 0.7)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'เวลาที่ใช้ (นาที)'
            }
          },
          y1: {
            beginAtZero: true,
            max: 10,
            position: 'right',
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'ประสิทธิภาพ (1-10)'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

    setChartInstance(newChart);
  };

  // เวลาที่ใช้ไปทั้งหมดในรูปแบบที่อ่านง่าย
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

  // สร้างคำแนะนำจากข้อมูลสถิติ
  const getRecommendations = () => {
    const recommendations = [];
    
    // ตรวจหาหมวดหมู่ที่มีประสิทธิภาพต่ำ
    const lowEfficiencyCats = categoryStats
      .filter(stat => stat.avgEfficiency < 5)
      .map(stat => stat.category);
    
    if (lowEfficiencyCats.length > 0) {
      recommendations.push(
        `ควรปรับปรุงประสิทธิภาพในหมวดหมู่: ${lowEfficiencyCats.join(', ')}`
      );
    }
    
    // ตรวจหาหมวดหมู่ที่มีอัตราการเสร็จสิ้นงานต่ำ
    const lowCompletionCats = categoryStats
      .filter(stat => (stat.completedTasks / stat.totalTasks) < 0.5 && stat.totalTasks > 3)
      .map(stat => stat.category);
    
    if (lowCompletionCats.length > 0) {
      recommendations.push(
        `อัตราการเสร็จสิ้นงานต่ำในหมวดหมู่: ${lowCompletionCats.join(', ')}`
      );
    }
    
    // แนะนำเพิ่มเติม
    if (completedPomodoros === 0 && totalTimeSpent > 0) {
      recommendations.push('ลองใช้เทคนิค Pomodoro เพื่อเพิ่มประสิทธิภาพและโฟกัส');
    }
    
    return recommendations.length > 0 ? recommendations : ['ยังไม่มีข้อมูลเพียงพอสำหรับคำแนะนำ'];
  };

  // กรองและแสดงรายการที่มีการติดตามเวลา
  const getTrackedTodos = () => {
    return todos.filter(todo => todo.timeSpent && todo.timeSpent > 0)
      .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0));
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">สถิติและประสิทธิภาพ</h2>
      
      {/* แท็บเมนู */}
      <div className="flex border-b border-gray-700 mb-4">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          ภาพรวม
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'categories' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          หมวดหมู่
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'efficiency' ? 'border-b-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('efficiency')}
        >
          ประสิทธิภาพ
        </button>
      </div>
      
      {/* แสดงข้อมูลตามแท็บที่เลือก */}
      {activeTab === 'overview' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-lg font-medium mb-1">เวลาทั้งหมด</h3>
              <p className="text-2xl font-bold">{formatTotalTime(totalTimeSpent)}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-lg font-medium mb-1">Pomodoro สำเร็จ</h3>
              <p className="text-2xl font-bold">{completedPomodoros}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg">
              <h3 className="text-lg font-medium mb-1">ประสิทธิภาพเฉลี่ย</h3>
              <p className="text-2xl font-bold">
                {todos.some(t => t.efficiency !== undefined) 
                  ? (todos.reduce((sum, t) => sum + (t.efficiency || 0), 0) / 
                     todos.filter(t => t.efficiency !== undefined).length).toFixed(1)
                  : 'ไม่มีข้อมูล'}
              </p>
            </div>
          </div>
          
          <h3 className="text-xl font-medium mb-2">รายการที่ติดตาม</h3>
          {getTrackedTodos().length > 0 ? (
            <ul className="space-y-2">
              {getTrackedTodos().slice(0, 5).map((todo) => (
                <li key={todo.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
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
                    className="bg-blue-600 text-white text-sm px-2 py-1 rounded hover:bg-blue-700"
                    onClick={() => openEfficiencyRating(todo.id)}
                  >
                    ให้คะแนน
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">ยังไม่มีการติดตามเวลา</p>
          )}
        </div>
      )}
      
      {activeTab === 'categories' && (
        <div>
          <div className="mb-4 w-full h-64">
            <canvas id="categoryChart" />
          </div>
          
          {categoryStats.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-xl font-medium mb-2">สถิติแยกตามหมวดหมู่</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-gray-800">
                    <tr>
                      <th className="px-3 py-2">หมวดหมู่</th>
                      <th className="px-3 py-2">เวลาที่ใช้</th>
                      <th className="px-3 py-2">งานเสร็จสิ้น</th>
                      <th className="px-3 py-2">ประสิทธิภาพเฉลี่ย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStats.map((stat, index) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="px-3 py-2">{stat.category}</td>
                        <td className="px-3 py-2">{formatTotalTime(stat.totalTime)}</td>
                        <td className="px-3 py-2">{stat.completedTasks}/{stat.totalTasks}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center">
                            <span className="mr-2">{stat.avgEfficiency}</span>
                            <div className="w-24 h-2 bg-gray-700 rounded-full">
                              <div 
                                className={`h-2 rounded-full ${
                                  stat.avgEfficiency >= 7 ? 'bg-green-500' : 
                                  stat.avgEfficiency >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${stat.avgEfficiency * 10}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">ยังไม่มีข้อมูลสถิติ</p>
          )}
        </div>
      )}
      
      {activeTab === 'efficiency' && (
        <div>
          <h3 className="text-xl font-medium mb-3">คำแนะนำในการปรับปรุง</h3>
          <ul className="space-y-2 mb-4">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="bg-gray-800 p-3 rounded-lg">
                {rec}
              </li>
            ))}
          </ul>
          
          <h3 className="text-xl font-medium mb-3">เคล็ดลับเพิ่มประสิทธิภาพ</h3>
          <div className="bg-gray-800 p-4 rounded-lg">
            <ul className="list-disc list-inside space-y-2">
              <li>ใช้เทคนิค Pomodoro (25 นาทีทำงาน / 5 นาทีพัก)</li>
              <li>จัดลำดับความสำคัญของงานด้วยเมทริกซ์ Eisenhower</li>
              <li>แบ่งงานใหญ่เป็นงานย่อยที่จัดการได้</li>
              <li>จำกัดการทำงานหลายอย่างพร้อมกัน (multitasking)</li>
              <li>รวมงานที่คล้ายกันไว้ด้วยกัน</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Modal ให้คะแนนประสิทธิภาพ */}
      {showEfficiencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-medium mb-4">ให้คะแนนประสิทธิภาพ</h3>
            <p className="mb-2">คุณทำงานได้มีประสิทธิภาพแค่ไหน?</p>
            
            <div className="flex justify-between my-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  className={`w-8 h-8 rounded-full ${
                    efficiencyRating === rating 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => setEfficiencyRating(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
            
            <div className="flex justify-between mt-4">
              <button 
                className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600"
                onClick={() => setShowEfficiencyModal(false)}
              >
                ยกเลิก
              </button>
              <button 
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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