import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category } from '../../domain/models';
import { HOUSEHOLD_ID } from '../../domain/constants';
import { toCategory } from '../mappers';
import type { CategoryRow } from '../rows';

export class CategoriesRepository {
  constructor(private client: SupabaseClient) {}

  async list(householdId: string = HOUSEHOLD_ID): Promise<Category[]> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('household_id', householdId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(toCategory);
  }

  async add(category: Omit<Category, 'id'>, householdId: string = HOUSEHOLD_ID): Promise<Category> {
    const { data, error } = await this.client
      .from('categories')
      .insert({
        household_id: householdId,
        name: category.name,
        icon: category.icon,
        color: category.color,
      })
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to add category');
    return toCategory(data as CategoryRow);
  }

  async update(
    id: string,
    updates: Partial<Category>,
    householdId: string = HOUSEHOLD_ID
  ): Promise<Category> {
    const payload: Partial<CategoryRow> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.icon !== undefined) payload.icon = updates.icon;
    if (updates.color !== undefined) payload.color = updates.color;

    const { data, error } = await this.client
      .from('categories')
      .update(payload)
      .eq('id', id)
      .eq('household_id', householdId)
      .select('*')
      .single();

    if (error || !data) throw error || new Error('Failed to update category');
    return toCategory(data as CategoryRow);
  }

  async delete(id: string, householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
  }
}
