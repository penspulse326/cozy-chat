import type { Server } from 'socket.io';

import { MATCH_EVENT, UserStatusSchema } from '@packages/lib';

import type { MatchedUser, WaitingUser } from '@/types';

import userService from '@/services/user.service';

import type { WaitingPool } from '../waiting-pool';

export function createMatchHandlers(io: Server, waitingPool: WaitingPool) {
  async function handleMatchStart(newUser: WaitingUser) {
    const peerUser = waitingPool.getNextFromPool();

    if (!peerUser) {
      waitingPool.addToPool(newUser);
      console.log(`加入等待池: ${newUser.socketId}`);

      // 設定超時
      setTimeout(() => {
        const hasRemoved = waitingPool.removeFromPool(newUser.socketId);

        if (hasRemoved) {
          io.of('/').sockets.get(newUser.socketId)?.emit(MATCH_EVENT.FAIL);
        }
      }, 10000);

      return;
    }

    await handleMatchSuccess(newUser, peerUser);
  }

  async function handleMatchSuccess(
    newUser: WaitingUser,
    peerUser: WaitingUser
  ) {
    const matchResult = await userService.createMatchedUsers(newUser, peerUser);

    const { matchedUsers, roomId } = matchResult;

    await Promise.all(
      matchedUsers.map((user) => notifyMatchSuccess(user, roomId))
    );
  }

  function handleMatchCancel(socketId: string) {
    const hasRemoved = waitingPool.removeFromPool(socketId);

    if (hasRemoved) {
      console.log('waitingUsers', waitingPool.getPoolUsers());
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  }

  async function handleMatchLeave(userId: string) {
    const result = await userService.updateUserStatus(
      userId,
      UserStatusSchema.enum.LEFT
    );

    notifyMatchLeave(result.roomId);
  }

  async function notifyMatchSuccess(
    user: MatchedUser,
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

  return {
    handleMatchCancel,
    handleMatchLeave,
    handleMatchStart,
    notifyMatchLeave,
    notifyMatchSuccess,
  };
}
