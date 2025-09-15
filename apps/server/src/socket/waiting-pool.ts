import type { WaitingUser } from '@/types';

export type WaitingPool = ReturnType<typeof createWaitingPool>;

export function createWaitingPool() {
  const waitingPool: WaitingUser[] = [];

  function addUserToPool(newUser: WaitingUser) {
    waitingPool.push(newUser);
  }

  function removeUserFromPool(socketId: string) {
    const index = waitingPool.findIndex((user) => user.socketId === socketId);

    if (index === -1) {
      return false;
    }

    waitingPool.splice(index, 1);
    return true;
  }

  function getNextUserFromPool() {
    return waitingPool.shift();
  }

  function getPoolUsers() {
    return [...waitingPool];
  }

  return {
    addUserToPool,
    getNextUserFromPool,
    getPoolUsers,
    removeUserFromPool,
  };
}
