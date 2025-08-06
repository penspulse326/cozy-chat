import { z } from 'zod';

export const DeviceSchema = z.enum(['APP', 'MB', 'PC']);
export const UserStatusSchema = z.enum(['ACTIVE', 'LEFT']);

export const UserSchema = z.object({
  _id: z.string(),
  created_at: z.date(),
  device: DeviceSchema,
  last_active_at: z.date(),
  room_id: z.string(),
  status: UserStatusSchema,
});

export const CreateUserSchema = UserSchema.omit({
  _id: true,
  room_id: true,
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
  created_at: z.date(),
  users: z.array(z.string()),
});

export const CreateChatRoomSchema = ChatRoomSchema.omit({
  _id: true,
});

export const ChatMessageSchema = z.object({
  _id: z.string(),
  content: z.string(),
  created_at: z.date(),
  room_id: z.string(),
  user_id: z.string(),
});

export const CreateChatMessageSchema = ChatMessageSchema.omit({
  _id: true,
});
