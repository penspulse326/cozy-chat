import type { WaitingUser } from '@/types';

export type WaitingPool = ReturnType<typeof createWaitingPool>;

export function createWaitingPool() {
  const waitingUsers: WaitingUser[] = [];

  function addToPool(newUser: WaitingUser) {
    waitingUsers.push(newUser);
    return newUser;
  }

  function removeFromPool(socketId: string) {
    const index = waitingUsers.findIndex((user) => user.socketId === socketId);

    if (index === -1) {
      return false;
    }

    waitingUsers.splice(index, 1);
    return true;
  }

  function getNextFromPool() {
    return waitingUsers.shift();
  }

  function getPoolUsers() {
    return [...waitingUsers];
  }

  return {
    addToPool,
    getNextFromPool,
    getPoolUsers,
    removeFromPool,
  };
}
