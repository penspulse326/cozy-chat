import type { DeviceMap } from '@packages/lib/dist';

export type SocketChatMessage = {
  message: string;
  roomId: string;
  userId: string;
};

export type WaitingUser = {
  device: keyof typeof DeviceMap;
  socketId: string;
};
