import type { ChatRoom, CreateChatRoomPayload } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { CreateChatRoomSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

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

async function findChatRoomById(id: string): Promise<ChatRoom | null> {
  const chatRooms = db.collection<ChatRoom>('chat_rooms');

  try {
    const result = await chatRooms.findOne({ _id: new ObjectId(id) });
    console.log('查詢 ChatRoom 成功');

    return result;
  } catch (error) {
    console.error('查詢 ChatRoom 失敗', error);

    return null;
  }
}

export default {
  createChatRoom,
  findChatRoomById,
};
