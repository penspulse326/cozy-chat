import type { z } from 'zod';

import type {
  ChatMessageSchema,
  ChatRoomSchema,
  CreateChatMessageSchema,
  UpdateUserLastActiveAtSchema,
  UpdateUserStatusSchema,
  UserSchema,
} from '../schemas';

export type ChatMessagePayload = z.infer<typeof ChatMessageSchema>;
export type ChatRoomPayload = z.infer<typeof ChatRoomSchema>;
export type CreateChatMessagePayload = z.infer<typeof CreateChatMessageSchema>;
export type UpdateUserLastActiveAtPayload = z.infer<
  typeof UpdateUserLastActiveAtSchema
>;
export type UpdateUserStatusPayload = z.infer<typeof UpdateUserStatusSchema>;
export type UserPayload = z.infer<typeof UserSchema>;
