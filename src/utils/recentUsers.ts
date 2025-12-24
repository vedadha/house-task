import type { RecentUser, UserProfile } from '../domain/models';

const STORAGE_KEY = 'recent-users';

export const loadRecentUsers = (): RecentUser[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RecentUser[];
  } catch {
    return [];
  }
};

export const saveRecentUsers = (users: RecentUser[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const buildRecentUsers = (current: RecentUser[], user: UserProfile) => {
  return [
    { email: user.email, name: user.name, avatar: user.avatar, color: user.color },
    ...current.filter((entry) => entry.email !== user.email),
  ].slice(0, 5);
};
