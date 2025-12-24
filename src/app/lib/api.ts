import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const HOUSEHOLD_ID = 'default';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role?: 'admin' | 'member';
}

interface Task {
  id: string;
  title: string;
  categoryId: string;
  completedBy: string[];
  frequency: 'daily' | 'weekly';
  createdAt: string;
  rating: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  note: string;
  completed: boolean;
  createdAt: string;
}

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  household_id: string;
  role: 'admin' | 'member';
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  household_id: string;
}

interface TaskRow {
  id: string;
  title: string;
  category_id: string;
  completed_by: string[];
  frequency: 'daily' | 'weekly';
  created_at: string;
  household_id: string;
  rating: number | null;
}

interface GroceryRow {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
}

interface GroceryArchiveRow {
  id: string;
  household_id: string;
  created_at: string;
}

interface GroceryArchiveItemRow {
  id: string;
  archive_id: string;
  name: string;
  quantity: number;
  note: string | null;
}

interface CompletionEventRow {
  id: string;
  task_id: string;
  user_id: string;
  completed: boolean;
  occurred_at: string;
  household_id: string;
}

interface CompletionEvent {
  id: string;
  taskId: string;
  userId: string;
  completed: boolean;
  occurredAt: string;
}

const toUser = (row: ProfileRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatar: row.avatar,
  color: row.color,
  role: row.role,
});

const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
});

const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  categoryId: row.category_id,
  completedBy: row.completed_by || [],
  frequency: row.frequency,
  createdAt: row.created_at,
  rating: row.rating ?? 1,
});

const toGrocery = (row: GroceryRow): GroceryItem => ({
  id: row.id,
  name: row.name,
  quantity: row.quantity,
  note: row.note || '',
  completed: row.completed,
  createdAt: row.created_at,
});

const toCompletionEvent = (row: CompletionEventRow): CompletionEvent => ({
  id: row.id,
  taskId: row.task_id,
  userId: row.user_id,
  completed: row.completed,
  occurredAt: row.occurred_at,
});

const ensureAuth = async () => {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw new Error('Not authenticated');
  }
  return data.session;
};

const ensureProfile = async (userId: string, profile: Omit<User, 'id'>) => {
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    household_id: HOUSEHOLD_ID,
    ...profile,
  });
  if (error) throw error;
};

const ensureProfileFromSession = async (sessionUser: { id: string; email?: string | null; user_metadata?: any }) => {
  const name = sessionUser.user_metadata?.name || 'User';
  const avatar = sessionUser.user_metadata?.avatar || '';
  const color = sessionUser.user_metadata?.color || '#4A90E2';
  const email = sessionUser.email || '';
  const role = email.toLowerCase() === 'vedad.hadzihasanovic@gmail.com' ? 'admin' : 'member';

  await ensureProfile(sessionUser.id, { email, name, avatar, color, role });
};

// Auth functions
export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  if (!data.session) {
    throw new Error('No active session. Check your credentials or email confirmation.');
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (!profile) {
    await ensureProfileFromSession(data.session.user);
    const retry = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.session.user.id)
      .single();
    profile = retry.data || null;
    profileError = retry.error || null;
  }

  if (profileError || !profile) {
    const details = profileError?.message || 'Profile row not found';
    throw new Error(`Failed to fetch profile: ${details}`);
  }

  return { user: toUser(profile), accessToken: data.session.access_token };
}

export async function register(
  email: string,
  password: string,
  name: string,
  avatar: string,
  color: string
) {
  const role = email.toLowerCase() === 'vedad.hadzihasanovic@gmail.com' ? 'admin' : 'member';
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, avatar, color, household_id: HOUSEHOLD_ID, role },
    },
  });

  if (error) throw error;

  if (!data.session) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  await ensureProfile(data.session.user.id, { email, name, avatar, color, role });

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .single();

  if (profileError || !profile) {
    const details = profileError?.message || 'Profile row not found';
    throw new Error(`Failed to fetch profile: ${details}`);
  }

  return { user: toUser(profile), accessToken: data.session.access_token };
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function requestPasswordReset(email: string, redirectTo: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.session.user.id)
    .maybeSingle();

  if (!profile) {
    try {
      await ensureProfileFromSession(data.session.user);
      const retry = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
      if (retry.data) {
        return { user: toUser(retry.data), accessToken: data.session.access_token };
      }
    } catch (profileError) {
      console.error('Session profile error:', profileError);
      return null;
    }
  }

  if (error || !profile) {
    console.error('Session profile error:', error?.message || 'Profile row not found');
    return null;
  }

  return { user: toUser(profile), accessToken: data.session.access_token };
}

// Household functions
export async function getHouseholdUsers(): Promise<User[]> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(toUser);
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map(toCategory);
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('categories')
    .insert({
      household_id: HOUSEHOLD_ID,
      name: category.name,
      icon: category.icon,
      color: category.color,
    })
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to add category');
  return toCategory(data);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('categories')
    .update({
      name: updates.name,
      icon: updates.icon,
      color: updates.color,
    })
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to update category');
  return toCategory(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await ensureAuth();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID);

  if (error) throw error;
}

// Task functions
export async function getTasks(): Promise<Task[]> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(toTask);
}

export async function getGroceries(): Promise<GroceryItem[]> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('groceries')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(toGrocery);
}

export async function addGrocery(item: Omit<GroceryItem, 'id' | 'createdAt'>): Promise<GroceryItem> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('groceries')
    .insert({
      household_id: HOUSEHOLD_ID,
      name: item.name,
      quantity: item.quantity,
      note: item.note,
      completed: item.completed,
    })
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to add grocery item');
  return toGrocery(data);
}

export async function updateGrocery(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem> {
  await ensureAuth();
  const payload: Partial<GroceryRow> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.quantity !== undefined) payload.quantity = updates.quantity;
  if (updates.note !== undefined) payload.note = updates.note;
  if (updates.completed !== undefined) payload.completed = updates.completed;

  const { data, error } = await supabase
    .from('groceries')
    .update(payload)
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to update grocery item');
  return toGrocery(data);
}

export async function deleteGrocery(id: string): Promise<void> {
  await ensureAuth();
  const { error } = await supabase
    .from('groceries')
    .delete()
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID);

  if (error) throw error;
}

export async function clearGroceries(): Promise<void> {
  await ensureAuth();
  const { error } = await supabase
    .from('groceries')
    .delete()
    .eq('household_id', HOUSEHOLD_ID);

  if (error) throw error;
}

export async function archiveGroceries(items: GroceryItem[]): Promise<void> {
  await ensureAuth();
  if (items.length === 0) return;

  const { data: archive, error: archiveError } = await supabase
    .from('groceries_archives')
    .insert({
      household_id: HOUSEHOLD_ID,
    })
    .select('*')
    .single();

  if (archiveError || !archive) throw archiveError || new Error('Failed to archive groceries');

  const rows = items.map((item) => ({
    archive_id: archive.id,
    name: item.name,
    quantity: item.quantity,
    note: item.note,
  }));

  const { error: itemsError } = await supabase
    .from('groceries_archive_items')
    .insert(rows);

  if (itemsError) throw itemsError;
}

export async function getRecentGroceriesArchiveItems(limit = 3): Promise<GroceryItem[]> {
  await ensureAuth();
  const { data: archives, error: archiveError } = await supabase
    .from('groceries_archives')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, limit));

  if (archiveError || !archives || archives.length === 0) return [];

  const archiveIds = archives.map((archive) => archive.id);
  const { data: items, error: itemsError } = await supabase
    .from('groceries_archive_items')
    .select('*')
    .in('archive_id', archiveIds);

  if (itemsError || !items) return [];

  const byName = new Map<string, GroceryItem>();
  items.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (byName.has(key)) return;
    const archive = archives.find((entry) => entry.id === item.archive_id);
    byName.set(key, {
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      note: item.note || '',
      completed: false,
      createdAt: archive?.created_at || new Date().toISOString(),
    });
  });

  return Array.from(byName.values());
}

export async function restoreSelectedGroceries(
  selected: GroceryItem[],
  existingNames: string[]
): Promise<GroceryItem[]> {
  await ensureAuth();
  if (selected.length === 0) return [];

  const existingSet = new Set(existingNames.map((name) => name.trim().toLowerCase()));
  const toInsert = selected.filter(
    (item) => !existingSet.has(item.name.trim().toLowerCase())
  );

  if (toInsert.length === 0) return [];

  const { data, error } = await supabase
    .from('groceries')
    .insert(
      toInsert.map((item) => ({
        household_id: HOUSEHOLD_ID,
        name: item.name,
        quantity: item.quantity,
        note: item.note || '',
        completed: false,
      }))
    )
    .select('*');

  if (error || !data) throw error || new Error('Failed to restore groceries');
  return data.map(toGrocery);
}

export async function addTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  await ensureAuth();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      household_id: HOUSEHOLD_ID,
      title: task.title,
      category_id: task.categoryId,
      completed_by: task.completedBy || [],
      frequency: task.frequency,
      rating: task.rating ?? 1,
    })
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to add task');
  return toTask(data);
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  await ensureAuth();
  const payload: Partial<TaskRow> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.completedBy !== undefined) payload.completed_by = updates.completedBy;
  if (updates.frequency !== undefined) payload.frequency = updates.frequency;
  if (updates.rating !== undefined) payload.rating = updates.rating;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to update task');
  return toTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  await ensureAuth();
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('household_id', HOUSEHOLD_ID);

  if (error) throw error;
}

export async function toggleTaskCompletion(taskId: string, userId: string): Promise<Task> {
  await ensureAuth();
  const { data: existing, error: fetchError } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .eq('household_id', HOUSEHOLD_ID)
    .single();

  if (fetchError || !existing) throw fetchError || new Error('Task not found');

  const completedBy = existing.completed_by?.includes(userId)
    ? existing.completed_by.filter((id: string) => id !== userId)
    : [...(existing.completed_by || []), userId];
  const completed = !existing.completed_by?.includes(userId);

  const { data, error } = await supabase
    .from('tasks')
    .update({ completed_by: completedBy })
    .eq('id', taskId)
    .eq('household_id', HOUSEHOLD_ID)
    .select('*')
    .single();

  if (error || !data) throw error || new Error('Failed to toggle task');

  const { error: eventError } = await supabase.from('completion_events').insert({
    task_id: taskId,
    user_id: userId,
    completed,
    occurred_at: new Date().toISOString(),
    household_id: HOUSEHOLD_ID,
  });
  if (eventError) throw eventError;

  return toTask(data);
}

export async function getCompletionEvents(days: number): Promise<CompletionEvent[]> {
  await ensureAuth();
  const since = new Date();
  since.setDate(since.getDate() - Math.max(1, days));

  const { data, error } = await supabase
    .from('completion_events')
    .select('*')
    .eq('household_id', HOUSEHOLD_ID)
    .gte('occurred_at', since.toISOString())
    .order('occurred_at', { ascending: true });

  if (error) throw error;
  return (data || []).map(toCompletionEvent);
}

export async function resetCompletions(): Promise<void> {
  await ensureAuth();
  const { error: deleteError } = await supabase
    .from('completion_events')
    .delete()
    .eq('household_id', HOUSEHOLD_ID);

  if (deleteError) throw deleteError;

  const { error: updateError } = await supabase
    .from('tasks')
    .update({ completed_by: [] })
    .eq('household_id', HOUSEHOLD_ID);

  if (updateError) throw updateError;
}

export async function resetTasksToDefaults(): Promise<void> {
  await ensureAuth();
  const { error: eventsError } = await supabase
    .from('completion_events')
    .delete()
    .eq('household_id', HOUSEHOLD_ID);

  if (eventsError) throw eventsError;

  const { error: tasksError } = await supabase
    .from('tasks')
    .delete()
    .eq('household_id', HOUSEHOLD_ID);

  if (tasksError) throw tasksError;
}

export async function removeHouseholdMember(userId: string): Promise<void> {
  await ensureAuth();
  const { error: eventsError } = await supabase
    .from('completion_events')
    .delete()
    .eq('household_id', HOUSEHOLD_ID)
    .eq('user_id', userId);

  if (eventsError) throw eventsError;

  const { error: profileError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)
    .eq('household_id', HOUSEHOLD_ID);

  if (profileError) throw profileError;
}
