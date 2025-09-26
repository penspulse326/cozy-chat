import type { SocketChatMessage } from '@packages/lib';
import type { Server } from 'socket.io';

import { CHAT_EVENT } from '@packages/lib';

import chatMessageService from '@/services/chat-message.service';

export type ChatHandlers = ReturnType<typeof createChatHandlers>;

export function createChatHandlers(io: Server) {
  async function handleChatSend(data: SocketChatMessage) {
    const newChatMessage = await chatMessageService.sendChatMessage(data);

    io.to(data.roomId).emit(CHAT_EVENT.SEND, newChatMessage);
  }

  async function handleChatLoad(roomId: string) {
    const chatMessages =
      await chatMessageService.findChatMessagesByRoomId(roomId);

    io.to(roomId).emit(CHAT_EVENT.LOAD, chatMessages);
  }

  async function handleChatRead(messageId: string) {
    const updatedMessage = await chatMessageService.markAsRead(messageId);

    io.to(updatedMessage.roomId).emit(CHAT_EVENT.READ, updatedMessage);
  }

  return {
    handleChatLoad,
    handleChatRead,
    handleChatSend,
  };
}
