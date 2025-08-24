import type { ChatMessage, CreateChatMessagePayload } from '@packages/lib';
import type { InsertOneResult, OptionalId } from 'mongodb';

import { CreateChatMessageSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';

import { db } from '@/config/db';

type ChatMessageData = Omit<ChatMessage, '_id'> & { _id: ObjectId };

export type { ChatMessageData };

async function createChatMessage(
  data: CreateChatMessagePayload
): Promise<InsertOneResult<OptionalId<ChatMessageData>> | null> {
  const chatMessages =
    db.collection<OptionalId<ChatMessageData>>('chat_messages');

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

async function findChatMessageById(
  _id: string
): Promise<ChatMessageData | null> {
  const chatMessages = db.collection<ChatMessageData>('chat_messages');

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
): Promise<ChatMessageData[] | null> {
  const chatMessages = db.collection<ChatMessageData>('chat_messages');

  try {
    const result = await chatMessages.find({ room_id: roomId }).toArray();
    console.log(`找到 ChatMessages: ${roomId}: ${JSON.stringify(result)}`);

    return result;
  } catch (error) {
    console.error(`查詢 ChatMessages 失敗: ${roomId}`, error);
    return null;
  }
}

export default {
  createChatMessage,
  findChatMessageById,
  findChatMessagesByRoomId,
};
