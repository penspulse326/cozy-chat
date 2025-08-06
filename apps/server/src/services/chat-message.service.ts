import type { SocketChatMessage } from '@packages/lib';

import ChatMessageModel from '@/models/chat-message.model';
import ChatRoomService from '@/services/chat-room.service';

async function createChatMessage(data: SocketChatMessage) {
  const currentTime = new Date();
  const payload = {
    content: data.content,
    created_at: currentTime,
    room_id: data.roomId,
    user_id: data.userId,
  };

  const result = await ChatMessageModel.createChatMessage(payload);

  return result;
}

async function findChatMessageById(id: string) {
  const result = await ChatMessageModel.findChatMessageById(id);

  return result;
}

async function findChatMessagesByRoomId(roomId: string) {
  const result = await ChatMessageModel.findChatMessagesByRoomId(roomId);

  return result;
}

async function sendChatMessage(data: SocketChatMessage) {
  const targetChatRoom = await ChatRoomService.findChatRoomById(data.roomId);

  if (!targetChatRoom) {
    return null;
  }

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

  return newChatMessage;
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
  sendChatMessage,
};
