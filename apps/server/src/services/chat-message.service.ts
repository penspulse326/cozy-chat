import type { ChatMessageDto, Device, SocketChatMessage } from '@packages/lib';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';

async function createChatMessage(
  data: SocketChatMessage,
  device: Device
): Promise<ChatMessageDto> {
  const currentTime = new Date();
  const payload = {
    content: data.content,
    created_at: currentTime,
    device,
    room_id: String(data.roomId),
    user_id: String(data.userId),
  };

  const result = await chatMessageModel.createChatMessage(payload);
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
  const result = await chatMessageModel.findChatMessagesByRoomId(roomId);
  if (result === null) {
    throw new Error(`找不到聊天室訊息: ${roomId}`);
  }
  return result;
}

async function sendChatMessage(data: SocketChatMessage): Promise<ChatMessageDto> {
  const user = await userModel.findUserById(String(data.userId));
  if (!user) {
    throw new Error(`找不到使用者: ${String(data.userId)}`);
  }

  const result = await createChatMessage(data, user.device);
  // createChatMessage 已經處理了錯誤情況

  return result;
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  sendChatMessage,
};
