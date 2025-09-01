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

export type ChatMessageDTO = z.infer<typeof ChatMessageSchema>;
export type ChatRoomDTO = z.infer<typeof ChatRoomSchema>;
export type CreateChatMessageDTO = z.infer<typeof CreateChatMessageSchema>;
export type CreateChatRoomDTO = z.infer<typeof CreateChatRoomSchema>;
export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type Device = z.infer<typeof DeviceSchema>;
export type UpdateUserLastActiveAtDTO = z.infer<
  typeof UpdateUserLastActiveAtSchema
>;
export type UpdateUserStatusDTO = z.infer<typeof UpdateUserStatusSchema>;
export type UserDTO = z.infer<typeof UserSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type * from './data';
