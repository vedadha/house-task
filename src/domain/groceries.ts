export const dedupeGroceriesByName = <T extends { name: string }>(items: T[]) => {
  const byName = new Map<string, T>();
  items.forEach((item) => {
    const key = item.name.trim().toLowerCase();
    if (byName.has(key)) return;
    byName.set(key, item);
  });
  return Array.from(byName.values());
};
