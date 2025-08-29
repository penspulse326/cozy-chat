import type { DeviceMap } from '@packages/lib';

export type MatchedUser = WaitingUser & { userId: string };

export type WaitingUser = {
  device: keyof typeof DeviceMap;
  socketId: string;
};
