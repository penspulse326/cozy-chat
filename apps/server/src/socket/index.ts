import type { ChatMessage, DeviceMap } from '@packages/lib/dist';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT } from '@packages/lib/dist';

import { createChatRoom } from '@/models/chat-room.model';
import { createUser } from '@/models/user.model';

type WaitingUser = {
  socketId: string;
  device: keyof typeof DeviceMap;
};

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(CHAT_EVENT.MATCH_START, (device: keyof typeof DeviceMap) => {
      void handleMatchStart({ socketId: socket.id, device });
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

    await handleMatchSuccess(newUser, peerUser);
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

  async function handleMatchSuccess(
    newUser: WaitingUser,
    peerUser: WaitingUser
  ) {
    const roomId = `room-${newUser.socketId}-${peerUser.socketId}`;
    const currentTime = new Date();

    const userAData = await createUser({
      _id: newUser.socketId,
      room_id: roomId,
      device: newUser.device,
      status: 'ACTIVE',
      last_active_at: currentTime,
      created_at: currentTime,
    });

    const userBData = await createUser({
      _id: peerUser.socketId,
      room_id: roomId,
      device: peerUser.device,
      status: 'ACTIVE',
      last_active_at: currentTime,
      created_at: currentTime,
    });

    console.log('userAData', userAData);
    console.log('userBData', userBData);

    await createChatRoom({
      _id: roomId,
      users: [newUser.socketId, peerUser.socketId],
      created_at: currentTime,
    });

    await io.of('/').sockets.get(newUser.socketId)?.join(roomId);
    await io.of('/').sockets.get(peerUser.socketId)?.join(roomId);

    io.to(roomId).emit(CHAT_EVENT.MATCH_SUCCESS, {
      roomId,
      userIds: [newUser.socketId, peerUser.socketId],
    });
  }

  function handleChatSend(message: string, roomId: string) {
    io.to(roomId).emit(CHAT_EVENT.CHAT_RECEIVE, message);
  }
}
