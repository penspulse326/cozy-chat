import type { SocketChatMessage } from '@/types';

import ChatMessageModel from '@/models/chat-message.model';

async function createChatMessage(data: SocketChatMessage) {
  const currentTime = new Date();
  const payload = {
    content: data.content,
    created_at: currentTime,
    room_id: data.room_id,
    user_id: data.user_id,
  };

  const result = await ChatMessageModel.createChatMessage(payload);

  return result;
}

async function findChatMessageById(id: string) {
  const result = await ChatMessageModel.findChatMessageById(id);

  return result;
}

export default {
  createChatMessage,
  findChatMessageById,
};
