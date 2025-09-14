import type { ChatMessage, CreateChatMessage } from '@packages/lib';
import type { InsertOneResult, OptionalId } from 'mongodb';

import { createChatMessageDtoSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

export type ChatMessageEntity = Omit<ChatMessage, 'id'> & { _id: ObjectId };

async function createChatMessage(
  data: CreateChatMessage
): Promise<InsertOneResult<OptionalId<ChatMessageEntity>> | null> {
  const chatMessages =
    db.collection<OptionalId<ChatMessageEntity>>('chat_messages');

  try {
    const validatedChatMessage = createChatMessageDtoSchema.parse(data);
    const result = await chatMessages.insertOne({
      ...validatedChatMessage,
      _id: new ObjectId(),
    });
    console.log('新增 ChatMessage 成功');

    return result;
  } catch (error) {
    console.error('新增 ChatMessage 失敗', error);

    return null;
  }
}

async function findChatMessageById(
  _id: string
): Promise<ChatMessageEntity | null> {
  const chatMessages = getChatMessageCollection();

  try {
    const result = await chatMessages.findOne({ _id: new ObjectId(_id) });

    if (result) {
      console.log(`找到 ChatMessage: ${_id}: ${JSON.stringify(result)}`);
      return result;
    } else {
      console.log(`找不到 ChatMessage: ${_id}`);
      return null;
    }
  } catch (error) {
    console.error(`查詢 ChatMessage 失敗: ${_id}`, error);
    return null;
  }
}

async function findChatMessagesByRoomId(
  roomId: string
): Promise<ChatMessageEntity[] | null> {
  const chatMessages = getChatMessageCollection();

  try {
    const result = await chatMessages.find({ room_id: roomId }).toArray();
    console.log(`找到 ChatMessages: ${roomId}: ${JSON.stringify(result)}`);

    return result;
  } catch (error) {
    console.error(`查詢 ChatMessages 失敗: ${roomId}`, error);
    return null;
  }
}

function getChatMessageCollection() {
  return db.collection<ChatMessageEntity>('chat_messages');
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
};
