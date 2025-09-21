import type { Server } from 'socket.io';

import { MATCH_EVENT, userStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import userService from '@/services/user.service';

import type { WaitingPool } from '../waiting-pool';

export type MatchHandlers = ReturnType<typeof createMatchHandlers>;

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
    const matchedUsers = await userService.createMatchedUsers(
      newUser,
      peerUser
    );
    const roomId = matchedUsers[0].roomId?.toString() ?? '';

    // 將兩個使用者的 socketId 與 userId 對應起來
    const userSocketMap = [
      { socketId: newUser.socketId, userId: matchedUsers[0].id },
      { socketId: peerUser.socketId, userId: matchedUsers[1].id },
    ];

    // 確保每個使用者都收到正確的配對成功通知
    await Promise.all(
      userSocketMap.map((user) =>
        notifyMatchSuccess(user.socketId, user.userId, roomId)
      )
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

    if (updatedUser.roomId) {
      notifyMatchLeave(updatedUser.roomId.toString());
    }
  }

  async function notifyMatchSuccess(
    clientId: string,
    userId: string,
    roomId: string
  ) {
    await io.of('/').sockets.get(clientId)?.join(roomId);

    io.to(clientId).emit(MATCH_EVENT.SUCCESS, {
      roomId,
      userId,
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
