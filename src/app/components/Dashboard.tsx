import { useState } from 'react';
import { House, ListTodo, Plus, User } from 'lucide-react';
import type { User as UserType, Task, Category, CompletionEvent } from '../App';
import HomeScreen from './HomeScreen';
import CategoriesScreen from './CategoriesScreen';
import AddTaskScreen from './AddTaskScreen';
import ProfileScreen from './ProfileScreen';

interface DashboardProps {
  currentUser: UserType;
  householdUsers: UserType[];
  categories: Category[];
  tasks: Task[];
  completionEvents: CompletionEvent[];
  onLogout: () => void;
  onToggleTask: (taskId: string, userId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

type Screen = 'home' | 'categories' | 'add' | 'profile';

export default function Dashboard({
  currentUser,
  householdUsers,
  categories,
  tasks,
  completionEvents,
  onLogout,
  onToggleTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: DashboardProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto relative">
      {/* Content */}
      <div className="flex-1 pb-20 overflow-y-auto">
        {activeScreen === 'home' && (
          <HomeScreen
            currentUser={currentUser}
            householdUsers={householdUsers}
            categories={categories}
            tasks={tasks}
            onToggleTask={onToggleTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
          />
        )}
        {activeScreen === 'categories' && (
          <CategoriesScreen
            categories={categories}
            tasks={tasks}
            householdUsers={householdUsers}
            currentUser={currentUser}
            onToggleTask={onToggleTask}
            onAddCategory={onAddCategory}
            onUpdateCategory={onUpdateCategory}
            onDeleteCategory={onDeleteCategory}
            onDeleteTask={onDeleteTask}
          />
        )}
        {activeScreen === 'add' && (
          <AddTaskScreen
            categories={categories}
            onAddTask={onAddTask}
            onBack={() => setActiveScreen('home')}
          />
        )}
        {activeScreen === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            householdUsers={householdUsers}
            tasks={tasks}
            completionEvents={completionEvents}
            onLogout={onLogout}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="flex items-center justify-around px-4 py-2 safe-area-inset-bottom">
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              activeScreen === 'home'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <House className={`w-6 h-6 ${activeScreen === 'home' ? 'fill-current' : ''}`} />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={() => setActiveScreen('categories')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              activeScreen === 'categories'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListTodo className="w-6 h-6" />
            <span className="text-xs">Categories</span>
          </button>

          <button
            onClick={() => setActiveScreen('add')}
            className="flex flex-col items-center gap-1 -mt-6"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg flex items-center justify-center hover:shadow-xl transition-all">
              <Plus className="w-7 h-7 text-white" strokeWidth={3} />
            </div>
          </button>

          <button
            onClick={() => setActiveScreen('profile')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
              activeScreen === 'profile'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>

          <div className="w-16" /> {/* Spacer for FAB */}
        </div>
      </div>
    </div>
  );
}
