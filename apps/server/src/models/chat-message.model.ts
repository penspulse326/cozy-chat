import type { ChatMessageDto, CreateChatMessageDto } from '@packages/lib';
import type { OptionalId } from 'mongodb';

import {
  chatMessageDtoSchema,
  createChatMessageDtoSchema,
} from '@packages/lib';
import { ObjectId } from 'mongodb';

import { getCollection } from '@/config/db';

export type ChatMessageEntity = Omit<ChatMessageDto, 'id'> & { _id: ObjectId };

const convertToDto = (entity: ChatMessageEntity): ChatMessageDto => {
  const candidate: ChatMessageDto = {
    ...entity,
    id: entity._id.toString(),
  };
  return chatMessageDtoSchema.parse(candidate);
};

async function createChatMessage(
  dto: CreateChatMessageDto
): Promise<ChatMessageDto | null> {
  const chatMessages =
    getCollection<OptionalId<ChatMessageEntity>>('chat_messages');

  try {
    const validatedChatMessage = createChatMessageDtoSchema.parse(dto);
    const newObjectId = new ObjectId();

    const result = await chatMessages.insertOne({
      ...validatedChatMessage,
      _id: newObjectId,
    });
    console.log('新增 ChatMessage 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...validatedChatMessage,
        _id: newObjectId,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('新增 ChatMessage 失敗', error);

    return null;
  }
}

async function findChatMessageById(
  _id: string
): Promise<ChatMessageDto | null> {
  const chatMessages = getCollection<ChatMessageEntity>('chat_messages');

  try {
    const message = await chatMessages.findOne({ _id: new ObjectId(_id) });

    if (message) {
      console.log(`找到 ChatMessageDto: ${_id}: ${JSON.stringify(message)}`);
      return convertToDto(message);
    }

    console.log(`找不到 ChatMessageDto: ${_id}`);
    return null;
  } catch (error: unknown) {
    console.error(`查詢 ChatMessage 失敗: ${_id}`, error);
    return null;
  }
}

async function findChatMessagesByRoomIds(
  roomId: string
): Promise<ChatMessageDto[] | null> {
  const chatMessages = getCollection<ChatMessageEntity>('chat_messages');

  try {
    const messages = await chatMessages.find({ roomId: roomId }).toArray();
    console.log(`找到 ChatMessages: ${roomId}: ${JSON.stringify(messages)}`);

    return messages.map((message) => convertToDto(message));
  } catch (error: unknown) {
    console.error(`查詢 ChatMessages 失敗: ${roomId}`, error);
    return null;
  }
}

async function removeManyByRoomIds(roomIds: string[]): Promise<boolean> {
  const chatMessages = getCollection<ChatMessageEntity>('chat_messages');

  try {
    const result = await chatMessages.deleteMany({
      roomId: { $in: roomIds },
    });

    console.log(`批量刪除 ChatMessage 成功: ${roomIds.join(', ')}`);
    return result.acknowledged;
  } catch (error: unknown) {
    console.error(`批量刪除 ChatMessage 失敗: ${roomIds.join(', ')}`, error);
    return false;
  }
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomIds,
  removeManyByRoomIds,
};
