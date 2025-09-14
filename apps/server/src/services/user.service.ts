import type { UserDto, UserStatus } from '@packages/lib';

import { userStatusSchema } from '@packages/lib';

import type { MatchedUser, WaitingUser } from '@/types';

import userModel from '@/models/user.model';

import chatRoomService from './chat-room.service';

async function checkUserStatus(roomId: string): Promise<boolean> {
  try {
    const users = await findUsersByRoomId(roomId);
    // findUsersByRoomId 已經處理了 null 的情況
    return users.some((user) => user.status === userStatusSchema.enum.LEFT);
  } catch (_error) {
    // 如果找不到聊天室的使用者，則返回 false
    return false;
  }
}

async function createMatchedUsers(
  newUser: WaitingUser,
  peerUser: WaitingUser
): Promise<{
  matchedUsers: MatchedUser[];
  roomId: string;
}> {
  // 1. 建立兩個 user
  const newUserId = await createUserAndGetId(newUser);
  const peerUserId = await createUserAndGetId(peerUser);
  // createUserAndGetId 已經處理了錯誤情況

  // 2. 建立聊天室
  const newChatRoom = await chatRoomService.createChatRoom([
    newUserId,
    peerUserId,
  ]);
  // chatRoomService.createChatRoom 已經處理了錯誤情況
  const roomId = newChatRoom.id;

  // 3. 批量更新 user 的roomId
  const userIds = [newUserId, peerUserId];
  const updateResult = await userModel.updateManyUserRoomId(userIds, roomId);

  if (
    !updateResult ||
    !updateResult.acknowledged ||
    updateResult.modifiedCount !== 2
  ) {
    throw new Error(`批量更新使用者聊天室失敗: ${userIds.join(', ')}`);
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

async function createUser(
  user: WaitingUser
): Promise<UserDto> {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    device: user.device,
    last_active_at: currentTime,
    status: userStatusSchema.enum.ACTIVE,
  };

  const result = await userModel.createUser(payload);
  if (result === null) {
    throw new Error('建立使用者失敗');
  }
  return result;
}

// 建立單個 user 並返回ID
async function createUserAndGetId(user: WaitingUser): Promise<string> {
  const result = await createUser(user);
  // createUser 已經處理了 null 的情況
  return result.id;
}

async function findUserById(userId: string): Promise<UserDto> {
  const result = await userModel.findUserById(userId);
  if (result === null) {
    throw new Error(`找不到使用者: ${userId}`);
  }
  return result;
}

async function findUsersByRoomId(roomId: string): Promise<UserDto[]> {
  const result = await userModel.findUsersByRoomId(roomId);
  if (result === null) {
    throw new Error(`找不到聊天室的使用者: ${roomId}`);
  }
  return result;
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<UserDto> {
  const result = await userModel.updateUserRoomId(userId, roomId);
  if (result === null) {
    throw new Error(`更新使用者聊天室失敗: ${userId}`);
  }
  return result;
}

async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<{ roomId: string }> {
  const user = await findUserById(userId);
  // findUserById 已經處理了 null 的情況

  if (!user.room_id) {
    throw new Error(`使用者沒有聊天室: ${userId}`);
  }

  const result = await userModel.updateUserStatus(userId, status);
  if (result === null) {
    throw new Error(`更新使用者狀態失敗: ${userId}`);
  }

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
