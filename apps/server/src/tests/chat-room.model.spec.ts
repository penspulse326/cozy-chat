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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.collection).mockReturnValue(
      mockCollection as unknown as ReturnType<typeof db.collection>
    );
  });

  describe('createChatRoom', () => {
    it('should successfully create chat room and return result', async () => {
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

    it('should return null when validation fails', async () => {
      // 使用一個明顯無效的數據，這樣實際的 zod 驗證會失敗
      const mockInvalidChatRoom = {
        created_at: new Date(),
        users: 'not-an-array' as unknown as string[], // 應該是陣列，但這裡給一個字串
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const result = await chatRoomModel.createChatRoom(mockInvalidChatRoom);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should return null when database operation fails', async () => {
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });
  });

  describe('findChatRoomById', () => {
    it('should successfully find chat room and return result', async () => {
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

    it('should return null when chat room does not exist', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockResolvedValue(null);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when database operation fails', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
