export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  household_id: string;
  role: 'admin' | 'member';
}

export interface CategoryRow {
  id: string;
  name: string;
  icon: string;
  color: string;
  household_id: string;
}

export interface TaskRow {
  id: string;
  title: string;
  category_id: string;
  completed_by: string[];
  frequency: 'daily' | 'weekly';
  created_at: string;
  household_id: string;
  rating: number | null;
}

export interface GroceryRow {
  id: string;
  name: string;
  quantity: number;
  note: string | null;
  completed: boolean;
  created_at: string;
  household_id: string;
}

export interface GroceryArchiveRow {
  id: string;
  household_id: string;
  created_at: string;
}

export interface GroceryArchiveItemRow {
  id: string;
  archive_id: string;
  name: string;
  quantity: number;
  note: string | null;
}

export interface CompletionEventRow {
  id: string;
  task_id: string;
  user_id: string;
  completed: boolean;
  occurred_at: string;
  household_id: string;
}
