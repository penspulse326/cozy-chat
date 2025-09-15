import type { Server } from 'socket.io';

import { MATCH_EVENT } from '@packages/lib';

import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';

import type { ChatHandlers } from './chat';

export type UserHandlers = ReturnType<typeof createUserHandlers>;

export function createUserHandlers(io: Server, chatHandlers: ChatHandlers) {
  async function handleCheckUser(socketId: string, roomId: string) {
    try {
      await chatRoomService.findChatRoomById(roomId);
    } catch (error) {
      console.error('handleCheckUser error', error);
      io.to(socketId).emit(MATCH_EVENT.RECONNECT_FAIL);
      return;
    }

    await io.of('/').sockets.get(socketId)?.join(roomId);
    await chatHandlers.handleChatLoad(roomId);

    const isLeft = await userService.checkUserStatus(roomId);

    if (isLeft) {
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.LEAVE);
    }
  }

  return {
    handleCheckUser,
  };
}
