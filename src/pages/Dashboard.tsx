import { useState } from 'react';
import { House, ListTodo, Plus, User, ShoppingCart } from 'lucide-react';
import type { Category, CompletionEvent, GroceryItem, Task, UserProfile } from '../domain/models';
import HomeScreen from './HomeScreen';
import CategoriesScreen from './CategoriesScreen';
import AddTaskScreen from './AddTaskScreen';
import ProfileScreen from './ProfileScreen';
import GroceriesScreen from './GroceriesScreen';

interface DashboardProps {
  currentUser: UserProfile;
  householdUsers: UserProfile[];
  categories: Category[];
  tasks: Task[];
  groceries: GroceryItem[];
  completionEvents: CompletionEvent[];
  isTaskCompleted: (task: Task, userId: string) => boolean;
  onResetCompletions: () => void;
  onResetTasks: () => void;
  onRemoveMember: (userId: string) => void;
  onAddGrocery: (item: Omit<GroceryItem, 'id' | 'createdAt'>) => void;
  onUpdateGrocery: (id: string, updates: Partial<GroceryItem>) => void;
  onDeleteGrocery: (id: string) => void;
  onClearGroceries: () => void;
  onAddAgainGroceries: (selected: GroceryItem[]) => void;
  onPreviewAddAgainGroceries: () => Promise<GroceryItem[]>;
  onLogout: () => void;
  onToggleTask: (taskId: string, userId: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
}

type Screen = 'home' | 'categories' | 'groceries' | 'add' | 'profile';

export default function Dashboard({
  currentUser,
  householdUsers,
  categories,
  tasks,
  groceries,
  completionEvents,
  isTaskCompleted,
  onResetCompletions,
  onResetTasks,
  onRemoveMember,
  onAddGrocery,
  onUpdateGrocery,
  onDeleteGrocery,
  onClearGroceries,
  onAddAgainGroceries,
  onPreviewAddAgainGroceries,
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
            isTaskCompleted={isTaskCompleted}
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
            isTaskCompleted={isTaskCompleted}
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
        {activeScreen === 'groceries' && (
          <GroceriesScreen
            items={groceries}
            onAdd={onAddGrocery}
            onUpdate={onUpdateGrocery}
            onDelete={onDeleteGrocery}
            onClear={onClearGroceries}
            onAddAgain={onAddAgainGroceries}
            onPreviewAddAgain={onPreviewAddAgainGroceries}
          />
        )}
        {activeScreen === 'profile' && (
          <ProfileScreen
            currentUser={currentUser}
            householdUsers={householdUsers}
            tasks={tasks}
            completionEvents={completionEvents}
            onResetCompletions={onResetCompletions}
            onResetTasks={onResetTasks}
            onRemoveMember={onRemoveMember}
            onLogout={onLogout}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-md mx-auto">
        <div className="grid grid-cols-5 items-center px-4 py-2 safe-area-inset-bottom">
          <button
            onClick={() => setActiveScreen('home')}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
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
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
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
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              activeScreen === 'profile'
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </button>

          <button
            onClick={() => setActiveScreen('groceries')}
            className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all ${
              activeScreen === 'groceries'
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs">Groceries</span>
          </button>
        </div>
      </div>
    </div>
  );
}
