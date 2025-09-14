import { z } from 'zod';

export const deviceSchema = z.enum(['APP', 'MB', 'PC']);
export const userStatusSchema = z.enum(['ACTIVE', 'LEFT']);

export const userDtoSchema = z.object({
  created_at: z.date(),
  device: deviceSchema,
  id: z.string(),
  last_active_at: z.date(),
  room_id: z.string().optional(),
  status: userStatusSchema,
});

export const createUserDtoSchema = userDtoSchema.omit({
  id: true,
  room_id: true,
});

export const updateUserStatusDtoSchema = userDtoSchema.pick({
  id: true,
  status: true,
});

export const updateUserLastActiveAtDtoSchema = userDtoSchema.pick({
  id: true,
  last_active_at: true,
});

export const chatRoomDtoSchema = z.object({
  created_at: z.date(),
  id: z.string(),
  users: z.array(z.string()),
});

export const createChatRoomDtoSchema = chatRoomDtoSchema.omit({
  id: true,
});

export const chatMessageDtoSchema = z.object({
  content: z.string(),
  created_at: z.date(),
  device: deviceSchema,
  id: z.string(),
  room_id: z.string(),
  user_id: z.string(),
});

export const createChatMessageDtoSchema = chatMessageDtoSchema.omit({
  id: true,
});
