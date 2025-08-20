import type { SocketChatMessage } from '@packages/lib';
import type { Server } from 'socket.io';

import { CHAT_EVENT } from '@packages/lib';

import chatMessageService from '@/services/chat-message.service';

export type ChatHandlers = ReturnType<typeof createChatHandlers>;

export function createChatHandlers(io: Server) {
  const handleChatSend = async (data: SocketChatMessage) => {
    const newChatMessage = await chatMessageService.sendChatMessage(data);

    io.to(data.roomId).emit(CHAT_EVENT.SEND, newChatMessage);
  };

  const handleChatLoad = async (roomId: string) => {
    const chatMessages =
      await chatMessageService.findChatMessagesByRoomId(roomId);

    io.to(roomId).emit(CHAT_EVENT.LOAD, chatMessages);
  };

  return {
    handleChatLoad,
    handleChatSend,
  };
}
