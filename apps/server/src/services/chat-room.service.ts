import type { InsertOneResult, OptionalId } from 'mongodb';

import type { ChatRoomData } from '@/models/chat-room.model';

import chatRoomModel from '@/models/chat-room.model';

async function createChatRoom(
  userIds: string[]
): Promise<InsertOneResult<OptionalId<ChatRoomData>>> {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    users: userIds,
  };

  const result = await chatRoomModel.createChatRoom(payload);
  if (result === null) {
    throw new Error('建立聊天室失敗');
  }
  return result;
}

async function findChatRoomById(id: string): Promise<ChatRoomData> {
  const result = await chatRoomModel.findChatRoomById(id);
  if (result === null) {
    throw new Error(`找不到聊天室: ${id}`);
  }
  return result;
}

export default {
  createChatRoom,
  findChatRoomById,
};
