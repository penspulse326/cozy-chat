import type { DeviceMap } from '@packages/lib';

export type WaitingUser = {
  device: keyof typeof DeviceMap;
  socketId: string;
};
