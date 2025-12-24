import { describe, it, expect } from 'vitest';
import { getTaskPoints, sumTaskPoints } from './points';

describe('points', () => {
  it('returns rating for task or default of 1', () => {
    const ratingByTask = new Map<string, number>([
      ['task-1', 3],
    ]);

    expect(getTaskPoints('task-1', ratingByTask)).toBe(3);
    expect(getTaskPoints('task-2', ratingByTask)).toBe(1);
  });

  it('sums task points with defaults', () => {
    const ratingByTask = new Map<string, number>([
      ['task-1', 2],
      ['task-2', 4],
    ]);

    expect(sumTaskPoints(['task-1', 'task-2', 'task-3'], ratingByTask)).toBe(7);
  });
});
