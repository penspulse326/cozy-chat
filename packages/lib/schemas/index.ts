import { z } from 'zod';

export const Device = z.enum(['APP', 'MB', 'PC']);
export const UserStatus = z.enum(['ACTIVE', 'LEFT']);

export const UserSchema = z.object({
  _id: z.string(),
  created_at: z.date(),
  device: Device,
  last_active_at: z.date(),
  room_id: z.string().optional(),
  status: UserStatus,
});

export const CreateUserSchema = UserSchema.omit({
  room_id: true,
});

export const UpdateUserSchema = UserSchema.omit({
  created_at: true,
  device: true,
});

export const ChatRoomSchema = z.object({
  _id: z.string(),
  created_at: z.date(),
  updated_at: z.date(),
  users: z.array(z.string()),
});

export const CreateChatRoomSchema = ChatRoomSchema.omit({
  _id: true,
  created_at: true,
  updated_at: true,
});
