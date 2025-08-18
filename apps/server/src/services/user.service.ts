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
  // 1. 建立兩個 user 
  const newUserId = await createUserAndGetId(newUser);
  const peerUserId = await createUserAndGetId(peerUser);

  if (!newUserId || !peerUserId) {
    return null;
  }

  // 2. 建立聊天室
  const newChatRoom = await chatRoomService.createChatRoom([newUserId, peerUserId]);
  const roomId = newChatRoom?.insertedId.toString();

  if (!roomId) {
    return null;
  }

  // 3. 批量更新 user 的roomId
  const userIds = [newUserId, peerUserId];
  const updateResult = await userModel.updateManyUserRoomId(userIds, roomId);

  if (!updateResult || !updateResult.acknowledged || updateResult.modifiedCount !== 2) {
    // 如果更新失敗，返回null
    return null;
  }

  // 4. 返回結果
  const matchedUsers = [
    {
      ...newUser,
      userId: newUserId,
    },
    {
      ...peerUser,
      userId: peerUserId,
    },
  ];

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

// 建立單個 user 並返回ID
async function createUserAndGetId(user: WaitingUser): Promise<null | string> {
  const result = await createUser(user);
  return result ? result.insertedId.toString() : null;
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
    return null;
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
  createUserAndGetId,
  findUserById,
  findUsersByRoomId,
  updateUserRoomId,
  updateUserStatus,
};
