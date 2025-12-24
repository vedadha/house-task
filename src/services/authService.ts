import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from '../domain/models';
import { ADMIN_EMAIL, HOUSEHOLD_ID, ROLE_ADMIN, ROLE_MEMBER } from '../domain/constants';
import { ProfilesRepository } from '../data/repositories/ProfilesRepository';

export class AuthService {
  constructor(
    private client: SupabaseClient,
    private profilesRepo: ProfilesRepository
  ) {}

  private resolveRole(email: string) {
    return email.toLowerCase() === ADMIN_EMAIL ? ROLE_ADMIN : ROLE_MEMBER;
  }

  private async ensureProfileFromSession(user: {
    id: string;
    email?: string | null;
    user_metadata?: Record<string, unknown>;
  }) {
    const metadata = user.user_metadata || {};
    const name = typeof metadata.name === 'string' ? metadata.name : 'User';
    const avatar = typeof metadata.avatar === 'string' ? metadata.avatar : '';
    const color = typeof metadata.color === 'string' ? metadata.color : '#4A90E2';
    const email = user.email || '';
    const role = this.resolveRole(email);

    await this.profilesRepo.upsert({
      id: user.id,
      name,
      email,
      avatar,
      color,
      role,
      householdId: HOUSEHOLD_ID,
    });
  }

  private async getProfileOrThrow(userId: string): Promise<UserProfile> {
    const profile = await this.profilesRepo.getById(userId);
    if (!profile) {
      throw new Error('Failed to fetch profile: Profile row not found');
    }
    return profile;
  }

  async login(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) {
      throw new Error('No active session. Check your credentials or email confirmation.');
    }

    let profile = await this.profilesRepo.getById(data.session.user.id);
    if (!profile) {
      await this.ensureProfileFromSession(data.session.user);
      profile = await this.getProfileOrThrow(data.session.user.id);
    }

    return { user: profile, accessToken: data.session.access_token };
  }

  async register(email: string, password: string, name: string, avatar: string, color: string) {
    const role = this.resolveRole(email);
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: { name, avatar, color, household_id: HOUSEHOLD_ID, role },
      },
    });

    if (error) throw error;
    if (!data.session) {
      throw new Error('Check your email to confirm your account, then sign in.');
    }

    await this.profilesRepo.upsert({
      id: data.session.user.id,
      name,
      email,
      avatar,
      color,
      role,
      householdId: HOUSEHOLD_ID,
    });

    const profile = await this.getProfileOrThrow(data.session.user.id);
    return { user: profile, accessToken: data.session.access_token };
  }

  async logout() {
    await this.client.auth.signOut();
  }

  async requestPasswordReset(email: string, redirectTo: string) {
    const { error } = await this.client.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async checkSession() {
    const { data } = await this.client.auth.getSession();
    if (!data.session) return null;

    let profile = await this.profilesRepo.getById(data.session.user.id);
    if (!profile) {
      try {
        await this.ensureProfileFromSession(data.session.user);
        profile = await this.getProfileOrThrow(data.session.user.id);
      } catch (error) {
        console.error('Session profile error:', error);
        return null;
      }
    }

    return { user: profile, accessToken: data.session.access_token };
  }
}
