import type { Device, UserStatus } from './maps';

export interface ChatRoom {
  _id: string;
  created_at: Date;
  users: string[];
}

export interface User {
  _id: string;
  created_at: Date;
  device: keyof typeof Device;
  last_active_at: Date;
  room_id: string;
  status: keyof typeof UserStatus;
}
