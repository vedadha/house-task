import { CompletionEventsRepository } from '../data/repositories/CompletionEventsRepository';
import { ProfilesRepository } from '../data/repositories/ProfilesRepository';
import { TasksRepository } from '../data/repositories/TasksRepository';

export class AdminService {
  constructor(
    private completionRepo: CompletionEventsRepository,
    private tasksRepo: TasksRepository,
    private profilesRepo: ProfilesRepository
  ) {}

  async resetCompletions() {
    await this.completionRepo.deleteAll();
    await this.tasksRepo.clearCompletedBy();
  }

  async resetTasksToDefaults() {
    await this.completionRepo.deleteAll();
    await this.tasksRepo.deleteAll();
  }

  async removeMember(userId: string) {
    await this.completionRepo.deleteByUser(userId);
    await this.profilesRepo.deleteById(userId);
  }
}
