import type { DeviceMap } from '@packages/lib/dist';

export type SocketChatMessage = {
  content: string;
  room_id: string;
  user_id: string;
};

export type WaitingUser = {
  device: keyof typeof DeviceMap;
  socketId: string;
};
