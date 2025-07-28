import type { User } from '@packages/lib/dist';
import type { InsertManyResult, InsertOneResult } from 'mongodb';

import { UserSchema } from '@packages/lib/dist';

import { db } from '@/config/db';

async function createUser(data: User): Promise<InsertOneResult<User> | null> {
  const users = db.collection<User>('users');

  try {
    const validatedUser = UserSchema.parse(data);

    const result = await users.insertOne(validatedUser);
    console.log('新增 User 成功');

    return result;
  } catch (error: unknown) {
    console.error('新增 User 失敗', error);

    return null;
  }
}

async function createUsers(
  users: User[]
): Promise<InsertManyResult<User> | null> {
  const usersCollection = db.collection<User>('users');

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

async function getUserById(id: string): Promise<null | User> {
  const users = db.collection<User>('users');

  try {
    const user = await users.findOne({ _id: id });

    return user;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

export default {
  createUser,
  createUsers,
  getUserById,
};
