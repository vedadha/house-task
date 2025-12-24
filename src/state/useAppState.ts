import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Category, CompletionEvent, GroceryItem, RecentUser, Task, UserProfile } from '../domain/models';
import { buildRecentUsers, loadRecentUsers, saveRecentUsers } from '../utils/recentUsers';
import { createAppServices } from '../services/createAppServices';
import { useLatest } from './useLatest';

const COMPLETION_HISTORY_DAYS = 120;

export const useAppState = () => {
  const services = useMemo(() => createAppServices(), []);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [householdUsers, setHouseholdUsers] = useState<UserProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completionEvents, setCompletionEvents] = useState<CompletionEvent[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [groceries, setGroceries] = useState<GroceryItem[]>([]);

  const tasksRef = useLatest(tasks);
  const completionEventsRef = useLatest(completionEvents);
  const groceriesRef = useLatest(groceries);

  const loadData = useCallback(
    async (options?: { force?: boolean }) => {
      if (dataLoaded && !options?.force) return;
      try {
        const data = await services.householdService.loadHouseholdData(
          COMPLETION_HISTORY_DAYS
        );
        setHouseholdUsers(data.users);
        setCategories(data.categories);
        setTasks(data.tasks);
        setGroceries(data.groceries);
        setCompletionEvents(data.completionEvents);
        setDataLoaded(true);
        if (data.seededTaskCount !== 0) {
          console.info(`Seeded ${data.seededTaskCount} default tasks.`);
        }
      } catch (error) {
        console.error('Data loading error:', error);
        const message =
          error instanceof Error ? error.message : 'Failed to load data.';
        alert(message);
      }
    },
    [dataLoaded, services.householdService]
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await services.authService.checkSession();
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
  }, [loadData, services.authService]);

  useEffect(() => {
    setRecentUsers(loadRecentUsers());
  }, []);

  const saveRecentUser = useCallback((user: UserProfile) => {
    setRecentUsers((prev) => {
      const next = buildRecentUsers(prev, user);
      saveRecentUsers(next);
      return next;
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { user } = await services.authService.login(email, password);
      setCurrentUser(user);
      saveRecentUser(user);
      await loadData({ force: true });
    },
    [loadData, saveRecentUser, services.authService]
  );

  const register = useCallback(
    async (user: UserProfile & { password: string }) => {
      const { user: newUser } = await services.authService.register(
        user.email,
        user.password,
        user.name,
        user.avatar,
        user.color
      );
      setCurrentUser(newUser);
      saveRecentUser(newUser);
      await loadData({ force: true });
    },
    [loadData, saveRecentUser, services.authService]
  );

  const logout = useCallback(async () => {
    await services.authService.logout();
    setCurrentUser(null);
    setHouseholdUsers([]);
    setCategories([]);
    setTasks([]);
    setCompletionEvents([]);
    setGroceries([]);
    setDataLoaded(false);
  }, [services.authService]);

  const requestPasswordReset = useCallback(
    async (email: string, redirectTo: string) => {
      await services.authService.requestPasswordReset(email, redirectTo);
    },
    [services.authService]
  );

  const updatePassword = useCallback(
    async (newPassword: string) => {
      await services.authService.updatePassword(newPassword);
    },
    [services.authService]
  );

  const addGrocery = useCallback(
    async (item: Omit<GroceryItem, 'id' | 'createdAt'>) => {
      const created = await services.groceriesService.addGrocery(item);
      setGroceries((prev) => [...prev, created]);
    },
    [services.groceriesService]
  );

  const updateGrocery = useCallback(
    async (id: string, updates: Partial<GroceryItem>) => {
      const previous = groceriesRef.current;
      setGroceries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      try {
        const updated = await services.groceriesService.updateGrocery(id, updates);
        setGroceries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      } catch (error) {
        setGroceries(previous);
        throw error;
      }
    },
    [groceriesRef, services.groceriesService]
  );

  const deleteGrocery = useCallback(
    async (id: string) => {
      await services.groceriesService.deleteGrocery(id);
      setGroceries((prev) => prev.filter((item) => item.id !== id));
    },
    [services.groceriesService]
  );

  const clearGroceries = useCallback(async () => {
    const existing = groceriesRef.current;
    await services.groceriesService.clearGroceries(existing);
    setGroceries([]);
  }, [groceriesRef, services.groceriesService]);

  const addAgainGroceries = useCallback(
    async (selected: GroceryItem[]) => {
      const restored = await services.groceriesService.restoreSelectedGroceries(
        selected,
        groceriesRef.current.map((item) => item.name)
      );
      if (restored.length > 0) {
        setGroceries((prev) => [...prev, ...restored]);
      }
      return restored.length;
    },
    [groceriesRef, services.groceriesService]
  );

  const previewAddAgainGroceries = useCallback(
    async () => services.groceriesService.getRecentArchiveItems(3),
    [services.groceriesService]
  );

  const resetCompletions = useCallback(async () => {
    await services.adminService.resetCompletions();
    const events = await services.completionRepository.listRecent(
      COMPLETION_HISTORY_DAYS
    );
    setCompletionEvents(events);
    const refreshedTasks = await services.tasksRepository.list();
    setTasks(refreshedTasks);
  }, [services.adminService, services.completionRepository, services.tasksRepository]);

  const resetTasksToDefaults = useCallback(async () => {
    await services.adminService.resetTasksToDefaults();
    setDataLoaded(false);
    await loadData({ force: true });
  }, [loadData, services.adminService]);

  const removeMember = useCallback(
    async (userId: string) => {
      await services.adminService.removeMember(userId);
      const users = await services.profilesRepository.listByHousehold();
      setHouseholdUsers(users);
    },
    [services.adminService, services.profilesRepository]
  );

  const toggleTaskCompletion = useCallback(
    async (taskId: string, userId: string) => {
      const previousTasks = tasksRef.current;
      const previousEvents = completionEventsRef.current;
      const target = previousTasks.find((task) => task.id === taskId);
      if (!target) {
        throw new Error('Task not found');
      }
      const alreadyCompleted = target.completedBy.includes(userId);
      const completed = !alreadyCompleted;
      const optimisticEvent: CompletionEvent = {
        id: `optimistic-${taskId}-${userId}-${Date.now()}`,
        taskId,
        userId,
        completed,
        occurredAt: new Date().toISOString(),
      };

      setTasks((prev) =>
        prev.map((task) =>
          task.id !== taskId
            ? task
            : {
                ...task,
                completedBy: completed
                  ? [...task.completedBy, userId]
                  : task.completedBy.filter((id) => id !== userId),
              }
        )
      );
      setCompletionEvents((prev) => [...prev, optimisticEvent]);

      try {
        const { task: updatedTask, event } =
          await services.tasksService.toggleTaskCompletion(taskId, userId);
        setTasks((prev) =>
          prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        setCompletionEvents((prev) =>
          prev
            .filter((evt) => evt.id !== optimisticEvent.id)
            .concat(event)
        );
      } catch (error) {
        setTasks(previousTasks);
        setCompletionEvents(previousEvents);
        throw error;
      }
    },
    [completionEventsRef, services.tasksService, tasksRef]
  );

  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask = await services.tasksService.addTask(task);
      setTasks((prev) => [...prev, newTask]);
    },
    [services.tasksService]
  );

  const updateTask = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      const updatedTask = await services.tasksService.updateTask(taskId, updates);
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? updatedTask : task))
      );
    },
    [services.tasksService]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      await services.tasksService.deleteTask(taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    },
    [services.tasksService]
  );

  const addCategory = useCallback(
    async (category: Omit<Category, 'id'>) => {
      const newCategory = await services.categoriesService.addCategory(category);
      setCategories((prev) => [...prev, newCategory]);
    },
    [services.categoriesService]
  );

  const updateCategory = useCallback(
    async (categoryId: string, updates: Partial<Category>) => {
      const updatedCategory = await services.categoriesService.updateCategory(
        categoryId,
        updates
      );
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId ? updatedCategory : category
        )
      );
    },
    [services.categoriesService]
  );

  const deleteCategory = useCallback(
    async (categoryId: string) => {
      await services.categoriesService.deleteCategory(categoryId);
      setCategories((prev) => prev.filter((category) => category.id !== categoryId));
      setTasks((prev) => prev.filter((task) => task.categoryId !== categoryId));
    },
    [services.categoriesService]
  );

  return {
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
  };
};
