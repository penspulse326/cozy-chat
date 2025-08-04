import type { ChatMessage, CreateChatMessagePayload } from '@packages/lib';
import type { InsertOneResult } from 'mongodb';

import { CreateChatMessageSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

async function createChatMessage(
  data: CreateChatMessagePayload
): Promise<InsertOneResult<CreateChatMessagePayload> | null> {
  const chatMessages = db.collection<CreateChatMessagePayload>('chat_messages');

  try {
    const validatedChatMessage = CreateChatMessageSchema.parse(data);
    const result = await chatMessages.insertOne(validatedChatMessage);
    console.log('新增 ChatMessage 成功');

    return result;
  } catch (error) {
    console.error('新增 ChatMessage 失敗', error);

    return null;
  }
}

async function findChatMessageById(_id: string): Promise<ChatMessage | null> {
  const chatMessages = db.collection<ChatMessage>('chat_messages');

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

export default {
  createChatMessage,
  findChatMessageById,
};
