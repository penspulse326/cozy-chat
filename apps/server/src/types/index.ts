import type { DeviceMap } from '@packages/lib/dist';

export type WaitingUser = {
  device: keyof typeof DeviceMap;
  socketId: string;
};
