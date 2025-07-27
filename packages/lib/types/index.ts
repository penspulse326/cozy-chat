import type { z } from 'zod';

import type {
  CreateUserSchema,
  UpdateUserSchema,
  UserSchema,
} from '../schemas';

export type User = z.infer<typeof UserSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

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
