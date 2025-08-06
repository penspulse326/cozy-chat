import type { UserStatus } from '@packages/lib';

import { UserStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

import userModel from '@/models/user.model';

import chatRoomService from './chat-room.service';

async function checkUserStatus(roomId: string) {
  const users = await findUsersByRoomId(roomId);

  if (!users) {
    return false;
  }

  return users.some((user) => user.status === UserStatusSchema.enum.LEFT);
}

async function createMatchedUsers(newUser: WaitingUser, peerUser: WaitingUser) {
  const createdNewUser = await createUser(newUser);
  const createdPeerUser = await createUser(peerUser);

  if (!createdNewUser || !createdPeerUser) {
    return null;
  }

  const newChatRoom = await chatRoomService.createChatRoom([
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

  const result = await userModel.createUser(payload);

  return result;
}

async function findUserById(userId: string) {
  const result = await userModel.findUserById(userId);

  return result;
}

async function findUsersByRoomId(roomId: string) {
  const result = await userModel.findUsersByRoomId(roomId);

  return result;
}

async function updateUserRoomId(userId: string, roomId: string) {
  const result = await userModel.updateUserRoomId(userId, roomId);

  return result;
}

async function updateUserStatus(userId: string, status: UserStatus) {
  const user = await findUserById(userId);

  if (!user || !user.room_id) {
    return;
  }

  await userModel.updateUserStatus(userId, status);

  return {
    roomId: user.room_id.toString(),
  };
}

export default {
  checkUserStatus,
  createMatchedUsers,
  createUser,
  findUserById,
  findUsersByRoomId,
  updateUserRoomId,
  updateUserStatus,
};
