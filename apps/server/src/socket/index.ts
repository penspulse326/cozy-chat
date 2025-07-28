import type { ChatMessage, DeviceMap } from '@packages/lib/dist';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT } from '@packages/lib/dist';

import type { WaitingUser } from '@/types';

import chatRoomService from '@/services/chat-room.service';

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(CHAT_EVENT.MATCH_START, (device: keyof typeof DeviceMap) => {
      void handleMatchStart({ device, socketId: socket.id });
    });

    socket.on(CHAT_EVENT.CHAT_SEND, ({ message, roomId }: ChatMessage) => {
      handleChatSend(message, roomId);
    });

    socket.on('disconnect', () => {
      console.log('用戶斷開連線:', newUserId);
    });
  });

  async function handleMatchStart(newUser: WaitingUser) {
    if (waitingUsers.length === 0) {
      addWaitingUser(newUser);
      return;
    }

    const peerUser = waitingUsers.shift();

    if (!peerUser) {
      addWaitingUser(newUser);
      return;
    }

    await handleMatchSuccess([newUser, peerUser]);
  }

  function addWaitingUser(newUser: WaitingUser) {
    waitingUsers.push(newUser);
    console.log(`加入等待池: ${newUser.socketId}`);

    setTimeout(() => {
      const index = waitingUsers.findIndex(
        (user) => user.socketId === newUser.socketId
      );
      if (index !== -1) {
        waitingUsers.splice(index, 1);
        io.of('/').sockets.get(newUser.socketId)?.emit(CHAT_EVENT.MATCH_FAIL);
      }
    }, 3000);
  }

  async function handleMatchSuccess(users: WaitingUser[]) {
    const newChatRoom = await chatRoomService.createChatRoom(users);
    const roomId = newChatRoom?.insertedId;

    if (!roomId) {
      return;
    }

    await io.of('/').sockets.get(users[0].socketId)?.join(roomId);
    await io.of('/').sockets.get(users[1].socketId)?.join(roomId);

    io.to(roomId).emit(CHAT_EVENT.MATCH_SUCCESS, {
      roomId,
      userIds: [users[0].socketId, users[1].socketId],
    });
  }

  function handleChatSend(message: string, roomId: string) {
    io.to(roomId).emit(CHAT_EVENT.CHAT_RECEIVE, message);
  }
}
