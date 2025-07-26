import { z } from 'zod';

import { Device, UserStatus } from './const';

const UserSchema = z.object({
  _id: z.string(),
  room_id: z.string().optional(),
  device: Device,
  status: UserStatus,
  last_active_at: z.date(),
  created_at: z.date(),
});

const _CreateUserSchema = UserSchema.omit({
  room_id: true,
});

const _UpdateUserSchema = UserSchema.omit({
  device: true,
  created_at: true,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserPayload = z.infer<typeof _CreateUserSchema>;
export type UpdateUserPayload = z.infer<typeof _UpdateUserSchema>;

export type ChatMessage = {
  roomId: string;
  message: string;
  created_at: Date;
};

export type ChatRoom = {
  _id: string;
  users: string[];
  created_at: Date;
};
