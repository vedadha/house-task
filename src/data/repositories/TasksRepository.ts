import type { SupabaseClient } from '@supabase/supabase-js';
import type { Task } from '../../domain/models';
import { HOUSEHOLD_ID } from '../../domain/constants';
import { toTask } from '../mappers';
import type { TaskRow } from '../rows';

export class TasksRepository {
  constructor(private client: SupabaseClient) {}

  async list(householdId: string = HOUSEHOLD_ID): Promise<Task[]> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toTask);
  }

  async getById(id: string, householdId: string = HOUSEHOLD_ID): Promise<Task | null> {
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('household_id', householdId)
      .maybeSingle();

    if (error) throw error;
    return data ? toTask(data as TaskRow) : null;
  }

  async add(task: Omit<Task, 'id' | 'createdAt'>, householdId: string = HOUSEHOLD_ID): Promise<Task> {
    const { data, error } = await this.client
      .from('tasks')
      .insert({
        household_id: householdId,
        title: task.title,
        category_id: task.categoryId,
        completed_by: task.completedBy || [],
        frequency: task.frequency,
        rating: task.rating ?? 1,
      })
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to add task');
    return toTask(data as TaskRow);
  }

  async update(
    id: string,
    updates: Partial<Task>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<Task> {
    const payload: Partial<TaskRow> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
    if (updates.completedBy !== undefined) payload.completed_by = updates.completedBy;
    if (updates.frequency !== undefined) payload.frequency = updates.frequency;
    if (updates.rating !== undefined) payload.rating = updates.rating;

    const { data, error } = await this.client
      .from('tasks')
      .update(payload)
      .eq('id', id)
      .eq('household_id', householdId)
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to update task');
    return toTask(data as TaskRow);
  }

  async delete(id: string, householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
  }

  async clearCompletedBy(householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('tasks')
      .update({ completed_by: [] })
      .eq('household_id', householdId);

    if (error) throw error;
  }

  async deleteAll(householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('tasks')
      .delete()
      .eq('household_id', householdId);

    if (error) throw error;
  }
}
