import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompletionEvent } from '../../domain/models';
import { HOUSEHOLD_ID } from '../../domain/constants';
import { toCompletionEvent } from '../mappers';
import type { CompletionEventRow } from '../rows';

export class CompletionEventsRepository {
  constructor(private client: SupabaseClient) {}

  async listRecent(days: number, householdId: string = HOUSEHOLD_ID): Promise<CompletionEvent[]> {
    const since = new Date();
    since.setDate(since.getDate() - Math.max(1, days));

    const { data, error } = await this.client
      .from('completion_events')
      .select('*')
      .eq('household_id', householdId)
      .gte('occurred_at', since.toISOString())
      .order('occurred_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toCompletionEvent);
  }

  async add(
    event: Omit<CompletionEvent, 'id'>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<CompletionEvent> {
    const { data, error } = await this.client
      .from('completion_events')
      .insert({
        task_id: event.taskId,
        user_id: event.userId,
        completed: event.completed,
        occurred_at: event.occurredAt,
        household_id: householdId,
      })
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to log completion');
    return toCompletionEvent(data as CompletionEventRow);
  }

  async deleteAll(householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('completion_events')
      .delete()
      .eq('household_id', householdId);

    if (error) throw error;
  }

  async deleteByUser(userId: string, householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('completion_events')
      .delete()
      .eq('household_id', householdId)
      .eq('user_id', userId);

    if (error) throw error;
  }
}
