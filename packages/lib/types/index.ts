import type { z } from 'zod';

import type {
  ChatMessageSchema,
  ChatRoomSchema,
  CreateChatMessageSchema,
  CreateChatRoomSchema,
  CreateUserSchema,
  UpdateUserLastActiveAtSchema,
  UpdateUserStatusSchema,
  UserSchema,
} from '../schemas';

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRoom = z.infer<typeof ChatRoomSchema>;
export type CreateChatMessagePayload = z.infer<typeof CreateChatMessageSchema>;
export type CreateChatRoomPayload = z.infer<typeof CreateChatRoomSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;
export type UpdateUserLastActiveAtPayload = z.infer<
  typeof UpdateUserLastActiveAtSchema
>;
export type UpdateUserStatusPayload = z.infer<typeof UpdateUserStatusSchema>;
export type User = z.infer<typeof UserSchema>;
