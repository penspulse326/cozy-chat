import type { Server } from 'socket.io';

import { MATCH_EVENT, UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import userService from '@/services/user.service';

import type { SocketState } from '../state';

export type MatchHandlers = ReturnType<typeof createMatchHandlers>;

export function createMatchHandlers(io: Server, state: SocketState) {
  const handleMatchStart = async (newUser: WaitingUser) => {
    const peerUser = state.getNextWaitingUser();

    if (!peerUser) {
      state.addWaitingUser(newUser);
      console.log(`加入等待池: ${newUser.socketId}`);

      // 設定超時
      setTimeout(() => {
        const hasRemoved = state.removeWaitingUser(newUser.socketId);

        if (hasRemoved) {
          io.of('/').sockets.get(newUser.socketId)?.emit(MATCH_EVENT.FAIL);
        }
      }, 10000);

      return;
    }

    await handleMatchSuccess(newUser, peerUser);
  };

  const handleMatchSuccess = async (
    newUser: WaitingUser,
    peerUser: WaitingUser
  ) => {
    const matchResult = await userService.createMatchedUsers(newUser, peerUser);

    const { matchedUsers, roomId } = matchResult;

    await Promise.all(
      matchedUsers.map((user) => handleNotifyMatchSuccess(user, roomId))
    );
  };

  const handleNotifyMatchSuccess = async (
    user: WaitingUser & { userId: string },
    roomId: string
  ) => {
    await io.of('/').sockets.get(user.socketId)?.join(roomId);

    io.to(user.socketId).emit(MATCH_EVENT.SUCCESS, {
      roomId: roomId,
      userId: user.userId,
    });
  };

  const handleMatchCancel = (socketId: string) => {
    const hasRemoved = state.removeWaitingUser(socketId);

    if (hasRemoved) {
      console.log('waitingUsers', state.getWaitingUsers());
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  };

  const handleMatchLeave = async (userId: string) => {
    const result = await userService.updateUserStatus(
      userId,
      UserStatusSchema.enum.LEFT
    );

    notifyMatchLeave(result.roomId);
  };

  const notifyMatchLeave = (roomId: string) => {
    io.to(roomId).emit(MATCH_EVENT.LEAVE);
  };

  return {
    handleMatchCancel,
    handleMatchLeave,
    handleMatchStart,
    notifyMatchLeave,
  };
}
