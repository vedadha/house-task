import { describe, it, expect } from 'vitest';
import { dedupeGroceriesByName } from './groceries';

describe('dedupeGroceriesByName', () => {
  it('keeps first occurrence and removes duplicates (case-insensitive)', () => {
    const items = [
      { id: '1', name: 'Milk' },
      { id: '2', name: 'milk' },
      { id: '3', name: 'Bread' },
    ];

    const result = dedupeGroceriesByName(items);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('3');
  });
});
