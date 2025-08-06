import type { DeviceMap, SocketChatMessage } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT, UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import ChatMessageService from '@/services/chat-message.service';
import UserService from '@/services/user.service';

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    const userId = socket.handshake.query.userId;
    const roomId = socket.handshake.query.roomId;

    if (typeof roomId === 'string') {
      void handleChatLoad(roomId);
    }

    socket.on(MATCH_EVENT.START, (device: keyof typeof DeviceMap) => {
      void handleMatchStart({ device, socketId: socket.id });
    });

    socket.on(MATCH_EVENT.CANCEL, () => {
      handleMatchCancel(socket.id);
    });

    socket.on(MATCH_EVENT.LEAVE, (userId: string) => {
      void handleMatchLeave(userId);
    });

    socket.on(CHAT_EVENT.SEND, (data: SocketChatMessage) => {
      void handleChatSend(data);
    });

    socket.on('disconnect', () => {
      console.log('用戶斷開連線:', socket.id);
      removeWaitingUser(socket.id);
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
      const hasRemoved = removeWaitingUser(newUser.socketId);

      if (hasRemoved) {
        io.of('/').sockets.get(newUser.socketId)?.emit(MATCH_EVENT.FAIL);
      }
    }, 10000);
  }

  function removeWaitingUser(socketId: string): boolean {
    const index = waitingUsers.findIndex((user) => user.socketId === socketId);

    if (index === -1) {
      return false;
    }

    waitingUsers.splice(index, 1);

    return true;
  }

  async function handleMatchSuccess(
    newUser: WaitingUser,
    peerUser: WaitingUser
  ) {
    const matchResult = await UserService.createMatchedUsers(newUser, peerUser);

    if (!matchResult) {
      return;
    }

    const { matchedUsers, roomId } = matchResult;

    await Promise.all(
      matchedUsers.map((user) => handleNotifyMatchSuccess(user, roomId))
    );
  }

  function handleMatchCancel(socketId: string) {
    const hasRemoved = removeWaitingUser(socketId);

    if (hasRemoved) {
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  }

  async function handleMatchLeave(userId: string) {
    const result = await UserService.updateUserStatus(
      userId,
      UserStatusSchema.enum.LEFT
    );

    if (!result) {
      return;
    }

    handleNotifyMatchLeave(result.roomId);
  }

  async function handleNotifyMatchSuccess(
    user: WaitingUser & { userId: string },
    roomId: string
  ) {
    await io.of('/').sockets.get(user.socketId)?.join(roomId);

    io.to(user.socketId).emit(MATCH_EVENT.SUCCESS, {
      roomId: roomId,
      userId: user.userId,
    });
  }

  function handleNotifyMatchLeave(roomId: string) {
    io.to(roomId).emit(MATCH_EVENT.LEAVE);
  }

  async function handleChatSend(data: SocketChatMessage) {
    const newChatMessage = await ChatMessageService.sendChatMessage(data);

    if (!newChatMessage) {
      return;
    }

    io.to(data.roomId).emit(CHAT_EVENT.RECEIVE, newChatMessage);
  }

  async function handleCheckUser(roomId: string) {
    if (!roomId) {
      return;
    }

    const newChatMessage =
      await ChatMessageService.findChatMessagesByRoomId(roomId);

    if (!newChatMessage) {
      return;
    }

    io.to(roomId).emit(CHAT_EVENT.LOAD, newChatMessage);
  }
}
