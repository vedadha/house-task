import { getSupabaseClient } from '../data/supabaseClient';
import { CategoriesRepository } from '../data/repositories/CategoriesRepository';
import { CompletionEventsRepository } from '../data/repositories/CompletionEventsRepository';
import { GroceriesRepository } from '../data/repositories/GroceriesRepository';
import { ProfilesRepository } from '../data/repositories/ProfilesRepository';
import { TasksRepository } from '../data/repositories/TasksRepository';
import { AdminService } from './adminService';
import { AuthService } from './authService';
import { CategoriesService } from './categoriesService';
import { GroceriesService } from './groceriesService';
import { HouseholdService } from './householdService';
import { TasksService } from './tasksService';

export const createAppServices = () => {
  const client = getSupabaseClient();
  const profilesRepo = new ProfilesRepository(client);
  const categoriesRepo = new CategoriesRepository(client);
  const tasksRepo = new TasksRepository(client);
  const groceriesRepo = new GroceriesRepository(client);
  const completionRepo = new CompletionEventsRepository(client);

  return {
    authService: new AuthService(client, profilesRepo),
    householdService: new HouseholdService(
      profilesRepo,
      categoriesRepo,
      tasksRepo,
      groceriesRepo,
      completionRepo
    ),
    categoriesService: new CategoriesService(categoriesRepo),
    tasksService: new TasksService(tasksRepo, completionRepo),
    groceriesService: new GroceriesService(groceriesRepo),
    adminService: new AdminService(completionRepo, tasksRepo, profilesRepo),
    categoriesRepository: categoriesRepo,
    tasksRepository: tasksRepo,
    completionRepository: completionRepo,
    profilesRepository: profilesRepo,
  };
};
