import type { GroceryItem } from '../domain/models';
import { dedupeGroceriesByName } from '../domain/groceries';
import { GroceriesRepository } from '../data/repositories/GroceriesRepository';

export class GroceriesService {
  constructor(private groceriesRepo: GroceriesRepository) {}

  async listGroceries() {
    return this.groceriesRepo.list();
  }

  async addGrocery(item: Omit<GroceryItem, 'id' | 'createdAt'>) {
    return this.groceriesRepo.add(item);
  }

  async updateGrocery(id: string, updates: Partial<GroceryItem>) {
    return this.groceriesRepo.update(id, updates);
  }

  async deleteGrocery(id: string) {
    return this.groceriesRepo.delete(id);
  }

  async clearGroceries(items: GroceryItem[]) {
    if (items.length > 0) {
      await this.archiveGroceries(items);
    }
    await this.groceriesRepo.deleteAll();
  }

  async archiveGroceries(items: GroceryItem[]) {
    if (items.length === 0) return;
    const archive = await this.groceriesRepo.createArchive();
    await this.groceriesRepo.addArchiveItems(
      items.map((item) => ({
        archive_id: archive.id,
        name: item.name,
        quantity: item.quantity,
        note: item.note || '',
      }))
    );
  }

  async getRecentArchiveItems(limit = 3): Promise<GroceryItem[]> {
    const archives = await this.groceriesRepo.listArchives(limit);
    if (archives.length === 0) return [];

    const items = await this.groceriesRepo.listArchiveItems(archives.map((a) => a.id));
    if (items.length === 0) return [];

    const merged = items.map((item) => {
      const archive = archives.find((entry) => entry.id === item.archive_id);
      return {
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        note: item.note || '',
        completed: false,
        createdAt: archive?.created_at || new Date().toISOString(),
      };
    });

    return dedupeGroceriesByName(merged);
  }

  async restoreSelectedGroceries(
    selected: GroceryItem[],
    existingNames: string[]
  ): Promise<GroceryItem[]> {
    if (selected.length === 0) return [];

    const existingSet = new Set(existingNames.map((name) => name.trim().toLowerCase()));
    const toInsert = selected.filter(
      (item) => !existingSet.has(item.name.trim().toLowerCase())
    );

    if (toInsert.length === 0) return [];

    return this.groceriesRepo.addMany(
      toInsert.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        note: item.note || '',
        completed: false,
      }))
    );
  }
}
