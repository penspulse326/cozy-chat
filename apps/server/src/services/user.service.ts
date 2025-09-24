import type { UserDto, UserStatus } from '@packages/lib';

import { userStatusSchema } from '@packages/lib';

import type { WaitingUser } from '@/types';

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
): Promise<UserDto[]> {
  // 1. 並行建立兩個 user
  const [newUserResult, peerUserResult] = await Promise.all([
    createUser(newUser),
    createUser(peerUser),
  ]);
  // createUser 已經處理了錯誤情況

  // 2. 建立聊天室
  const newChatRoom = await chatRoomService.createChatRoom([
    newUserResult.id,
    peerUserResult.id,
  ]);
  // chatRoomService.createChatRoom 已經處理了錯誤情況
  const roomId = newChatRoom.id;

  // 3. 批量更新 user 的roomId
  const userIds = [newUserResult.id, peerUserResult.id];
  const updatedUsers = await userModel.updateManyUserRoomId(userIds, roomId);

  if (!updatedUsers) {
    throw new Error(`批量更新使用者聊天室失敗: ${userIds.join(', ')}`);
  }

  return updatedUsers;
}

async function createUser(user: WaitingUser): Promise<UserDto> {
  const currentTime = new Date();
  const dto = {
    createdAt: currentTime,
    device: user.device,
    lastActiveAt: currentTime,
    status: userStatusSchema.enum.ACTIVE,
  };

  const result = await userModel.createUser(dto);
  if (result === null) {
    throw new Error('建立使用者失敗');
  }
  return result;
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

async function removeInactiveUsers(): Promise<void> {
  const users = await userModel.findAllUsers();
  if (users === null) {
    throw new Error(`查詢使用者失敗`);
  }

  const inactiveUserIds = users
    .filter((user) => {
      const lastActiveTime = new Date(user.lastActiveAt).getTime();
      const currentTime = Date.now();
      const inactiveThreshold = 5 * 60 * 1000; // 5 分鐘
      return currentTime - lastActiveTime > inactiveThreshold;
    })
    .map((user) => user.id);

  if (inactiveUserIds.length === 0) {
    return;
  }

  const result = await userModel.removeMany(inactiveUserIds);
  if (!result) {
    throw new Error(`移除不活躍使用者失敗: ${inactiveUserIds.join(', ')}`);
  }
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
): Promise<UserDto> {
  const user = await findUserById(userId);
  // findUserById 已經處理了 null 的情況

  if (!user.roomId) {
    throw new Error(`使用者沒有聊天室: ${userId}`);
  }

  const result = await userModel.updateUserStatus(userId, status);
  if (result === null) {
    throw new Error(`更新使用者狀態失敗: ${userId}`);
  }

  return result;
}

export default {
  checkUserStatus,
  createMatchedUsers,
  createUser,
  findUserById,
  findUsersByRoomId,
  removeInactiveUsers,
  updateUserRoomId,
  updateUserStatus,
};
