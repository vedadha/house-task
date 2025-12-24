import type { SupabaseClient } from '@supabase/supabase-js';
import type { GroceryItem } from '../../domain/models';
import { HOUSEHOLD_ID } from '../../domain/constants';
import { toGroceryItem } from '../mappers';
import type {
  GroceryArchiveItemRow,
  GroceryArchiveRow,
  GroceryRow,
} from '../rows';

export class GroceriesRepository {
  constructor(private client: SupabaseClient) {}

  async list(householdId: string = HOUSEHOLD_ID): Promise<GroceryItem[]> {
    const { data, error } = await this.client
      .from('groceries')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return (data || []).map(toGroceryItem);
  }

  async add(
    item: Omit<GroceryItem, 'id' | 'createdAt'>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<GroceryItem> {
    const { data, error } = await this.client
      .from('groceries')
      .insert({
        household_id: householdId,
        name: item.name,
        quantity: item.quantity,
        note: item.note,
        completed: item.completed,
      })
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to add grocery item');
    return toGroceryItem(data as GroceryRow);
  }

  async addMany(
    items: Array<Omit<GroceryItem, 'id' | 'createdAt'>>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<GroceryItem[]> {
    if (items.length === 0) return [];
    const { data, error } = await this.client
      .from('groceries')
      .insert(
        items.map((item) => ({
          household_id: householdId,
          name: item.name,
          quantity: item.quantity,
          note: item.note,
          completed: item.completed,
        }))
      )
      .select('*');

    if (error || !data) throw error || new Error('Failed to restore groceries');
    return (data || []).map((row) => toGroceryItem(row as GroceryRow));
  }

  async update(
    id: string,
    updates: Partial<GroceryItem>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<GroceryItem> {
    const payload: Partial<GroceryRow> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.quantity !== undefined) payload.quantity = updates.quantity;
    if (updates.note !== undefined) payload.note = updates.note;
    if (updates.completed !== undefined) payload.completed = updates.completed;

    const { data, error } = await this.client
      .from('groceries')
      .update(payload)
      .eq('id', id)
      .eq('household_id', householdId)
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to update grocery item');
    return toGroceryItem(data as GroceryRow);
  }

  async delete(id: string, householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('groceries')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
  }

  async deleteAll(householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('groceries')
      .delete()
      .eq('household_id', householdId);

    if (error) throw error;
  }

  async createArchive(householdId: string = HOUSEHOLD_ID): Promise<GroceryArchiveRow> {
    const { data, error } = await this.client
      .from('groceries_archives')
      .insert({ household_id: householdId })
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to archive groceries');
    return data as GroceryArchiveRow;
  }

  async addArchiveItems(items: Array<Omit<GroceryArchiveItemRow, 'id'>>): Promise<void> {
    const { error } = await this.client.from('groceries_archive_items').insert(items);
    if (error) throw error;
  }

  async listArchives(
    limit: number,
    householdId: string = HOUSEHOLD_ID
  ): Promise<GroceryArchiveRow[]> {
    const { data, error } = await this.client
      .from('groceries_archives')
      .select('*')
      .eq('household_id', householdId)
      .order('created_at', { ascending: false })
      .limit(Math.max(1, limit));

    if (error) throw error;
    return (data || []) as GroceryArchiveRow[];
  }

  async listArchiveItems(archiveIds: string[]): Promise<GroceryArchiveItemRow[]> {
    if (archiveIds.length === 0) return [];
    const { data, error } = await this.client
      .from('groceries_archive_items')
      .select('*')
      .in('archive_id', archiveIds);

    if (error) throw error;
    return (data || []) as GroceryArchiveItemRow[];
  }
}
