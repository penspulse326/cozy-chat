import { Device, UserStatus } from './maps';

export interface ChatRoom {
  _id: string;
  users: string[];
  created_at: Date;
}

export interface User {
  _id: string;
  room_id: string;
  device: keyof typeof Device;
  status: keyof typeof UserStatus;
  last_active_at: Date;
  created_at: Date;
}
