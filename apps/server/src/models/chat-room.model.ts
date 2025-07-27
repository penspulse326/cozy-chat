import type { ChatRoom, CreateChatRoomPayload } from '@packages/lib';
import type { Collection, Db, InsertOneResult } from 'mongodb';

import { CreateChatRoomSchema } from '@packages/lib/dist';
import z from 'zod';

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
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        console.error('資料驗證失敗:', error.issues);
      } else {
        console.error('資料庫錯誤:', error);
      }
      return null;
    }
  }
}

export default ChatRoomModel;
