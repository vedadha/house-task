import type { Category } from '../domain/models';
import { CategoriesRepository } from '../data/repositories/CategoriesRepository';

export class CategoriesService {
  constructor(private categoriesRepo: CategoriesRepository) {}

  async addCategory(category: Omit<Category, 'id'>) {
    return this.categoriesRepo.add(category);
  }

  async updateCategory(id: string, updates: Partial<Category>) {
    return this.categoriesRepo.update(id, updates);
  }

  async deleteCategory(id: string) {
    return this.categoriesRepo.delete(id);
  }
}
