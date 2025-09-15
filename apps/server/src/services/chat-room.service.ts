import type { ChatRoomDto } from '@packages/lib';

import chatRoomModel from '@/models/chat-room.model';

async function createChatRoom(
  userIds: string[]
): Promise<ChatRoomDto> {
  const currentTime = new Date();
  const dto = {
    created_at: currentTime,
    users: userIds,
  };

  const result = await chatRoomModel.createChatRoom(dto);
  if (result === null) {
    throw new Error('建立聊天室失敗');
  }
  return result;
}

async function findChatRoomById(id: string): Promise<ChatRoomDto> {
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
