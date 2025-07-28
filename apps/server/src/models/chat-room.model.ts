import type { ChatRoom, CreateChatRoomPayload } from '@packages/lib';
import type { Collection, Db, InsertOneResult } from 'mongodb';
import type z from 'zod';

import { CreateChatRoomSchema } from '@packages/lib/dist';

import { catchDbError } from '@/utils/catch-db-error';

class ChatRoomModel {
  private chatRooms: Collection<ChatRoom>;

  constructor(private readonly db: Db) {
    this.chatRooms = this.db.collection<ChatRoom>('chat_rooms');
  }

  async createChatRoom(
    chatRoomPayload: CreateChatRoomPayload
  ): Promise<InsertOneResult<ChatRoom> | null> {
    try {
      const validatedChatRoom: z.infer<typeof CreateChatRoomSchema> =
        CreateChatRoomSchema.parse(chatRoomPayload);

      const newChatRoom: ChatRoom = {
        _id: new Date().getTime().toString(),
        ...validatedChatRoom,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const result = await this.chatRooms.insertOne(newChatRoom);
      console.log('新增 ChatRoom 成功');

      return result;
    } catch (error) {
      catchDbError(error);
      return null;
    }
  }
}

export default ChatRoomModel;
