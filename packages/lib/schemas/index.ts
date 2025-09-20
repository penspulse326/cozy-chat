import { z } from 'zod';

export const deviceSchema = z.enum(['APP', 'MB', 'PC']);
export const userStatusSchema = z.enum(['ACTIVE', 'LEFT']);

export const userDtoSchema = z.object({
  createdAt: z.date(),
  device: deviceSchema,
  id: z.string(),
  lastActiveAt: z.date(),
  roomId: z.string().optional(),
  status: userStatusSchema,
});

export const createUserDtoSchema = userDtoSchema.omit({
  id: true,
  roomId: true,
});

export const updateUserStatusDtoSchema = userDtoSchema.pick({
  id: true,
  status: true,
});

export const updateUserLastActiveAtDtoSchema = userDtoSchema.pick({
  id: true,
  lastActiveAt: true,
});

export const chatRoomDtoSchema = z.object({
  createdAt: z.date(),
  id: z.string(),
  users: z.array(z.string()),
});

export const createChatRoomDtoSchema = chatRoomDtoSchema.omit({
  id: true,
});

export const chatMessageDtoSchema = z.object({
  content: z.string(),
  createdAt: z.date(),
  device: deviceSchema,
  id: z.string(),
  roomId: z.string(),
  userId: z.string(),
});

export const createChatMessageDtoSchema = chatMessageDtoSchema.omit({
  id: true,
});
