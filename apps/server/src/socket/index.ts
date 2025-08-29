import type { DeviceMap, SocketChatMessage } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';

import { createChatHandlers } from './handlers/chat';
import { createMatchHandlers } from './handlers/match';
import { createUserHandlers } from './handlers/user';
import { createWaitingPool } from './waiting-pool';

export function createSocketServer(io: Server) {
  const waitingPool = createWaitingPool();
  const chatHandlers = createChatHandlers(io);
  const matchHandlers = createMatchHandlers(io, waitingPool);
  const userHandlers = createUserHandlers(io, chatHandlers);

  io.on('connection', (socket: Socket) => {
    const roomId = socket.handshake.query.roomId;

    if (typeof roomId === 'string' && roomId !== '') {
      void userHandlers.handleCheckUser(socket.id, roomId);
    }

    socket.on(MATCH_EVENT.START, (device: keyof typeof DeviceMap) => {
      void matchHandlers.handleMatchStart({ device, socketId: socket.id });
    });

    socket.on(MATCH_EVENT.CANCEL, () => {
      matchHandlers.handleMatchCancel(socket.id);
    });

    socket.on(MATCH_EVENT.LEAVE, (userId: string) => {
      void matchHandlers.handleMatchLeave(userId);
    });

    socket.on(CHAT_EVENT.SEND, (data: SocketChatMessage) => {
      void chatHandlers.handleChatSend(data);
    });

    socket.on('disconnect', () => {
      waitingPool.removeWaitingUser(socket.id);
      console.log('使用者斷開連線:', socket.id);
    });
  });
}
