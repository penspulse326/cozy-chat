import type { WaitingUser } from '@/types';

export type SocketState = ReturnType<typeof createSocketState>;

export function createSocketState() {
  const waitingUsers: WaitingUser[] = [];

  const addWaitingUser = (newUser: WaitingUser) => {
    waitingUsers.push(newUser);
    return newUser;
  };

  const removeWaitingUser = (socketId: string) => {
    const index = waitingUsers.findIndex((user) => user.socketId === socketId);

    if (index === -1) {
      return false;
    }

    waitingUsers.splice(index, 1);
    return true;
  };

  const getNextWaitingUser = () => {
    return waitingUsers.shift();
  };

  const getWaitingUsers = () => {
    return [...waitingUsers];
  };

  return {
    addWaitingUser,
    getNextWaitingUser,
    getWaitingUsers,
    removeWaitingUser,
  };
}
