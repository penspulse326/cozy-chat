import type { z } from 'zod';

import type {
  chatMessageDtoSchema,
  chatRoomDtoSchema,
  createChatMessageDtoSchema,
  createChatRoomDtoSchema,
  createUserDtoSchema,
  deviceSchema,
  updateUserLastActiveAtDtoSchema,
  updateUserStatusDtoSchema,
  userDtoSchema,
  userStatusSchema
} from '../schemas';

export type ChatMessage = z.infer<typeof chatMessageDtoSchema>;
export type ChatRoom = z.infer<typeof chatRoomDtoSchema>;
export type CreateChatMessage = z.infer<typeof createChatMessageDtoSchema>;
export type CreateChatRoom = z.infer<typeof createChatRoomDtoSchema>;
export type CreateUser = z.infer<typeof createUserDtoSchema>;
export type Device = z.infer<typeof deviceSchema>;;
export type UpdateUserLastActiveAt = z.infer<
  typeof updateUserLastActiveAtDtoSchema
>;
export type UpdateUserStatus = z.infer<typeof updateUserStatusDtoSchema>;
export type User = z.infer<typeof userDtoSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type * from './socket';

