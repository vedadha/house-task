import { describe, it, expect } from 'vitest';
import { getPeriodStart, isTaskCompletedInPeriod, isTaskCompletedToday } from './logic';
import type { CompletionEvent } from './models';

describe('logic', () => {
  it('returns week start on Monday for weekly period', () => {
    const now = new Date(2025, 0, 8, 12);
    const start = getPeriodStart('weekly', now);
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(6);
  });

  it('detects latest weekly completion state', () => {
    const now = new Date(2025, 0, 8, 12);
    const events: CompletionEvent[] = [
      {
        id: '1',
        taskId: 'task-1',
        userId: 'user-1',
        completed: true,
        occurredAt: new Date(2025, 0, 6, 9).toISOString(),
      },
      {
        id: '2',
        taskId: 'task-1',
        userId: 'user-1',
        completed: false,
        occurredAt: new Date(2025, 0, 7, 10).toISOString(),
      },
    ];

    expect(
      isTaskCompletedInPeriod('task-1', 'user-1', 'weekly', events, now)
    ).toBe(false);
  });

  it('detects daily completion using today key', () => {
    const now = new Date(2025, 0, 8, 12);
    const events: CompletionEvent[] = [
      {
        id: '1',
        taskId: 'task-1',
        userId: 'user-1',
        completed: true,
        occurredAt: new Date(2025, 0, 8, 7).toISOString(),
      },
    ];

    expect(
      isTaskCompletedToday('task-1', 'user-1', events, now)
    ).toBe(true);
  });
});
