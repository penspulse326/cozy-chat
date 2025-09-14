import type { Device } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/config/db';
import chatMessageModel from '@/models/chat-message.model';

vi.mock('@/config/db', () => ({
  db: {
    collection: vi.fn(),
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

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.collection).mockReturnValue(
      mockCollection as unknown as ReturnType<typeof db.collection>
    );
    mockCollection.find.mockReturnValue(mockFindCursor);

    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChatMessage', () => {
    it('應該成功建立聊天訊息並返回結果', async () => {
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
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockChatMessage));
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidChatMessage = {
        content: 123 as unknown as string,
        created_at: new Date(),
        device: 'INVALID_DEVICE' as Device,
        room_id: '',
        user_id: '',
      };

      const result = await chatMessageModel.createChatMessage(
        mockInvalidChatMessage
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockChatMessage = {
        content: 'Hello world',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '507f1f77bcf86cd799439022',
        user_id: '507f1f77bcf86cd799439011',
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      const result = await chatMessageModel.createChatMessage(mockChatMessage);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockChatMessage));
    });
  });

  describe('findChatMessageById', () => {
    it('應該成功找到聊天訊息並返回結果', async () => {
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

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toEqual(mockChatMessage);
      expect(db.collection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當聊天訊息不存在時應返回 null', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const result = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('findChatMessagesByRoomId', () => {
    it('應該成功通過房間 ID 找到聊天訊息並返回結果', async () => {
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

      const result =
        await chatMessageModel.findChatMessagesByRoomId(mockRoomId);

      expect(result).toEqual(mockChatMessages);
      expect(db.collection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.find).toHaveBeenCalledWith({ room_id: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));

      const result =
        await chatMessageModel.findChatMessagesByRoomId(mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
