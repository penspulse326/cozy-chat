import type { z } from 'zod';

import type {
  ChatMessageSchema,
  ChatRoomSchema,
  CreateChatMessageSchema,
  CreateChatRoomSchema,
  CreateUserSchema,
  DeviceSchema,
  UpdateUserLastActiveAtSchema,
  UpdateUserStatusSchema,
  UserSchema,
  UserStatusSchema,
} from '../schemas';

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRoom = z.infer<typeof ChatRoomSchema>;
export type CreateChatMessagePayload = z.infer<typeof CreateChatMessageSchema>;
export type CreateChatRoomPayload = z.infer<typeof CreateChatRoomSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type UpdateUserLastActiveAtPayload = z.infer<
  typeof UpdateUserLastActiveAtSchema
>;
export type UpdateUserStatusPayload = z.infer<typeof UpdateUserStatusSchema>;
export type User = z.infer<typeof UserSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type * from './data';
