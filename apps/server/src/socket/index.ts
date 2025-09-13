import type { Device, SocketChatMessage } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';

import { createChatHandlers } from './handlers/chat';
import { createMatchHandlers } from './handlers/match';
import { createUserHandlers } from './handlers/user';
import { createWaitingPool } from './waiting-pool';

export function setupSocketServer(io: Server) {
  const waitingPool = createWaitingPool();
  const chatHandlers = createChatHandlers(io);
  const matchHandlers = createMatchHandlers(io, waitingPool);
  const userHandlers = createUserHandlers(io, chatHandlers);

  io.on('connection', (client: Socket) => {
    const roomId = client.handshake.query.roomId;

    if (typeof roomId === 'string' && roomId !== '') {
      void userHandlers.handleCheckUser(client.id, roomId);
    }

    client.on(MATCH_EVENT.START, (device: Device) => {
      void matchHandlers.handleMatchStart({ device, socketId: client.id });
    });

    client.on(MATCH_EVENT.CANCEL, () => {
      matchHandlers.handleMatchCancel(client.id);
    });

    client.on(MATCH_EVENT.LEAVE, (userId: string) => {
      void matchHandlers.handleMatchLeave(userId);
    });

    client.on(CHAT_EVENT.SEND, (data: SocketChatMessage) => {
      void chatHandlers.handleChatSend(data);
    });

    client.on('disconnect', () => {
      waitingPool.removeFromPool(client.id);
      console.log('使用者斷開連線:', client.id);
    });
  });
}
