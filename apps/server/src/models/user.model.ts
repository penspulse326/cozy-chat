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
};

async function createUser(dto: CreateUserDto): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const candidate = createUserDtoSchema.parse(dto);
    const newObjectId = new ObjectId();

    const result = await users.insertOne({
      ...candidate,
      _id: newObjectId,
    });
    console.log('新增 User 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...candidate,
        _id: result.insertedId,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('新增 User 失敗', error);

    return null;
  }
}

async function findUserById(userId: string): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const user = await users.findOne({ _id: new ObjectId(userId) });
    console.log('查詢 User 成功');

    if (user) {
      return convertToDto({
        ...user,
        _id: user._id,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function findUsersByRoomId(roomId: string): Promise<null | UserDto[]> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.find({ roomId: roomId }).toArray();
    console.log('查詢 User 成功');

    return result.map((user) =>
      convertToDto({
        ...user,
        _id: user._id,
      })
    );
  } catch (error: unknown) {
    console.error('查詢 User 失敗', error);

    return null;
  }
}

async function updateManyUserRoomId(
  userIds: string[],
  roomId: string
): Promise<null | UserDto[]> {
  const users = getCollection<UserEntity>('users');

  try {
    const objectIds = userIds.map((id) => new ObjectId(id));
    const result = await users.updateMany(
      { _id: { $in: objectIds } },
      { $set: { roomId: roomId } }
    );
    console.log('批量更新 User RoomId 成功');

    if (result.acknowledged) {
      // 查找所有更新後的使用者並返回
      const updatedUsers = await users
        .find({ _id: { $in: objectIds } })
        .toArray();
      return updatedUsers.map((user) =>
        convertToDto({
          ...user,
          _id: user._id,
        })
      );
    }

    return null;
  } catch (error: unknown) {
    console.error('批量更新 User RoomId 失敗', error);
    return null;
  }
}

async function updateUserRoomId(
  userId: string,
  roomId: string
): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { roomId: roomId } },
      { returnDocument: 'after' }
    );
    console.log('更新 User RoomId 成功');

    if (result) {
      return convertToDto({
        ...result,
        _id: result._id,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('更新 User RoomId 失敗', error);
    return null;
  }
}

async function updateUserStatus(
  userId: string,
  status: UserStatus
): Promise<null | UserDto> {
  const users = getCollection<UserEntity>('users');

  try {
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: { status } },
      { returnDocument: 'after' }
    );

    if (result) {
      return convertToDto({
        ...result,
        _id: result._id,
      });
    }

    return null;
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
