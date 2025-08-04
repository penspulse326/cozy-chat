import type { CreateUserPayload, User } from '@packages/lib';
import type { InsertOneResult, UpdateResult } from 'mongodb';

import { CreateUserSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

async function createUser(
  data: CreateUserPayload
): Promise<InsertOneResult<CreateUserPayload> | null> {
  const users = db.collection<User>('users');

  try {
    const validatedUser = CreateUserSchema.parse(data);
    const result = await users.insertOne({
      ...validatedUser,
      _id: new ObjectId().toHexString(),
      room_id: '',
    });

    console.log('新增 User 成功');

    return result;
  } catch (error: unknown) {
    console.error('新增 User 失敗', error);

    return null;
  }
}

async function getUserById(_id: string): Promise<null | User> {
  const users = db.collection<User>('users');

  try {
    const user = await users.findOne({ _id });

    return user;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<null | UpdateResult<User>> {
  const users = db.collection<User>('users');

  try {
    const result = await users.updateOne(
      { _id: userId },
      { $set: { room_id: roomId } }
    );

    return result;
  } catch (error: unknown) {
    console.error('更新 User RoomId 失敗', error);
    return null;
  }
}

export default {
  createUser,
  getUserById,
  updateUserRoomId,
};
