import { UserStatus } from '@packages/lib/dist';

import type { WaitingUser } from '@/types';

import userModel from '@/models/user.model';

async function createUsers(users: WaitingUser[]) {
  const currentTime = new Date();
  const roomId = `room-${users[0].socketId}-${users[1].socketId}`;
  const payload = users.map((user) => ({
    _id: user.socketId,
    created_at: currentTime,
    device: user.device,
    last_active_at: currentTime,
    room_id: roomId,
    status: UserStatus.enum.ACTIVE,
  }));

  const result = await userModel.createUsers(payload);

  return result;
}

export default {
  createUsers,
};
