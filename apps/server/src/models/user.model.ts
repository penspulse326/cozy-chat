import type { CreateUserDto, UserDto, UserStatus } from '@packages/lib';

import { createUserDtoSchema, userDtoSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { getCollection } from '@/config/db';

export type UserEntity = Omit<UserDto, 'id'> & { _id: ObjectId };

const convertToDto = (entity: UserEntity): UserDto => {
  const candidate: UserDto = {
    ...entity,
    id: entity._id.toString(),
  };
  return userDtoSchema.parse(candidate);
}

async function createUser(
  dto: CreateUserDto
): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const candidate = createUserDtoSchema.parse(dto);
    const newObjectId = new ObjectId();

    const result = await users.insertOne({
      ...candidate,
      _id: newObjectId,
    });
    console.log('新增 UserDto 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...candidate,
        _id: result.insertedId,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('新增 UserDto 失敗', error);

    return null;
  }
}

async function findUserById(userId: string): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });
    console.log('查詢 UserDto 成功');

    if (user) {
      return convertToDto({
        ...user,
        _id: user._id,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('查詢 UserDto 失敗', error);

    return null;
  }
}

async function findUsersByRoomId(roomId: string): Promise<null | UserDto[]> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.find({ room_id: roomId }).toArray();
    console.log('查詢 UserDto 成功');

    return result.map(user => convertToDto({
      ...user,
      _id: user._id,
    }));
  } catch (error: unknown) {
    console.error('查詢 UserDto 失敗', error);

    return null;
  }
}


async function updateManyUserRoomId(
  userIds: string[],
  roomId: string
): Promise<null | { acknowledged: boolean; modifiedCount: number }> {
  const users = getCollection<UserEntity>('users');

  try {
    const objectIds = userIds.map((id) => new ObjectId(id));
    const result = await users.updateMany(
      { _id: { $in: objectIds } },
      { $set: { room_id: roomId } }
    );
    console.log('批量更新 UserDto RoomId 成功');

    return {
      acknowledged: result.acknowledged,
      modifiedCount: result.modifiedCount,
    };
  } catch (error: unknown) {
    console.error('批量更新 UserDto RoomId 失敗', error);
    return null;
  }
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { room_id: roomId } }
    );
    console.log('更新 UserDto RoomId 成功');

    if (result.acknowledged) {
      // 查找更新後的用戶並返回
      const user = await findUserById(userId);
      return user;
    }

    return null;
  } catch (error: unknown) {
    console.error('更新 UserDto RoomId 失敗', error);
    return null;
  }
}

async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { status } }
    );

    if (result.acknowledged) {
      // 查找更新後的用戶並返回
      const user = await findUserById(userId);
      return user;
    }

    return null;
  } catch (error: unknown) {
    console.error('更新 UserDto Status 失敗', error);
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
