import type { z } from 'zod';

import type {
  ChatRoomSchema,
  UpdateUserLastActiveAtSchema,
  UpdateUserStatusSchema,
  UserSchema,
} from '../schemas';

export type ChatMessage = {
  created_at: Date;
  message: string;
  roomId: string;
};

export type ChatRoom = z.infer<typeof ChatRoomSchema>;

export type UpdateUserLastActiveAtPayload = z.infer<
  typeof UpdateUserLastActiveAtSchema
>;
export type UpdateUserStatusPayload = z.infer<typeof UpdateUserStatusSchema>;

export type User = z.infer<typeof UserSchema>;
