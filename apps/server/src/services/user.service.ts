import type { UserStatus } from '@packages/lib';

import { UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import UserModel from '@/models/user.model';

async function createUser(user: WaitingUser) {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    device: user.device,
    last_active_at: currentTime,
    status: UserStatusSchema.enum.ACTIVE,
  };

  const result = await UserModel.createUser(payload);

  return result;
}

async function findUserById(userId: string) {
  const result = await UserModel.findUserById(userId);

  return result;
}

async function updateUserRoomId(userId: string, roomId: string) {
  const result = await UserModel.updateUserRoomId(userId, roomId);

  return result;
}

async function updateUserStatus(userId: string, status: UserStatus) {
  const result = await UserModel.updateUserStatus(userId, status);

  return result;
}

export default {
  createUser,
  findUserById,
  updateUserRoomId,
  updateUserStatus,
};
