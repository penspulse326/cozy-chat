// socket-server.ts
import { CHAT_EVENT } from '@/types';

import type { ChatMessage } from '@/types';
import type { Server, Socket } from 'socket.io';

export function createSocketServer(io: Server) {
  const waitingUsers: string[] = [];

  io.on('connection', (socket: Socket) => {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(CHAT_EVENT.MATCH_START, () => {
      void handleMatchRequest(socket.id);
    });

    socket.on(CHAT_EVENT.CHAT_SEND, ({ message, roomId }: ChatMessage) => {
      sendMessageToRoom(message, roomId);
    });

    socket.on('disconnect', () => {
      console.log('用戶斷開連線:', newUserId);
    });
  });

  function addWaitingUser(userId: string) {
    waitingUsers.push(userId);
    console.log(`加入等待池: ${userId}`);

    setTimeout(() => {
      const index = waitingUsers.indexOf(userId);
      if (index !== -1) {
        waitingUsers.splice(index, 1);
        io.of('/').sockets.get(userId)?.emit(CHAT_EVENT.MATCH_FAIL);
      }
    }, 3000);
  }

  async function handleMatchRequest(userId: string) {
    if (waitingUsers.length === 0) {
      addWaitingUser(userId);
      return;
    }

    const peerId = waitingUsers.shift();
    if (!peerId) {
      addWaitingUser(userId);
      return;
    }

    await processMatchSuccess(userId, peerId);
  }

  async function processMatchSuccess(userA: string, userB: string) {
    const roomId = `room-${userA}-${userB}`;
    await io.of('/').sockets.get(userA)?.join(roomId);
    await io.of('/').sockets.get(userB)?.join(roomId);

    io.to(roomId).emit(CHAT_EVENT.MATCH_SUCCESS, {
      roomId,
      userIds: [userA, userB],
    });
  }

  function sendMessageToRoom(message: string, roomId: string) {
    io.to(roomId).emit(CHAT_EVENT.CHAT_RECEIVE, message);
  }
}
