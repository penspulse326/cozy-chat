import type { ChatRoom, CreateChatRoomPayload } from '@packages/lib';
import type { InsertOneResult, OptionalId } from 'mongodb';

import { CreateChatRoomSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

type ChatRoomData = Omit<ChatRoom, '_id'> & { _id: ObjectId };

async function createChatRoom(
  data: CreateChatRoomPayload
): Promise<InsertOneResult<ChatRoomData> | null> {
  const chatRooms = db.collection<OptionalId<ChatRoomData>>('chat_rooms');

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

async function findChatRoomById(id: string): Promise<ChatRoomData | null> {
  const chatRooms = db.collection<ChatRoomData>('chat_rooms');

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
