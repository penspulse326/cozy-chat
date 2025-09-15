import type { Server } from 'socket.io';

import { MATCH_EVENT, userStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import userService from '@/services/user.service';

import type { WaitingPool } from '../waiting-pool';

export function createMatchHandlers(io: Server, waitingPool: WaitingPool) {
  async function handleMatchStart(newUser: WaitingUser) {
    const peerUser = waitingPool.getNextUserFromPool();

    if (!peerUser) {
      waitingPool.addUserToPool(newUser);
      console.log(`加入等待池: ${newUser.socketId}`);

      // 設定超時
      setTimeout(() => {
        const hasRemoved = waitingPool.removeUserFromPool(newUser.socketId);

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
    const matchedUsers = await userService.createMatchedUsers(newUser, peerUser);
    const roomId = matchedUsers[0].room_id?.toString() ?? '';

    await Promise.all(
      matchedUsers.map((user) => notifyMatchSuccess({
        ...newUser,
        userId: user.id,
      }, roomId))
    );
  }

  function handleMatchCancel(socketId: string) {
    const hasRemoved = waitingPool.removeUserFromPool(socketId);

    if (hasRemoved) {
      console.log('waitingPool', waitingPool.getPoolUsers());
      io.of('/').sockets.get(socketId)?.emit(MATCH_EVENT.CANCEL);
    }
  }

  async function handleMatchLeave(userId: string) {
    const updatedUser = await userService.updateUserStatus(
      userId,
      userStatusSchema.enum.LEFT
    );

    if (updatedUser.room_id) {
      notifyMatchLeave(updatedUser.room_id.toString());
    }
  }

  async function notifyMatchSuccess(
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

  return {
    handleMatchCancel,
    handleMatchLeave,
    handleMatchStart,
    notifyMatchLeave,
    notifyMatchSuccess,
  };
}
