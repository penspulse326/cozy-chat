import type { DeviceMap } from '@packages/lib';
import type { Server, Socket } from 'socket.io';

import { CHAT_EVENT, MATCH_EVENT, UserStatusSchema } from '@packages/lib';

import type { SocketChatMessage, WaitingUser } from '@/types';

import ChatMessageService from '@/services/chat-message.service';
import ChatRoomService from '@/services/chat-room.service';
import UserService from '@/services/user.service';

export function createSocketServer(io: Server) {
  const waitingUsers: WaitingUser[] = [];

  io.on('connection', (socket: Socket) => {
    console.log('新的用戶連線:', socket.id);

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
    const createdNewUser = await UserService.createUser(newUser);
    const createdPeerUser = await UserService.createUser(peerUser);

    if (!createdNewUser || !createdPeerUser) {
      return;
    }

    console.log('createdNewUser', createdNewUser);
    console.log('createdPeerUser', createdPeerUser);

    const newChatRoom = await ChatRoomService.createChatRoom([
      createdNewUser.insertedId.toString(),
      createdPeerUser.insertedId.toString(),
    ]);

    const roomId = newChatRoom?.insertedId.toString();

    if (!roomId) {
      return;
    }

    console.log('newChatRoom', newChatRoom);

    const createdUsers = [
      {
        ...newUser,
        userId: createdNewUser.insertedId.toString(),
      },
      {
        ...peerUser,
        userId: createdPeerUser.insertedId.toString(),
      },
    ];

    await Promise.all(
      createdUsers.map((user) =>
        UserService.updateUserRoomId(user.userId, roomId)
      )
    );

    await Promise.all(
      createdUsers.map((user) => handleNotifyMatchSuccess(user, roomId))
    );
  }

  function handleMatchCancel(socketId: string) {
    const hasRemoved = removeWaitingUser(socketId);

    if (hasRemoved) {
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  }

  async function handleMatchLeave(userId: string) {
    const user = await UserService.findUserById(userId);

    if (!user) {
      return;
    }

    await UserService.updateUserStatus(
      user._id.toString(),
      UserStatusSchema.enum.LEFT
    );

    handleNotifyMatchLeave(user.room_id);
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
    const result = await ChatMessageService.createChatMessage(data);

    if (!result) {
      return;
    }

    const chatMessage = await ChatMessageService.findChatMessageById(
      result.insertedId.toString()
    );

    if (!chatMessage) {
      return;
    }

    io.to(data.room_id).emit(CHAT_EVENT.RECEIVE, chatMessage);
  }
}
