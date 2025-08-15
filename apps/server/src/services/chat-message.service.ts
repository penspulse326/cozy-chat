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

  return result;
}

async function findChatMessageById(id: string) {
  const result = await chatMessageModel.findChatMessageById(id);

  return result;
}

async function findChatMessagesByRoomId(roomId: string) {
  const result = await chatMessageModel.findChatMessagesByRoomId(roomId);

  return result;
}

async function sendChatMessage(data: SocketChatMessage) {
  const user = await userModel.findUserById(data.userId);

  if (!user) {
    return null;
  }

  const result = await createChatMessage(data, user.device);

  if (!result) {
    return null;
  }

  const newChatMessage = await findChatMessageById(
    result.insertedId.toString()
  );

  if (!newChatMessage) {
    return null;
  }

  return newChatMessage;
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  sendChatMessage,
};
