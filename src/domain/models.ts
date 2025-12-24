import type { TaskFrequency, UserRole } from './constants';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  role?: UserRole;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string;
  completedBy: string[];
  frequency: TaskFrequency;
  createdAt: string;
  rating: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  note: string;
  completed: boolean;
  createdAt: string;
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
