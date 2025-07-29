import type { DeviceMap } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';

import type { SocketChatMessage, WaitingUser } from '@/types';

import chatMessageService from '@/services/chat-message.service';
import chatRoomService from '@/services/chat-room.service';

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(MATCH_EVENT.START, (device: keyof typeof DeviceMap) => {
      void handleMatchStart({ device, socketId: socket.id });
    });

    socket.on(CHAT_EVENT.SEND, (data: SocketChatMessage) => {
      void handleChatSend(data);
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
        io.of('/').sockets.get(newUser.socketId)?.emit(MATCH_EVENT.FAIL);
      }
    }, 10000);
  }

  async function handleMatchSuccess(users: WaitingUser[]) {
    const newChatRoom = await chatRoomService.createChatRoom(users);
    const roomId = newChatRoom?.insertedId;

    if (!roomId) {
      return;
    }

    await Promise.all(
      users.map((user) => io.of('/').sockets.get(user.socketId)?.join(roomId))
    );

    io.to(roomId).emit(MATCH_EVENT.SUCCESS, {
      roomId,
      userIds: [users[0].socketId, users[1].socketId],
    });
  }

  async function handleChatSend(data: SocketChatMessage) {
    const result = await chatMessageService.createChatMessage(data);

    if (!result) {
      return;
    }

    const chatMessage = await chatMessageService.findChatMessageById(
      result.insertedId.toString()
    );

    if (!chatMessage) {
      return;
    }

    io.to(data.roomId).emit(CHAT_EVENT.RECEIVE, chatMessage);
  }
}
