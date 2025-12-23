import { useState } from 'react';
import { Calendar, Clock } from 'lucide-react';
import type { User, Task, Category } from '../App';
import TaskCard from './TaskCard';

interface HomeScreenProps {
  currentUser: User;
  householdUsers: User[];
  categories: Category[];
  tasks: Task[];
  onToggleTask: (taskId: string, userId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function HomeScreen({
  currentUser,
  householdUsers,
  categories,
  tasks,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: HomeScreenProps) {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const filteredTasks = tasks.filter((task) => task.frequency === view);

  const completedCount = filteredTasks.filter((task) =>
    task.completedBy.includes(currentUser.id)
  ).length;

  const progress = filteredTasks.length > 0 
    ? (completedCount / filteredTasks.length) * 100 
    : 0;

  return (
    <div className="p-6 pb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: currentUser.color + '20' }}
          >
            {currentUser.avatar}
          </div>
          <div>
            <p className="text-gray-500">Welcome back,</p>
            <h1 className="text-gray-900">{currentUser.name}</h1>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('daily')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            view === 'daily'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          Daily Tasks
        </button>
        <button
          onClick={() => setView('weekly')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${
            view === 'weekly'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Weekly Tasks
        </button>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-blue-100">Your Progress</p>
            <p className="text-2xl font-bold">
              {completedCount} / {filteredTasks.length}
            </p>
          </div>
          <div className="text-3xl font-bold">{Math.round(progress)}%</div>
        </div>
        <div className="w-full h-2 bg-blue-400/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-gray-900">
            {view === 'daily' ? 'Today' : 'This Week'}
          </h2>
          <span className="text-gray-500">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No {view} tasks yet</p>
            <p className="text-gray-400">Tap the + button to add one</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const category = categories.find((c) => c.id === task.categoryId);
            return (
              <TaskCard
                key={task.id}
                task={task}
                category={category}
                currentUser={currentUser}
                householdUsers={householdUsers}
                onToggleTask={onToggleTask}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
