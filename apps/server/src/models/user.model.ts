import type { UserPayload } from '@packages/lib';
import type { InsertManyResult } from 'mongodb';

import { UserSchema } from '@packages/lib';

import { db } from '@/config/db';

async function createUsers(
  users: UserPayload[]
): Promise<InsertManyResult<UserPayload> | null> {
  const usersCollection = db.collection<UserPayload>('users');

  try {
    const validatedUsers = users.map((user) => UserSchema.parse(user));
    const result = await usersCollection.insertMany(validatedUsers);
    console.log('新增 Users 成功');

    return result;
  } catch (error: unknown) {
    console.error('新增 Users 失敗', error);

    return null;
  }
}

async function getUserById(id: string): Promise<null | UserPayload> {
  const users = db.collection<UserPayload>('users');

  try {
    const user = await users.findOne({ _id: id });

    return user;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

export default {
  createUsers,
  getUserById,
};
