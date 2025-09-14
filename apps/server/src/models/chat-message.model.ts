import type { ChatMessageDto, CreateChatMessageDto } from '@packages/lib';
import type { OptionalId } from 'mongodb';

import { chatMessageDtoSchema, createChatMessageDtoSchema } from '@packages/lib';
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
    console.log('新增 ChatMessageDto 成功');

    if (result.acknowledged) {
      return convertToDto({
        ...validatedChatMessage,
        _id: newObjectId,
      });
    }

    return null;
  } catch (error: unknown) {
    console.error('新增 ChatMessageDto 失敗', error);

    return null;
  }
}

async function findChatMessageById(
  _id: string
): Promise<ChatMessageDto | null> {
  const chatMessages = getCollection<ChatMessageEntity>('chat_messages');

  try {
    const result = await chatMessages.findOne({ _id: new ObjectId(_id) });

    if (result) {
      console.log(`找到 ChatMessageDto: ${_id}: ${JSON.stringify(result)}`);
      return convertToDto(result);
    } else {
      console.log(`找不到 ChatMessageDto: ${_id}`);
      return null;
    }
  } catch (error: unknown) {
    console.error(`查詢 ChatMessageDto 失敗: ${_id}`, error);
    return null;
  }
}

async function findChatMessagesByRoomId(
  roomId: string
): Promise<ChatMessageDto[] | null> {
  const chatMessages = getCollection<ChatMessageEntity>('chat_messages');

  try {
    const result = await chatMessages.find({ room_id: roomId }).toArray();
    console.log(`找到 ChatMessages: ${roomId}: ${JSON.stringify(result)}`);

    return result.map(message => convertToDto(message));
  } catch (error: unknown) {
    console.error(`查詢 ChatMessages 失敗: ${roomId}`, error);
    return null;
  }
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
};
