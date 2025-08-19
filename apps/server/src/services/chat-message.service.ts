import type { Device, SocketChatMessage } from '@packages/lib';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';

async function createChatMessage(data: SocketChatMessage, device: Device) {
  const currentTime = new Date();
  const payload = {
    content: data.content,
    created_at: currentTime,
    device,
    room_id: data.roomId,
    user_id: data.userId,
  };

  const result = await chatMessageModel.createChatMessage(payload);
  if (result === null) {
    throw new Error('建立聊天訊息失敗');
  }
  return result;
}

async function findChatMessageById(id: string) {
  const result = await chatMessageModel.findChatMessageById(id);
  if (result === null) {
    throw new Error(`找不到聊天訊息: ${id}`);
  }
  return result;
}

async function findChatMessagesByRoomId(roomId: string) {
  const result = await chatMessageModel.findChatMessagesByRoomId(roomId);
  if (result === null) {
    throw new Error(`找不到聊天室訊息: ${roomId}`);
  }
  return result;
}

async function sendChatMessage(data: SocketChatMessage) {
  const user = await userModel.findUserById(data.userId);
  if (!user) {
    throw new Error(`找不到使用者: ${data.userId}`);
  }

  const result = await createChatMessage(data, user.device);
  // createChatMessage 已經處理了錯誤情況

  const newChatMessage = await findChatMessageById(
    result.insertedId.toString()
  );
  // findChatMessageById 已經處理了錯誤情況

  return newChatMessage;
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  sendChatMessage,
};
