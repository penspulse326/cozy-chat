import type { CreateUserPayload, User, UserStatus } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { CreateUserSchema } from '@packages/lib';
import { ObjectId, type UpdateResult } from 'mongodb';

import { db } from '@/config/db';

async function createUser(
  data: CreateUserPayload
): Promise<InsertOneResult | null> {
  const users = db.collection<User>('users');

  try {
    const validatedUser = CreateUserSchema.parse(data);
    const result = await users.insertOne(validatedUser);

    console.log('新增 User 成功');

    return result;
  } catch (error: unknown) {
    console.error('新增 User 失敗', error);

    return null;
  }
}

async function findUserById(userId: string): Promise<null | User> {
  const users = db.collection<User>('users');

  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });

    return user;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function findUsersByRoomId(roomId: string): Promise<null | User[]> {
  const users = db.collection<User>('users');

  try {
    const result = await users.find({ room_id: roomId }).toArray();

    return result;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<null | UpdateResult> {
  const users = db.collection<User>('users');

  try {
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { room_id: roomId } }
    );

    return result;
  } catch (error: unknown) {
    console.error('更新 User RoomId 失敗', error);
    return null;
  }
}

async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<null | UpdateResult> {
  const users = db.collection<User>('users');

  try {
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status } }
    );

    return result;
  } catch (error: unknown) {
    console.error('更新 User Status 失敗', error);
    return null;
  }
}

export default {
  createUser,
  findUserById,
  findUsersByRoomId,
  updateUserRoomId,
  updateUserStatus,
};
