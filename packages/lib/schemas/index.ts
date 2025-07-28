import { z } from 'zod';

export const Device = z.enum(['APP', 'MB', 'PC']);
export const UserStatus = z.enum(['ACTIVE', 'LEFT']);

export const UserSchema = z.object({
  _id: z.string(),
  room_id: z.string(),
  device: Device,
  status: UserStatus,
  last_active_at: z.date(),
  created_at: z.date(),
});

export const UpdateUserStatusSchema = UserSchema.pick({
  _id: true,
  status: true,
});

export const UpdateUserLastActiveAtSchema = UserSchema.pick({
  _id: true,
  last_active_at: true,
});

export const ChatRoomSchema = z.object({
  _id: z.string(),
  users: z.array(z.string()),
  created_at: z.date(),
});
