import type { ChatRoom } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { ChatRoomSchema } from '@packages/lib';

import { db } from '@/config/db';

export async function createChatRoom(
  data: ChatRoom
): Promise<InsertOneResult<ChatRoom> | null> {
  const chatRooms = db.collection<ChatRoom>('chat_rooms');

  try {
    const validatedChatRoom = ChatRoomSchema.parse(data);

    const result = await chatRooms.insertOne(validatedChatRoom);
    console.log('新增 ChatRoom 成功');

    return result;
  } catch (error) {
    console.error('新增 ChatRoom 失敗', error);
    return null;
  }
}
