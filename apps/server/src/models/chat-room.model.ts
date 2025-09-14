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
    console.log('新增 ChatRoomDto 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...candidate,
        _id: newObjectId,
      });
    }

    return null;
  } catch (error) {
    console.error('新增 ChatRoomDto 失敗', error);

    return null;
  }
}

async function findChatRoomById(id: string): Promise<ChatRoomDto | null> {
  const chatRooms = getCollection<ChatRoomEntity>('chat_rooms');

  try {
    const result = await chatRooms.findOne({ _id: new ObjectId(id) });
    console.log('查詢 ChatRoomDto 成功');

    if (result) {
      return convertToDto(result);
    }

    return null;
  } catch (error) {
    console.error('查詢 ChatRoomDto 失敗', error);

    return null;
  }
}


const chatRoomModel = {
  createChatRoom,
  findChatRoomById,
};

export default chatRoomModel;
