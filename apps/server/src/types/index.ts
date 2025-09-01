import type { Device } from '@packages/lib';

export type MatchedUser = WaitingUser & { userId: string };

export type WaitingUser = {
  device: Device;
  socketId: string;
};
