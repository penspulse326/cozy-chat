import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCollection } from '@/config/db';
import chatRoomModel from '@/models/chat-room.model';

const mockFindCursor = {
  toArray: vi.fn(),
};

vi.mock('@/config/db', () => ({
  getCollection: vi.fn(),
}));

describe('Chat Room Model', () => {
  const mockCollection = {
    deleteOne: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
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

  describe('createChatRoom', () => {
    it('應該成功建立聊天室並返回結果', async () => {
      const mockChatRoom = {
        createdAt: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      const mockObjectId = new ObjectId();
      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockObjectId,
      };

      mockCollection.insertOne.mockImplementation(() => {
        return mockInsertResult;
      });

      const actual = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(actual).toEqual(
        expect.objectContaining({
          createdAt: expect.any(Date),
          users: mockChatRoom.users,
        })
      );
      if (actual) {
        expect(actual.id).toBeTruthy(); // 只檢查 ID 存在
      }
      expect(getCollection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining(mockChatRoom)
      );
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidChatRoom = {
        createdAt: new Date(),
        users: 'not-an-array' as unknown as string[],
      };

      const actual = await chatRoomModel.createChatRoom(mockInvalidChatRoom);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockChatRoom = {
        createdAt: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      const actual = await chatRoomModel.createChatRoom(mockChatRoom);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining(mockChatRoom)
      );
    });
  });

  describe('findAllChatRooms', () => {
    it('應該成功找到所有聊天室並返回結果', async () => {
      const mockChatRooms = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          createdAt: new Date(),
          users: ['507f1f77bcf86cd799439001', '507f1f77bcf86cd799439002'],
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          createdAt: new Date(),
          users: ['507f1f77bcf86cd799439003'],
        },
      ];

      mockFindCursor.toArray.mockResolvedValue(mockChatRooms);

      const actual = await chatRoomModel.findAllChatRooms();

      expect(actual).toEqual(
        mockChatRooms.map((room) => ({
          createdAt: room.createdAt,
          id: room._id.toString(),
          users: room.users,
        }))
      );
      expect(getCollection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.find).toHaveBeenCalledWith({});
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      mockCollection.find.mockImplementation(() => {
        throw new Error('DB Error');
      });

      const actual = await chatRoomModel.findAllChatRooms();

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('findChatRoomById', () => {
    it('應該成功找到聊天室並返回結果', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockObjectId = new ObjectId(mockRoomId);
      const mockChatRoom = {
        _id: mockObjectId,
        createdAt: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };
      mockCollection.findOne.mockResolvedValue(mockChatRoom);

      const actual = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(actual).toEqual({
        createdAt: mockChatRoom.createdAt,
        id: mockRoomId,
        users: mockChatRoom.users,
      });
      expect(getCollection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當聊天室不存在時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockResolvedValue(null);

      const actual = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(actual).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const actual = await chatRoomModel.findChatRoomById(mockRoomId);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('removeUserFromChatRoom', () => {
    it('應該成功從聊天室移除使用者並返回更新後的聊天室', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockUpdatedChatRoom = {
        _id: new ObjectId(mockRoomId),
        createdAt: new Date(),
        users: ['507f1f77bcf86cd799439012'], // 已移除 mockUserId
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedChatRoom);

      const actual = await chatRoomModel.removeUserFromChatRoom(
        mockRoomId,
        mockUserId
      );

      expect(actual).toEqual({
        createdAt: mockUpdatedChatRoom.createdAt,
        id: mockRoomId,
        users: mockUpdatedChatRoom.users,
      });
      expect(getCollection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $pull: { users: mockUserId } },
        { returnDocument: 'after' }
      );
    });

    it('當聊天室不存在時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOneAndUpdate.mockResolvedValue(null);

      const actual = await chatRoomModel.removeUserFromChatRoom(
        mockRoomId,
        mockUserId
      );

      expect(actual).toBeNull();
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $pull: { users: mockUserId } },
        { returnDocument: 'after' }
      );
    });

    it('當資料庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('DB Error'));

      const actual = await chatRoomModel.removeUserFromChatRoom(
        mockRoomId,
        mockUserId
      );

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('deleteChatRoom', () => {
    it('應該成功刪除聊天室', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockDeleteResult = {
        acknowledged: true,
        deletedCount: 1,
      };

      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);

      const actual = await chatRoomModel.deleteChatRoom(mockRoomId);

      expect(actual).toBe(true);
      expect(getCollection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當聊天室不存在時應返回 true', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockDeleteResult = {
        acknowledged: true,
        deletedCount: 0,
      };

      mockCollection.deleteOne.mockResolvedValue(mockDeleteResult);

      const actual = await chatRoomModel.deleteChatRoom(mockRoomId);

      expect(actual).toBe(true);
      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當資料庫操作失敗時應返回 false', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.deleteOne.mockRejectedValue(new Error('DB Error'));

      const actual = await chatRoomModel.deleteChatRoom(mockRoomId);

      expect(actual).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
