import { z } from 'zod';

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

const UserSchema = z.object({
  _id: z.string(),
  room_id: z.string().optional(),
  device: z.enum(['APP', 'MB', 'PC']),
  status: z.enum(['ACTIVE', 'LEFT']),
  last_active_at: z.date(),
  created_at: z.date(),
});

const CreateUserSchema = UserSchema.omit({
  room_id: true,
});

const UpdateUserSchema = UserSchema.omit({
  device: true,
  created_at: true,
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;
