import type { ChatRoomDto, CreateChatRoomDto } from '@packages/lib';

import { chatRoomDtoSchema, createChatRoomDtoSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { getCollection } from '@/config/db';

export type ChatRoomEntity = Omit<ChatRoomDto, 'id'> & { _id: ObjectId };

const convertToDto = (entity: ChatRoomEntity): ChatRoomDto => {
  const candidate: ChatRoomDto = {
    ...entity,
    id: entity._id.toString(),
  };
  return chatRoomDtoSchema.parse(candidate);
};

async function createChatRoom(
  dto: CreateChatRoomDto
): Promise<ChatRoomDto | null> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const candidate = createChatRoomDtoSchema.parse(dto);
    const newObjectId = new ObjectId();

    const result = await chatRooms.insertOne({
      ...candidate,
      _id: newObjectId,
    });
    console.log('新增 ChatRoom 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...candidate,
        _id: newObjectId,
      });
    }

    return null;
  } catch (error) {
    console.error('新增 ChatRoom 失敗', error);

    return null;
  }
}

async function deleteChatRoom(roomId: string): Promise<boolean> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const result = await chatRooms.deleteOne({ _id: new ObjectId(roomId) });
    console.log('刪除 ChatRoom 成功');

    return result.acknowledged;
  } catch (error) {
    console.error('刪除 ChatRoom 失敗', error);

    return false;
  }
}

async function findAllChatRooms(): Promise<ChatRoomDto[] | null> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const result = await chatRooms.find({}).toArray();
    console.log('查詢所有 ChatRoom 成功');

    return result.map((room) => convertToDto(room));
  } catch (error) {
    console.error('查詢所有 ChatRoom 失敗', error);

    return null;
  }
}

async function findChatRoomById(id: string): Promise<ChatRoomDto | null> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const result = await chatRooms.findOne({ _id: new ObjectId(id) });
    console.log('查詢 ChatRoom 成功');

    if (result) {
      return convertToDto(result);
    }

    return null;
  } catch (error) {
    console.error('查詢 ChatRoom 失敗', error);

    return null;
  }
}

async function removeMany(roomIds: string[]): Promise<boolean> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const objectIds = roomIds.map((id) => new ObjectId(id));
    const result = await chatRooms.deleteMany({ _id: { $in: objectIds } });
    console.log('批量刪除 ChatRoom 成功');

    return result.acknowledged;
  } catch (error) {
    console.error('批量刪除 ChatRoom 失敗', error);

    return false;
  }
}

async function removeUserFromChatRoom(
  roomId: string,
  userId: string
): Promise<ChatRoomDto | null> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const result = await chatRooms.findOneAndUpdate(
      { _id: new ObjectId(roomId) },
      { $pull: { users: userId } },
      { returnDocument: 'after' }
    );
    console.log('從 ChatRoom 移除使用者成功');

    if (result) {
      return convertToDto(result);
    }

    return null;
  } catch (error) {
    console.error('從 ChatRoom 移除使用者失敗', error);

    return null;
  }
}

const chatRoomModel = {
  createChatRoom,
  deleteChatRoom,
  findAllChatRooms,
  findChatRoomById,
  removeMany,
  removeUserFromChatRoom,
};

export default chatRoomModel;
