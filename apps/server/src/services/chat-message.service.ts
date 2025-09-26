import type { ChatMessageDto, Device, SocketChatMessage } from '@packages/lib';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';

async function createChatMessage(
  data: SocketChatMessage,
  device: Device
): Promise<ChatMessageDto> {
  const currentTime = new Date();
  const dto = {
    content: data.content,
    createdAt: currentTime,
    device,
    isRead: false,
    roomId: data.roomId,
    userId: data.userId,
  };

  const result = await chatMessageModel.createChatMessage(dto);

  if (result === null) {
    throw new Error('建立聊天訊息失敗');
  }
  return result;
}

async function findChatMessageById(id: string): Promise<ChatMessageDto> {
  const result = await chatMessageModel.findChatMessageById(id);
  if (result === null) {
    throw new Error(`找不到聊天訊息: ${id}`);
  }
  return result;
}

async function findChatMessagesByRoomId(
  roomId: string
): Promise<ChatMessageDto[]> {
  const result = await chatMessageModel.findChatMessagesByRoomIds(roomId);
  if (result === null) {
    throw new Error(`找不到聊天室訊息: ${roomId}`);
  }
  return result;
}

async function markAsRead(messageId: string): Promise<ChatMessageDto> {
  const updatedMessage = await chatMessageModel.updateChatMessage(messageId, {
    isRead: true,
  });

  if (!updatedMessage) {
    throw new Error('更新聊天訊息失敗');
  }

  return updatedMessage;
}

async function removeManyByRoomIds(roomIds: string[]): Promise<void> {
  const result = await chatMessageModel.removeManyByRoomIds(roomIds);
  if (!result) {
    throw new Error(`刪除聊天室訊息失敗: ${roomIds.join(', ')}`);
  }
}

async function sendChatMessage(
  data: SocketChatMessage
): Promise<ChatMessageDto> {
  const user = await userModel.findUserById(data.userId);

  if (!user) {
    throw new Error(`找不到使用者: ${data.userId}`);
  }

  const result = await createChatMessage(data, user.device);

  return result;
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  markAsRead,
  removeManyByRoomIds,
  sendChatMessage,
};
