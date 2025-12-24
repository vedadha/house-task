import type { Category, CompletionEvent, GroceryItem, Task, UserProfile } from '../domain/models';
import { getDefaultCategories, getDefaultTasks } from '../domain/defaults';
import { CategoriesRepository } from '../data/repositories/CategoriesRepository';
import { CompletionEventsRepository } from '../data/repositories/CompletionEventsRepository';
import { GroceriesRepository } from '../data/repositories/GroceriesRepository';
import { ProfilesRepository } from '../data/repositories/ProfilesRepository';
import { TasksRepository } from '../data/repositories/TasksRepository';

export interface HouseholdData {
  users: UserProfile[];
  categories: Category[];
  tasks: Task[];
  groceries: GroceryItem[];
  completionEvents: CompletionEvent[];
  seededTaskCount: number;
}

export class HouseholdService {
  constructor(
    private profilesRepo: ProfilesRepository,
    private categoriesRepo: CategoriesRepository,
    private tasksRepo: TasksRepository,
    private groceriesRepo: GroceriesRepository,
    private completionRepo: CompletionEventsRepository
  ) {}

  async loadHouseholdData(days: number): Promise<HouseholdData> {
    const [users, categories, taskList, groceries] = await Promise.all([
      this.profilesRepo.listByHousehold(),
      this.categoriesRepo.list(),
      this.tasksRepo.list(),
      this.groceriesRepo.list(),
    ]);

    let events: CompletionEvent[] = [];
    try {
      events = await this.completionRepo.listRecent(days);
    } catch (error) {
      console.error('Completion history error:', error);
    }

    let resolvedCategories = categories;
    let resolvedTasks = taskList;
    const originalTaskCount = taskList.length;

    if (resolvedCategories.length === 0) {
      const defaults = getDefaultCategories();
      const created: Category[] = [];
      for (const cat of defaults) {
        created.push(await this.categoriesRepo.add(cat));
      }
      resolvedCategories = created;
    }

    if (resolvedCategories.length > 0) {
      if (resolvedTasks.length === 0) {
        const defaults = getDefaultTasks(resolvedCategories);
        const created: Task[] = [];
        for (const task of defaults) {
          created.push(await this.tasksRepo.add(task));
        }
        resolvedTasks = created;
      } else {
        resolvedTasks = await this.seedMissingDefaultTasks(resolvedTasks, resolvedCategories);
      }
    }

    return {
      users,
      categories: resolvedCategories,
      tasks: resolvedTasks,
      groceries,
      completionEvents: events,
      seededTaskCount: resolvedTasks.length - originalTaskCount,
    };
  }

  private async seedMissingDefaultTasks(
    existing: Task[],
    categories: Category[]
  ): Promise<Task[]> {
    const defaults = getDefaultTasks(categories);
    if (defaults.length === 0) return existing;

    const existingTitles = new Set(
      existing.map((task) => task.title.trim().toLowerCase())
    );

    const toCreate = defaults.filter(
      (task) => !existingTitles.has(task.title.trim().toLowerCase())
    );

    if (toCreate.length === 0) return existing;

    const created: Task[] = [];
    for (const task of toCreate) {
      created.push(await this.tasksRepo.add(task));
    }

    return [...existing, ...created];
  }
}
