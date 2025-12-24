import type { Task } from '../domain/models';
import { CompletionEventsRepository } from '../data/repositories/CompletionEventsRepository';
import { TasksRepository } from '../data/repositories/TasksRepository';

export class TasksService {
  constructor(
    private tasksRepo: TasksRepository,
    private completionRepo: CompletionEventsRepository
  ) {}

  async toggleTaskCompletion(taskId: string, userId: string) {
    const existing = await this.tasksRepo.getById(taskId);
    if (!existing) {
      throw new Error('Task not found');
    }

    const alreadyCompleted = existing.completedBy.includes(userId);
    const nextCompletedBy = alreadyCompleted
      ? existing.completedBy.filter((id) => id !== userId)
      : [...existing.completedBy, userId];
    const completed = !alreadyCompleted;

    const updatedTask = await this.tasksRepo.update(taskId, {
      completedBy: nextCompletedBy,
    });

    const event = await this.completionRepo.add({
      taskId,
      userId,
      completed,
      occurredAt: new Date().toISOString(),
    });

    return { task: updatedTask, event };
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    return this.tasksRepo.add(task);
  }

  async updateTask(id: string, updates: Partial<Task>) {
    return this.tasksRepo.update(id, updates);
  }

  async deleteTask(id: string) {
    return this.tasksRepo.delete(id);
  }
}
