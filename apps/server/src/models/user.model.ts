import type { CreateUser, User, UserStatus } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { createUserDtoSchema } from '@packages/lib';
import { ObjectId, type UpdateResult } from 'mongodb';

import { db } from '@/config/db';

export type UserEntity = Omit<User, 'id'> & { _id: ObjectId };

async function createUser(
  data: CreateUser
): Promise<InsertOneResult<UserEntity> | null> {
  const users = getUserCollection();

  try {
    const candidate = createUserDtoSchema.parse(data);

    const result = await users.insertOne({
      ...candidate,
      _id: new ObjectId(),
    });
    console.log('新增 User 成功');

    return result;
  } catch (error: unknown) {
    console.error('新增 User 失敗', error);

    return null;
  }
}

async function findUserById(userId: string): Promise<null | UserEntity> {
  const users = getUserCollection();

  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });
    console.log('查詢 User 成功');

    return user;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function findUsersByRoomId(roomId: string): Promise<null | UserEntity[]> {
  const users = getUserCollection();

  try {
    const result = await users.find({ room_id: roomId }).toArray();
    console.log('查詢 User 成功');

    return result;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

function getUserCollection() {
  return db.collection<UserEntity>('users');
}

async function updateManyUserRoomId(
  userIds: string[],
  roomId: string
): Promise<null | { acknowledged: boolean; modifiedCount: number }> {
  const users = getUserCollection();

  try {
    const objectIds = userIds.map((id) => new ObjectId(id));
    const result = await users.updateMany(
      { _id: { $in: objectIds } },
      { $set: { room_id: roomId } }
    );
    console.log('批量更新 User RoomId 成功');

    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
    };
  } catch (error: unknown) {
    console.error('批量更新 User RoomId 失敗', error);
    return null;
  }
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<null | UpdateResult<UserEntity>> {
  const users = getUserCollection();

  try {
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { room_id: roomId } }
    );
    console.log('更新 User RoomId 成功');

    return result;
  } catch (error: unknown) {
    console.error('更新 User RoomId 失敗', error);
    return null;
  }
}

async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<null | UpdateResult<UserEntity>> {
  const users = getUserCollection();

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

const userModel = {
  createUser,
  findUserById,
  findUsersByRoomId,
  updateManyUserRoomId,
  updateUserRoomId,
  updateUserStatus,
};

export default userModel;
