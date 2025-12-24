import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import * as api from './lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  password?: string; // Optional, only used during registration
  role?: 'admin' | 'member';
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  completedBy: string[]; // user IDs who completed this task
  frequency: 'daily' | 'weekly';
  createdAt: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CompletionEvent {
  id: string;
  taskId: string;
  userId: string;
  completed: boolean;
  occurredAt: string;
}

export interface RecentUser {
  email: string;
  name: string;
  avatar: string;
  color: string;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);
  const [householdUsers, setHouseholdUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionEvents, setCompletionEvents] = useState<CompletionEvent[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await api.checkSession();
        if (session?.user) {
          setCurrentUser(session.user);
          await loadData();
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setShowPasswordReset(true);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-users');
      if (raw) {
        setRecentUsers(JSON.parse(raw) as RecentUser[]);
      }
    } catch {
      setRecentUsers([]);
    }
  }, []);

  const saveRecentUser = (user: User) => {
    const next = [
      { email: user.email, name: user.name, avatar: user.avatar, color: user.color },
      ...recentUsers.filter((entry) => entry.email !== user.email),
    ].slice(0, 5);
    setRecentUsers(next);
    localStorage.setItem('recent-users', JSON.stringify(next));
  };

  const loadData = async () => {
    try {
      const [users, cats, taskList] = await Promise.all([
        api.getHouseholdUsers(),
        api.getCategories(),
        api.getTasks(),
      ]);
      let events: CompletionEvent[] = [];
      try {
        events = await api.getCompletionEvents(120);
      } catch (error) {
        console.error('Completion history error:', error);
      }

      let resolvedCategories = cats;
      let resolvedTasks = taskList;
      const originalTaskCount = taskList.length;

      // Initialize default categories if none exist.
      if (resolvedCategories.length === 0) {
        const defaults = getDefaultCategories();
        const created: Category[] = [];
        for (const cat of defaults) {
          created.push(await api.addCategory(cat));
        }
        resolvedCategories = created;
      }

      // Initialize default tasks if none exist, and seed any new defaults.
      if (resolvedCategories.length > 0) {
        if (resolvedTasks.length === 0) {
          const defaults = getDefaultTasks(resolvedCategories);
          const created: Task[] = [];
          for (const task of defaults) {
            created.push(await api.addTask(task));
          }
          resolvedTasks = created;
        } else {
          resolvedTasks = await seedMissingDefaultTasks(resolvedTasks, resolvedCategories);
        }
      }

      setHouseholdUsers(users);
      setCategories(resolvedCategories);
      setTasks(resolvedTasks);
      setCompletionEvents(events);
      if (originalTaskCount !== resolvedTasks.length) {
        console.info(
          `Seeded ${resolvedTasks.length - originalTaskCount} default tasks.`
        );
      }
    } catch (error) {
      console.error('Data loading error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to load data.';
      alert(message);
    }
  };

  const getDefaultCategories = (): Omit<Category, 'id'>[] => [
    { name: 'Living Room', icon: 'Sofa', color: '#E3F2FD' },
    { name: 'Kitchen', icon: 'ChefHat', color: '#FFF3E0' },
    { name: 'Bedroom', icon: 'Bed', color: '#F3E5F5' },
    { name: 'Bathroom', icon: 'Bath', color: '#E0F2F1' },
    { name: 'Outdoor', icon: 'TreePine', color: '#E8F5E9' },
  ];

  const getDefaultTasks = (cats: Category[]): Omit<Task, 'id' | 'createdAt'>[] => {
    if (cats.length === 0) return [];

    const firstId = cats[0].id;
    const getCategoryId = (name: string, fallbackId = firstId) =>
      cats.find((cat) => cat.name === name)?.id || fallbackId;

    const livingRoomId = getCategoryId('Living Room');
    const kitchenId = getCategoryId('Kitchen');
    const bedroomId = getCategoryId('Bedroom');
    const bathroomId = getCategoryId('Bathroom');
    const outdoorId = getCategoryId('Outdoor');

    return [
      { title: 'Vacuum the carpet', categoryId: livingRoomId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Dust furniture', categoryId: livingRoomId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Wash dishes', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 1 },
      { title: 'Clean countertops', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 1 },
      { title: 'Take out trash', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 1 },
      { title: 'Binxi food/water', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 2 },
      { title: 'Breakfast', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 2 },
      { title: 'Lunch', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 3 },
      { title: 'Market', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 1 },
      { title: 'Dishwasher', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 2 },
      { title: 'Washing Machine', categoryId: bathroomId, completedBy: [], frequency: 'daily', rating: 2 },
      { title: 'Dinner', categoryId: kitchenId, completedBy: [], frequency: 'daily', rating: 3 },
      { title: 'Make beds', categoryId: bedroomId, completedBy: [], frequency: 'daily', rating: 1 },
      { title: 'Change bedsheets', categoryId: bedroomId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Clean toilet', categoryId: bathroomId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Wipe mirrors', categoryId: bathroomId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Water plants', categoryId: outdoorId, completedBy: [], frequency: 'weekly', rating: 1 },
      { title: 'Mow lawn', categoryId: outdoorId, completedBy: [], frequency: 'weekly', rating: 1 },
    ];
  };

  const seedMissingDefaultTasks = async (existing: Task[], cats: Category[]) => {
    const defaults = getDefaultTasks(cats);
    if (defaults.length === 0) return existing;

    const existingTitles = new Set(
      existing.map((task) => task.title.trim().toLowerCase())
    );

    const toCreate = defaults.filter(
      (task) => !existingTitles.has(task.title.trim().toLowerCase())
    );

    if (toCreate.length === 0) return existing;

    const created: Task[] = [];
    for (const task of toCreate) {
      created.push(await api.addTask(task));
    }

    return [...existing, ...created];
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const { user } = await api.login(email, password);
      setCurrentUser(user);
      saveRecentUser(user);
      await loadData();
    } catch (error) {
      console.error('Login failed:', error);
      const message =
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      alert(message);
    }
  };

  const handleRegister = async (user: User) => {
    try {
      const { user: newUser } = await api.register(
        user.email,
        user.password || 'password', // Use the password from the form
        user.name,
        user.avatar,
        user.color
      );
      setCurrentUser(newUser);
      saveRecentUser(newUser);
      setShowRegister(false);
      await loadData();
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      alert(message);
    }
  };

  const handleRequestPasswordReset = async (email: string) => {
    try {
      await api.requestPasswordReset(email, window.location.origin);
      alert('Check your email for a password reset link.');
    } catch (error) {
      console.error('Password reset request failed:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to request password reset.';
      alert(message);
    }
  };

  const handleUpdatePassword = async (newPassword: string) => {
    try {
      await api.updatePassword(newPassword);
      await api.logout();
      setShowPasswordReset(false);
      window.history.replaceState(null, '', window.location.pathname);
      alert('Password updated. Please sign in.');
    } catch (error) {
      console.error('Password update failed:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update password.';
      alert(message);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setHouseholdUsers([]);
    setCategories([]);
    setTasks([]);
    setCompletionEvents([]);
  };

  const handleResetCompletions = async () => {
    try {
      await api.resetCompletions();
      const events = await api.getCompletionEvents(120);
      setCompletionEvents(events);
      const refreshedTasks = await api.getTasks();
      setTasks(refreshedTasks);
      alert('Completions reset.');
    } catch (error) {
      console.error('Reset completions error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to reset completions.';
      alert(message);
    }
  };

  const handleResetTasks = async () => {
    try {
      await api.resetTasksToDefaults();
      await loadData();
      alert('Tasks reset to defaults.');
    } catch (error) {
      console.error('Reset tasks error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to reset tasks.';
      alert(message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await api.removeHouseholdMember(userId);
      const users = await api.getHouseholdUsers();
      setHouseholdUsers(users);
      alert('Member removed.');
    } catch (error) {
      console.error('Remove member error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to remove member.';
      alert(message);
    }
  };

  const getPeriodStart = (frequency: Task['frequency']) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (frequency === 'weekly') {
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1;
      start.setDate(start.getDate() - diff);
    }
    return start;
  };

  const isTaskCompleted = (task: Task, userId: string) => {
    const periodStart = getPeriodStart(task.frequency);
    const relevant = completionEvents
      .filter((event) => event.taskId === task.id && event.userId === userId)
      .filter((event) => new Date(event.occurredAt) >= periodStart)
      .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

    if (relevant.length === 0) {
      return false;
    }

    return relevant[relevant.length - 1].completed;
  };

  const toggleTaskCompletion = async (taskId: string, userId: string) => {
    try {
      const updatedTask = await api.toggleTaskCompletion(taskId, userId);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
      try {
        const events = await api.getCompletionEvents(120);
        setCompletionEvents(events);
      } catch (eventError) {
        console.error('Completion refresh error:', eventError);
      }
    } catch (error) {
      console.error('Toggle task error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to toggle task';
      alert(message);
    }
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const newTask = await api.addTask(task);
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error('Add task error:', error);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await api.updateTask(taskId, updates);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const newCategory = await api.addCategory(category);
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Add category error:', error);
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const updatedCategory = await api.updateCategory(categoryId, updates);
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId ? updatedCategory : category
        )
      );
    } catch (error) {
      console.error('Update category error:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      await api.deleteCategory(categoryId);
      setCategories((prevCategories) =>
        prevCategories.filter((category) => category.id !== categoryId)
      );
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.categoryId !== categoryId)
      );
    } catch (error) {
      console.error('Delete category error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (showPasswordReset) {
      return (
        <ResetPassword
          onReset={handleUpdatePassword}
          onBack={() => setShowPasswordReset(false)}
        />
      );
    }
    if (showRegister) {
      return (
        <Register
          onRegister={handleRegister}
          onBack={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLogin={handleLogin}
        onShowRegister={() => setShowRegister(true)}
        onRequestPasswordReset={handleRequestPasswordReset}
        recentUsers={recentUsers}
      />
    );
  }

  return (
    <Dashboard
      currentUser={currentUser}
      householdUsers={householdUsers}
      categories={categories}
      tasks={tasks}
      completionEvents={completionEvents}
      isTaskCompleted={isTaskCompleted}
      onResetCompletions={handleResetCompletions}
      onResetTasks={handleResetTasks}
      onRemoveMember={handleRemoveMember}
      onLogout={handleLogout}
      onToggleTask={toggleTaskCompletion}
      onAddTask={addTask}
      onUpdateTask={updateTask}
      onDeleteTask={deleteTask}
      onAddCategory={addCategory}
      onUpdateCategory={updateCategory}
      onDeleteCategory={deleteCategory}
    />
  );
}

export default App;
