import type { SocketChatMessage } from '@packages/lib';
import type { Server } from 'socket.io';

import { CHAT_EVENT } from '@packages/lib';

import chatMessageService from '@/services/chat-message.service';

export type ChatHandlers = ReturnType<typeof createChatHandlers>;

export type ChatTimer = {
  count: number;
  isBlocked: boolean;
  startTime: number;
};

export function createChatHandlers(io: Server) {
  const timerMap = new Map<string, ChatTimer>();

  function checkMessageRate(userId: string, roomId: string) {
    const timer = timerMap.get(userId);

    if (!timer) {
      timerMap.set(userId, { count: 1, isBlocked: false, startTime: Date.now() });
      return true;
    }

    if (timer.isBlocked) {
      return false;
    }

    const timeDiff = Date.now() - timer.startTime;

    if (timeDiff >= 2000) {
      timer.count = 1;
      timer.startTime = Date.now();
      return true;
    }

    if (timeDiff < 2000 && timer.count >= 5) {
      timer.isBlocked = true;
      io.to(roomId).emit(CHAT_EVENT.BLOCK, { error: 'Too many messages', userId });

      setTimeout(() => {
        timerMap.delete(userId);
        io.to(roomId).emit(CHAT_EVENT.UNBLOCK, { userId });
      }, 10000);

      return false;
    }

    timer.count++;

    return true;
  }

  async function handleChatSend(data: SocketChatMessage) {
    if (!checkMessageRate(data.userId, data.roomId)) {
      console.log('isBlocked', data.userId);
      return;
    }

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
