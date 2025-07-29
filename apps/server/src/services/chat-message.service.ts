import type { SocketChatMessage } from '@/types';

import chatMessageModel from '@/models/chat-message.model';

async function createChatMessage(data: SocketChatMessage) {
  const currentTime = new Date();
  const payload = {
    content: data.message,
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

export default {
  createChatMessage,
  findChatMessageById,
};
