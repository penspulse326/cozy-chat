import type { Device } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCollection } from '@/config/db';
import chatMessageModel from '@/models/chat-message.model';

vi.mock('@/config/db', () => ({
  getCollection: vi.fn(),
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
    vi.mocked(getCollection).mockReturnValue(
      mockCollection as unknown as ReturnType<typeof getCollection>
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
        createdAt: new Date(),
        device: 'APP' as Device,
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockObjectId = new ObjectId();
      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockObjectId,
      };

      // 模擬插入成功並返回的 ID
      mockCollection.insertOne.mockImplementation(() => {
        return mockInsertResult;
      });

      const actual = await chatMessageModel.createChatMessage(mockChatMessage);

      expect(actual).toEqual(
        expect.objectContaining({
          content: mockChatMessage.content,
          device: mockChatMessage.device,
          roomId: mockChatMessage.roomId,
          userId: mockChatMessage.userId,
        })
      );
      expect(actual).not.toBeNull(); // 確保 actual 不為 null
      expect((actual as any).id).toBeTruthy(); // 只檢查 ID 存在
      expect(getCollection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining(mockChatMessage)
      );
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidChatMessage = {
        content: 123 as unknown as string,
        createdAt: new Date(),
        device: 'INVALID_DEVICE' as Device,
        roomId: '',
        userId: '',
      };

      const actual = await chatMessageModel.createChatMessage(
        mockInvalidChatMessage
      );

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockChatMessage = {
        content: 'Hello world',
        createdAt: new Date(),
        device: 'APP' as Device,
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      const actual = await chatMessageModel.createChatMessage(mockChatMessage);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining(mockChatMessage)
      );
    });
  });

  describe('findChatMessageById', () => {
    it('應該成功找到聊天訊息並返回結果', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      const mockObjectId = new ObjectId(mockMessageId);
      const mockChatMessage = {
        _id: mockObjectId,
        content: 'Hello world',
        createdAt: new Date(),
        device: 'APP' as Device,
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };
      mockCollection.findOne.mockResolvedValue(mockChatMessage);

      const actual = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(actual).toEqual({
        content: mockChatMessage.content,
        createdAt: mockChatMessage.createdAt,
        device: mockChatMessage.device,
        id: mockMessageId,
        roomId: mockChatMessage.roomId,
        userId: mockChatMessage.userId,
      });
      expect(getCollection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當聊天訊息不存在時應返回 null', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      mockCollection.findOne.mockResolvedValue(null);

      const actual = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(actual).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const actual = await chatMessageModel.findChatMessageById(mockMessageId);

      expect(actual).toBeNull();
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
          createdAt: new Date(),
          device: 'APP' as Device,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439011',
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439034'),
          content: 'How are you?',
          createdAt: new Date(),
          device: 'PC' as Device,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439012',
        },
      ];
      mockFindCursor.toArray.mockResolvedValue(mockChatMessages);

      const actual =
        await chatMessageModel.findChatMessagesByRoomIds(mockRoomId);

      expect(actual).toEqual(
        mockChatMessages.map((message) => ({
          content: message.content,
          createdAt: message.createdAt,
          device: message.device,
          id: message._id.toString(),
          roomId: message.roomId,
          userId: message.userId,
        }))
      );
      expect(getCollection).toHaveBeenCalledWith('chat_messages');
      expect(mockCollection.find).toHaveBeenCalledWith({ roomId: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));

      const actual =
        await chatMessageModel.findChatMessagesByRoomIds(mockRoomId);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
