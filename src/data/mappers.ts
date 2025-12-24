import type { Category, CompletionEvent, GroceryItem, Task, UserProfile } from '../domain/models';
import type {
  CategoryRow,
  CompletionEventRow,
  GroceryRow,
  ProfileRow,
  TaskRow,
} from './rows';

export const toUserProfile = (row: ProfileRow): UserProfile => ({
  id: row.id,
  name: row.name,
  email: row.email,
  avatar: row.avatar,
  color: row.color,
  role: row.role,
});

export const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  icon: row.icon,
  color: row.color,
});

export const toTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  categoryId: row.category_id,
  completedBy: row.completed_by || [],
  frequency: row.frequency,
  createdAt: row.created_at,
  rating: row.rating ?? 1,
});

export const toGroceryItem = (row: GroceryRow): GroceryItem => ({
  id: row.id,
  name: row.name,
  quantity: row.quantity,
  note: row.note || '',
  completed: row.completed,
  createdAt: row.created_at,
});

export const toCompletionEvent = (row: CompletionEventRow): CompletionEvent => ({
  id: row.id,
  taskId: row.task_id,
  userId: row.user_id,
  completed: row.completed,
  occurredAt: row.occurred_at,
});
