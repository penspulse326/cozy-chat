import { UserStatus } from '@packages/lib/dist';

import type { WaitingUser } from '@/types';

import UserModel from '@/models/user.model';

async function createUser(user: WaitingUser) {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    device: user.device,
    last_active_at: currentTime,
    status: UserStatus.enum.ACTIVE,
  };

  const result = await UserModel.createUser(payload);

  return result;
}

async function updateUserRoomId(userId: string, roomId: string) {
  const result = await UserModel.updateUserRoomId(userId, roomId);

  return result;
}

export default {
  createUser,
  updateUserRoomId,
};
