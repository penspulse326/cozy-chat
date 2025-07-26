import { z } from 'zod';

export const Device = z.enum(['APP', 'MB', 'PC']);
export const UserStatus = z.enum(['ACTIVE', 'LEFT']);

export type Device = z.infer<typeof Device>;
export type UserStatus = z.infer<typeof UserStatus>;
