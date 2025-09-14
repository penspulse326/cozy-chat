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

export type ChatMessageDto = z.infer<typeof chatMessageDtoSchema>;
export type ChatRoomDto = z.infer<typeof chatRoomDtoSchema>;
export type CreateChatMessageDto = z.infer<typeof createChatMessageDtoSchema>;
export type CreateChatRoomDto = z.infer<typeof createChatRoomDtoSchema>;
export type CreateUserDto = z.infer<typeof createUserDtoSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type UpdateUserLastActiveAtDto = z.infer<
  typeof updateUserLastActiveAtDtoSchema
>;
export type UpdateUserStatusDto = z.infer<typeof updateUserStatusDtoSchema>;
export type UserDto = z.infer<typeof userDtoSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type * from './socket';

