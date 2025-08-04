import type { CreateChatRoomPayload } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { CreateChatRoomSchema } from '@packages/lib';

import { db } from '@/config/db';

async function createChatRoom(
  data: CreateChatRoomPayload
): Promise<InsertOneResult<CreateChatRoomPayload> | null> {
  const chatRooms = db.collection<CreateChatRoomPayload>('chat_rooms');

  try {
    const validatedChatRoom = CreateChatRoomSchema.parse(data);
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
