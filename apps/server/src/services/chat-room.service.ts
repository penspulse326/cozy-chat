import type { ChatRoomDto } from '@packages/lib';

import chatRoomModel from '@/models/chat-room.model';
import chatMessageService from '@/services/chat-message.service';

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

async function removeEmptyChatRooms(): Promise<void> {
  const chatRooms = await chatRoomModel.findAllChatRooms();

  if (chatRooms === null) {
    throw new Error('查詢聊天室失敗');
  }

  const emptyChatRoomIds = chatRooms
    .filter((room) => room.users.length < 2)
    .map((room) => room.id);

  if (emptyChatRoomIds.length === 0) {
    return;
  }

  // 先移除聊天室中的所有訊息
  await chatMessageService.removeManyByRoomIds(emptyChatRoomIds);

  // 再移除聊天室
  const result = await chatRoomModel.removeMany(emptyChatRoomIds);

  if (!result) {
    throw new Error(`刪除聊天室失敗: ${emptyChatRoomIds.join(', ')}`);
  }
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
  removeEmptyChatRooms,
  removeUserFromChatRoom,
};
