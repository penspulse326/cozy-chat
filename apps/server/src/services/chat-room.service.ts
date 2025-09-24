import type { ChatRoomDto } from '@packages/lib';

import chatRoomModel from '@/models/chat-room.model';

async function createChatRoom(userIds: string[]): Promise<ChatRoomDto> {
  const currentTime = new Date();
  const dto = {
    createdAt: currentTime,
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

async function removeUserFromChatRoom(
  roomId: string,
  userId: string
): Promise<ChatRoomDto> {
  const result = await chatRoomModel.removeUserFromChatRoom(roomId, userId);
  if (result === null) {
    throw new Error(`從聊天室移除使用者失敗: ${userId}`);
  }
  return result;
}

export default {
  createChatRoom,
  findChatRoomById,
  removeUserFromChatRoom,
};
