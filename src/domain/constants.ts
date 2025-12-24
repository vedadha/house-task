export const HOUSEHOLD_ID = 'default';

export const ADMIN_EMAIL = 'vedad.hadzihasanovic@gmail.com';

export const ROLE_ADMIN = 'admin';
export const ROLE_MEMBER = 'member';

export type UserRole = typeof ROLE_ADMIN | typeof ROLE_MEMBER;

export const FREQUENCY_DAILY = 'daily';
export const FREQUENCY_WEEKLY = 'weekly';

export type TaskFrequency = typeof FREQUENCY_DAILY | typeof FREQUENCY_WEEKLY;
