import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from '../../domain/models';
import type { UserRole } from '../../domain/constants';
import { HOUSEHOLD_ID } from '../../domain/constants';
import { toUserProfile } from '../mappers';
import type { ProfileRow } from '../rows';

export class ProfilesRepository {
  constructor(private client: SupabaseClient) {}

  async listByHousehold(householdId: string = HOUSEHOLD_ID): Promise<UserProfile[]> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('household_id', householdId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data || []).map(toUserProfile);
  }

  async getById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? toUserProfile(data as ProfileRow) : null;
  }

  async upsert(profile: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    color: string;
    role: UserRole;
    householdId?: string;
  }): Promise<void> {
    const { error } = await this.client.from('profiles').upsert({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar,
      color: profile.color,
      role: profile.role,
      household_id: profile.householdId || HOUSEHOLD_ID,
    });

    if (error) throw error;
  }

  async deleteById(id: string, householdId: string = HOUSEHOLD_ID): Promise<void> {
    const { error } = await this.client
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('household_id', householdId);

    if (error) throw error;
  }
}
