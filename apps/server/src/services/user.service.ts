import type { UserStatus } from '@packages/lib';

import { UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import UserModel from '@/models/user.model';

import ChatRoomService from './chat-room.service';

async function createMatchedUsers(newUser: WaitingUser, peerUser: WaitingUser) {
  const createdNewUser = await createUser(newUser);
  const createdPeerUser = await createUser(peerUser);

  if (!createdNewUser || !createdPeerUser) {
    return null;
  }

  const newChatRoom = await ChatRoomService.createChatRoom([
    createdNewUser.insertedId.toString(),
    createdPeerUser.insertedId.toString(),
  ]);

  const roomId = newChatRoom?.insertedId.toString();

  if (!roomId) {
    return null;
  }

  const matchedUsers = [
    {
      ...newUser,
      userId: createdNewUser.insertedId.toString(),
    },
    {
      ...peerUser,
      userId: createdPeerUser.insertedId.toString(),
    },
  ];

  await Promise.all(
    matchedUsers.map((user) => updateUserRoomId(user.userId, roomId))
  );

  return {
    matchedUsers,
    roomId,
  };
}

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
  const user = await findUserById(userId);

  if (!user) {
    return;
  }

  await UserModel.updateUserStatus(userId, status);

  return {
    roomId: user.room_id.toString(),
  };
}

export default {
  createMatchedUsers,
  createUser,
  findUserById,
  updateUserRoomId,
  updateUserStatus,
};
