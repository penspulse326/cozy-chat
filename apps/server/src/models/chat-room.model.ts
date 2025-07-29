import type { ChatRoomPayload } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { ChatRoomSchema } from '@packages/lib';

import { db } from '@/config/db';

async function createChatRoom(
  data: ChatRoomPayload
): Promise<InsertOneResult<ChatRoomPayload> | null> {
  const chatRooms = db.collection<ChatRoomPayload>('chat_rooms');

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

export default {
  createChatRoom,
};
