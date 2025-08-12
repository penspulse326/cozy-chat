import type { SocketChatMessage } from '@packages/lib';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';

async function createChatMessage(data: SocketChatMessage) {
  const currentTime = new Date();
  const payload = {
    content: data.content,
    created_at: currentTime,
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
  const result = await createChatMessage(data);

  if (!result) {
    return null;
  }

  const newChatMessage = await findChatMessageById(
    result.insertedId.toString()
  );

  if (!newChatMessage) {
    return null;
  }

  const user = await userModel.findUserById(data.userId);

  if (!user) {
    return null;
  }

  const device = user.device;

  return { ...newChatMessage, device };
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  sendChatMessage,
};
