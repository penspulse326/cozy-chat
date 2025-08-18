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
    vi.mocked(db.collection).mockReturnValue(mockCollection as unknown as ReturnType<typeof db.collection>);
  });

  describe('createChatRoom', () => {
    // 成功建立聊天室並返回結果
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

    // 驗證失敗時返回 null
    it('should return null when validation fails', async () => {
      // 使用無效的聊天室數據進行測試
      const mockInvalidChatRoom = {
        created_at: new Date(),
        // 缺少必要的 users 欄位
      };

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatRoomModel.createChatRoom(mockInvalidChatRoom as any);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    // 資料庫操作失敗時返回 null
    it('should return null when database operation fails', async () => {
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });
  });

  describe('findChatRoomById', () => {
    // 成功查詢聊天室並返回結果
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

    // 聊天室不存在時返回 null
    it('should return null when chat room does not exist', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.findOne.mockResolvedValue(null);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    // 資料庫操作失敗時返回 null
    it('should return null when database operation fails', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
