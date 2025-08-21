import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/config/db';
import chatRoomModel from '@/models/chat-room.model';

vi.mock('@/config/db', () => ({
  db: {
    collection: vi.fn(),
  },
}));

describe('Chat Room Model', () => {
  const mockCollection = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
  };

  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.collection).mockReturnValue(
      mockCollection as unknown as ReturnType<typeof db.collection>
    );

    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createChatRoom', () => {
    it('應該成功建立聊天室並返回結果', async () => {
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(result).toEqual(mockInsertResult);
      expect(db.collection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidChatRoom = {
        created_at: new Date(),
        users: 'not-an-array' as unknown as string[],
      };

      const result = await chatRoomModel.createChatRoom(mockInvalidChatRoom);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });
  });

  describe('findChatRoomById', () => {
    it('應該成功找到聊天室並返回結果', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatRoom = {
        _id: new ObjectId(mockRoomId),
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };
      mockCollection.findOne.mockResolvedValue(mockChatRoom);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toEqual(mockChatRoom);
      expect(db.collection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當聊天室不存在時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
