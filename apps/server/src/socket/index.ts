import type { DeviceMap, SocketChatMessage } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT, UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import chatMessageService from '@/services/chat-message.service';
import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    const roomId = socket.handshake.query.roomId;

    if (typeof roomId === 'string') {
      void handleCheckUser(socket.id, roomId);
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
      removeWaitingUser(socket.id);
      console.log('使用者斷開連線:', socket.id);
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
    const matchResult = await userService.createMatchedUsers(newUser, peerUser);

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
      console.log('waitingUsers', waitingUsers);
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  }

  async function handleMatchLeave(userId: string) {
    const result = await userService.updateUserStatus(
      userId,
      UserStatusSchema.enum.LEFT
    );

    if (!result) {
      return;
    }

    notifyMatchLeave(result.roomId);
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

  function notifyMatchLeave(roomId: string) {
    io.to(roomId).emit(MATCH_EVENT.LEAVE);
  }

  async function handleChatSend(data: SocketChatMessage) {
    const newChatMessage = await chatMessageService.sendChatMessage(data);

    if (!newChatMessage) {
      return;
    }

    io.to(data.roomId).emit(CHAT_EVENT.RECEIVE, newChatMessage);
  }

  async function handleCheckUser(socketId: string, roomId: string) {
    const targetRoom = await chatRoomService.findChatRoomById(roomId);

    if (!targetRoom) {
      io.to(socketId).emit(MATCH_EVENT.RECONNECT_FAIL);
      return;
    }

    await io.of('/').sockets.get(socketId)?.join(roomId);

    await handleChatLoad(roomId);

    const isLeft = await userService.checkUserStatus(roomId);

    if (isLeft) {
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.LEAVE);
    }
  }

  async function handleChatLoad(roomId: string) {
    const chatMessages =
      await chatMessageService.findChatMessagesByRoomId(roomId);

    if (!chatMessages) {
      return;
    }

    io.to(roomId).emit(CHAT_EVENT.LOAD, chatMessages);
  }
}
