import type { z } from 'zod';

import type {
  CreateChatRoomSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserSchema,
} from '../schemas';

export type ChatMessage = {
  created_at: Date;
  message: string;
  roomId: string;
};
export type ChatRoom = {
  _id: string;
  created_at: Date;
  updated_at: Date;
  users: string[];
};
export type CreateChatRoomPayload = z.infer<typeof CreateChatRoomSchema>;

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

export type User = z.infer<typeof UserSchema>;
