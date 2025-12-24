import { useState } from 'react';
import { Calendar, Clock, Check, Sofa, ChefHat, Bed, Bath, TreePine } from 'lucide-react';
import type { User, Task, Category } from '../App';

interface HomeScreenProps {
  currentUser: User;
  householdUsers: User[];
  categories: Category[];
  tasks: Task[];
  isTaskCompleted: (task: Task, userId: string) => boolean;
  onToggleTask: (taskId: string, userId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function HomeScreen({
  currentUser,
  householdUsers,
  categories,
  tasks,
  isTaskCompleted,
  onToggleTask,
  onUpdateTask,
  onDeleteTask,
}: HomeScreenProps) {
  const [view, setView] = useState<'daily' | 'weekly'>('daily');

  const filteredTasks = tasks.filter((task) => task.frequency === view);

  const completedCount = filteredTasks.filter((task) =>
    isTaskCompleted(task, currentUser.id)
  ).length;

  const progress = filteredTasks.length > 0 
    ? (completedCount / filteredTasks.length) * 100 
    : 0;

  const CATEGORY_ICONS = {
    Sofa,
    ChefHat,
    Bed,
    Bath,
    TreePine,
  };

  const grouped = categories
    .map((category) => ({
      category,
      tasks: filteredTasks.filter((task) => task.categoryId === category.id),
    }))
    .filter((group) => group.tasks.length > 0);

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
        <div className="flex items-center justify-between">
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
          grouped.map(({ category, tasks: categoryTasks }) => {
            const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS];
            const categoryCompleted = categoryTasks.filter((task) =>
              isTaskCompleted(task, currentUser.id)
            ).length;
            return (
              <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color }}
                  >
                    {IconComponent && <IconComponent className="w-4 h-4 text-gray-700" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500">
                      {categoryCompleted}/{categoryTasks.length} done
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-100">
                  {categoryTasks.map((task) => {
                    const isCompleted = isTaskCompleted(task, currentUser.id);
                    return (
                        <div key={task.id} className="flex items-center gap-3 px-4 py-3.5">
                        <button
                          onClick={() => onToggleTask(task.id, currentUser.id)}
                          className={`h-8 w-8 rounded-full border-2 flex items-center justify-center ${
                            isCompleted ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}
                        >
                          {isCompleted && <Check className="w-4.5 h-4.5 text-white" strokeWidth={3} />}
                        </button>
                        <div className="flex-1">
                          <div className={`text-base ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {householdUsers.map((user) => (
                              <span
                                key={user.id}
                                title={`${user.name} ${isTaskCompleted(task, user.id) ? 'done' : 'not done'}`}
                                className={`h-3 w-3 rounded-full border ${
                                  isTaskCompleted(task, user.id) ? 'border-transparent' : 'border-gray-200'
                                }`}
                                style={{
                                  backgroundColor: isTaskCompleted(task, user.id)
                                    ? user.color
                                    : 'transparent',
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
