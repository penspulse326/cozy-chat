import { z } from 'zod';

export const Device = z.enum(['APP', 'MB', 'PC']);
export const UserStatus = z.enum(['ACTIVE', 'LEFT']);

export const UserSchema = z.object({
  _id: z.string(),
  room_id: z.string().optional(),
  device: Device,
  status: UserStatus,
  last_active_at: z.date(),
  created_at: z.date(),
});

export const CreateUserSchema = UserSchema.omit({
  room_id: true,
});

export const UpdateUserSchema = UserSchema.omit({
  device: true,
  created_at: true,
});
