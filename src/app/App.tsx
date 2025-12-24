import { useCallback, useEffect, useState } from 'react';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ResetPassword from '../pages/ResetPassword';
import type { Category, GroceryItem, Task, UserProfile } from '../domain/models';
import { isTaskCompletedInPeriod } from '../domain/logic';
import { useAppState } from '../state/useAppState';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const {
    loading,
    currentUser,
    householdUsers,
    categories,
    tasks,
    completionEvents,
    groceries,
    recentUsers,
    login,
    register,
    logout,
    requestPasswordReset,
    updatePassword,
    addGrocery,
    updateGrocery,
    deleteGrocery,
    clearGroceries,
    addAgainGroceries,
    previewAddAgainGroceries,
    resetCompletions,
    resetTasksToDefaults,
    removeMember,
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useAppState();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setShowPasswordReset(true);
    }
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error) {
      console.error('Login failed:', error);
      const message =
        error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      alert(message);
    }
  };

  const handleRegister = async (user: UserProfile & { password: string }) => {
    try {
      await register(user);
      setShowRegister(false);
    } catch (error) {
      console.error('Registration failed:', error);
      const message =
        error instanceof Error ? error.message : 'Registration failed. Please try again.';
      alert(message);
    }
  };

  const handleRequestPasswordReset = async (email: string) => {
    try {
      await requestPasswordReset(email, window.location.origin);
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
      await updatePassword(newPassword);
      await logout();
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
    await logout();
  };

  const handleAddGrocery = async (item: Omit<GroceryItem, 'id' | 'createdAt'>) => {
    try {
      await addGrocery(item);
    } catch (error) {
      console.error('Add grocery error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to add grocery item.';
      alert(message);
    }
  };

  const handleUpdateGrocery = async (id: string, updates: Partial<GroceryItem>) => {
    try {
      await updateGrocery(id, updates);
    } catch (error) {
      console.error('Update grocery error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to update grocery item.';
      alert(message);
    }
  };

  const handleDeleteGrocery = async (id: string) => {
    try {
      await deleteGrocery(id);
    } catch (error) {
      console.error('Delete grocery error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to delete grocery item.';
      alert(message);
    }
  };

  const handleClearGroceries = async () => {
    try {
      await clearGroceries();
      alert('Grocery list cleared.');
    } catch (error) {
      console.error('Clear groceries error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to clear grocery list.';
      alert(message);
    }
  };

  const handleAddAgain = async (selected: GroceryItem[]) => {
    try {
      const restoredCount = await addAgainGroceries(selected);
      if (restoredCount === 0) {
        alert('No previous list found.');
        return;
      }
    } catch (error) {
      console.error('Restore groceries error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to restore groceries.';
      alert(message);
    }
  };

  const handlePreviewAddAgain = async () => {
    try {
      return await previewAddAgainGroceries();
    } catch (error) {
      console.error('Preview groceries error:', error);
      return [];
    }
  };

  const handleResetCompletions = async () => {
    try {
      await resetCompletions();
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
      await resetTasksToDefaults();
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
      await removeMember(userId);
      alert('Member removed.');
    } catch (error) {
      console.error('Remove member error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to remove member.';
      alert(message);
    }
  };

  const isTaskCompleted = useCallback(
    (task: Task, userId: string) =>
      isTaskCompletedInPeriod(task.id, userId, task.frequency, completionEvents),
    [completionEvents]
  );

  const handleToggleTaskCompletion = async (taskId: string, userId: string) => {
    try {
      await toggleTaskCompletion(taskId, userId);
    } catch (error) {
      console.error('Toggle task error:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to toggle task';
      alert(message);
    }
  };

  const handleAddTask = async (task: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      await addTask(task);
    } catch (error) {
      console.error('Add task error:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Update task error:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error('Delete task error:', error);
    }
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    try {
      await addCategory(category);
    } catch (error) {
      console.error('Add category error:', error);
    }
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      await updateCategory(categoryId, updates);
    } catch (error) {
      console.error('Update category error:', error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
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
      groceries={groceries}
      completionEvents={completionEvents}
      isTaskCompleted={isTaskCompleted}
      onResetCompletions={handleResetCompletions}
      onResetTasks={handleResetTasks}
      onRemoveMember={handleRemoveMember}
      onAddGrocery={handleAddGrocery}
      onUpdateGrocery={handleUpdateGrocery}
      onDeleteGrocery={handleDeleteGrocery}
      onClearGroceries={handleClearGroceries}
      onAddAgainGroceries={handleAddAgain}
      onPreviewAddAgainGroceries={handlePreviewAddAgain}
      onLogout={handleLogout}
      onToggleTask={handleToggleTaskCompletion}
      onAddTask={handleAddTask}
      onUpdateTask={handleUpdateTask}
      onDeleteTask={handleDeleteTask}
      onAddCategory={handleAddCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
    />
  );
}

export default App;
