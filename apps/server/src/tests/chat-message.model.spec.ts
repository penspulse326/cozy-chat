import type { Device } from '@packages/lib';

import { CreateChatMessageSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/config/db';
import chatMessageModel from '@/models/chat-message.model';

vi.mock('@/config/db', () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock('@packages/lib', () => ({
  CreateChatMessageSchema: {
    // 模擬驗證函數
    parse: vi.fn().mockImplementation((data: unknown) => data),
  },
}));

describe('Chat Message Model', () => {
  const mockCollection = {
    find: vi.fn(),
    findOne: vi.fn(),
    insertOne: vi.fn(),
  };

  const mockFindCursor = {
    toArray: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.collection).mockReturnValue(mockCollection as unknown as ReturnType<typeof db.collection>);
    mockCollection.find.mockReturnValue(mockFindCursor);
  });

  describe('createChatMessage', () => {
    // 成功建立聊天訊息並返回結果
    it('should successfully create chat message and return result', async () => {
      const mockChatMessage = {
        content: 'Hello world',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '507f1f77bcf86cd799439022',
        user_id: '507f1f77bcf86cd799439011',
      };

      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await chatMessageModel.createChatMessage(mockChatMessage);

      expect(result).toEqual(mockInsertResult);
      expect(db.collection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatMessage);
    });

    // 驗證失敗時返回 null
    it('should return null when validation fails', async () => {
      // 使用無效的聊天訊息數據進行測試
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // 模擬 CreateChatMessageSchema.parse 驗證失敗
      const invalidData = {
        content: '',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '',
        user_id: ''
      };

      // 模擬驗證失敗
      vi.spyOn(CreateChatMessageSchema, 'parse').mockImplementationOnce(() => {
        throw new Error('Validation Error');
      });

      const result = await chatMessageModel.createChatMessage(invalidData);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    // 資料庫操作失敗時返回 null
    it('should return null when database operation fails', async () => {
      const mockChatMessage = {
        content: 'Hello world',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '507f1f77bcf86cd799439022',
        user_id: '507f1f77bcf86cd799439011',
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatMessageModel.createChatMessage(mockChatMessage);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatMessage);
    });
  });

  describe('findChatMessageById', () => {
    // 成功查詢聊天訊息並返回結果
    it('should successfully find chat message and return result', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      const mockChatMessage = {
        _id: new ObjectId(mockMessageId),
        content: 'Hello world',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '507f1f77bcf86cd799439022',
        user_id: '507f1f77bcf86cd799439011',
      };

      mockCollection.findOne.mockResolvedValue(mockChatMessage);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toEqual(mockChatMessage);
      expect(db.collection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    // 聊天訊息不存在時返回 null
    it('should return null when chat message does not exist', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';

      mockCollection.findOne.mockResolvedValue(null);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
      expect(consoleSpy).toHaveBeenCalled();
    });

    // 資料庫操作失敗時返回 null
    it('should return null when database operation fails', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';

      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('findChatMessagesByRoomId', () => {
    // 成功查詢聊天室訊息並返回結果
    it('should successfully find chat messages by room id and return results', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatMessages = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439033'),
          content: 'Hello world',
          created_at: new Date(),
          device: 'APP' as Device,
          room_id: mockRoomId,
          user_id: '507f1f77bcf86cd799439011',
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439034'),
          content: 'How are you?',
          created_at: new Date(),
          device: 'PC' as Device,
          room_id: mockRoomId,
          user_id: '507f1f77bcf86cd799439012',
        },
      ];

      mockFindCursor.toArray.mockResolvedValue(mockChatMessages);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

      const result = await chatMessageModel.findChatMessagesByRoomId(mockRoomId);

      expect(result).toEqual(mockChatMessages);
      expect(db.collection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.find).toHaveBeenCalledWith({ room_id: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });

    // 資料庫操作失敗時返回 null
    it('should return null when database operation fails', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatMessageModel.findChatMessagesByRoomId(mockRoomId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
