import type { ChatRoom, CreateChatRoom } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { createChatRoomDtoSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

export type ChatRoomEntity = Omit<ChatRoom, 'id'> & { _id: ObjectId };

async function createChatRoom(
  data: CreateChatRoom
): Promise<InsertOneResult<ChatRoomEntity> | null> {
  const chatRooms = getChatRoomCollection();

  try {
    const candidate = createChatRoomDtoSchema.parse(data);

    const result = await chatRooms.insertOne({
      ...candidate,
      _id: new ObjectId(),
    });
    console.log('新增 ChatRoom 成功');

    return result;
  } catch (error) {
    console.error('新增 ChatRoom 失敗', error);

    return null;
  }
}

async function findChatRoomById(id: string): Promise<ChatRoomEntity | null> {
  const chatRooms = getChatRoomCollection();

  try {
    const result = await chatRooms.findOne({ _id: new ObjectId(id) });
    console.log('查詢 ChatRoom 成功');

    return result;
  } catch (error) {
    console.error('查詢 ChatRoom 失敗', error);

    return null;
  }
}

function getChatRoomCollection() {
  return db.collection<ChatRoomEntity>('chat_rooms');
}


const chatRoomModel = {
  createChatRoom,
  findChatRoomById,
};

export default chatRoomModel;
