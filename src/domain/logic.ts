import type { CompletionEvent, Task } from './models';
import type { TaskFrequency } from './constants';
import { FREQUENCY_DAILY } from './constants';

export const getDayKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekStart = (now: Date = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  return start;
};

export const getPeriodStart = (frequency: TaskFrequency, now: Date = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (frequency === FREQUENCY_DAILY) {
    return start;
  }
  const day = start.getDay();
  const diff = day === 0 ? 6 : day - 1;
  start.setDate(start.getDate() - diff);
  return start;
};

export const isTaskCompletedInPeriod = (
  taskId: string,
  userId: string,
  frequency: TaskFrequency,
  events: CompletionEvent[],
  now: Date = new Date()
) => {
  const periodStart = getPeriodStart(frequency, now);
  const relevant = events
    .filter((event) => event.taskId === taskId && event.userId === userId)
    .filter((event) => new Date(event.occurredAt) >= periodStart)
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  if (relevant.length === 0) return false;
  return relevant[relevant.length - 1].completed;
};

export const isTaskCompletedToday = (
  taskId: string,
  userId: string,
  events: CompletionEvent[],
  now: Date = new Date()
) => {
  const todayKey = getDayKey(now);
  const relevant = events
    .filter((event) => event.taskId === taskId && event.userId === userId)
    .filter((event) => getDayKey(new Date(event.occurredAt)) === todayKey)
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());

  if (relevant.length === 0) return false;
  return relevant[relevant.length - 1].completed;
};

export const computeWeeklyCompletion = (
  tasks: Task[],
  userId: string,
  events: CompletionEvent[],
  now: Date = new Date()
) => {
  const weeklyTasks = tasks.filter((task) => task.frequency === 'weekly');
  const completed = weeklyTasks.filter((task) =>
    isTaskCompletedInPeriod(task.id, userId, 'weekly', events, now)
  ).length;
  return { total: weeklyTasks.length, completed };
};

export const computeDailyCompletion = (
  tasks: Task[],
  userId: string,
  events: CompletionEvent[],
  now: Date = new Date()
) => {
  const dailyTasks = tasks.filter((task) => task.frequency === 'daily');
  const completed = dailyTasks.filter((task) =>
    isTaskCompletedToday(task.id, userId, events, now)
  ).length;
  return { total: dailyTasks.length, completed };
};
