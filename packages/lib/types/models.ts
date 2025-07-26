import type { Device, UserStatus } from './const';

export type ChatMessage = {
  message: string;
  roomId: string;
};

export type ChatRoom = {
  _id: string;
  created_at: Date;
  users: string[];
};

export type User = {
  _id: string;
  created_at: Date;
  device: Device;
  last_active_at: Date;
  room_id: string;
  status: UserStatus;
};
