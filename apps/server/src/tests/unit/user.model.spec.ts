import type { Device, UserStatus } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/config/db';
import userModel from '@/models/user.model';

vi.mock('@/config/db', () => ({
  db: {
    collection: vi.fn(),
  },
}));

describe('UserDto Model', () => {
  const mockCollection = {
    find: vi.fn(),
    findOne: vi.fn(),
    insertOne: vi.fn(),
    updateMany: vi.fn(),
    updateOne: vi.fn(),
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

  describe('createUser', () => {
    it('應該成功建立使用者並返回結果', async () => {
      const mockUser = {
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      const mockObjectId = new ObjectId();
      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockObjectId,
      };

      mockCollection.insertOne.mockImplementation(async () => {
        return mockInsertResult;
      });

      const result = await userModel.createUser(mockUser);

      expect(result).toEqual(expect.objectContaining({
        created_at: expect.any(Date),
        device: mockUser.device,
        last_active_at: expect.any(Date),
        status: mockUser.status
      }));
      expect(result.id).toBeTruthy(); // 只檢查 ID 存在
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockUser));
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidUser = {
        created_at: new Date(),
        device: 'INVALID_DEVICE' as unknown as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      const result = await userModel.createUser(mockInvalidUser);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUser = {
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.createUser(mockUser);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockUser));
    });
  });

  describe('findUserById', () => {
    it('應該成功找到使用者並返回結果', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockObjectId = new ObjectId(mockUserId);
      const mockUser = {
        _id: mockObjectId,
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await userModel.findUserById(mockUserId);

      expect(result).toEqual({
        ...mockUser,
        id: mockUserId,
      });
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當使用者不存在時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockResolvedValue(null);

      const result = await userModel.findUserById(mockUserId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.findUserById(mockUserId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('findUsersByRoomId', () => {
    it('應該成功找到房間內的使用者並返回結果', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUsers = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          created_at: new Date(),
          device: 'APP' as Device,
          last_active_at: new Date(),
          room_id: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          created_at: new Date(),
          device: 'PC' as Device,
          last_active_at: new Date(),
          room_id: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
      ];

      mockFindCursor.toArray.mockResolvedValue(mockUsers);

      const result = await userModel.findUsersByRoomId(mockRoomId);

      expect(result).toEqual(mockUsers.map(user => ({
        ...user,
        id: user._id.toString(),
      })));
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.find).toHaveBeenCalledWith({ room_id: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.findUsersByRoomId(mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateManyUserRoomId', () => {
    it('應該成功更新多個使用者的房間 ID 並返回結果', async () => {
      const mockUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdateResult = {
        acknowledged: true,
        modifiedCount: 2,
      };

      mockCollection.updateMany.mockResolvedValue(mockUpdateResult);

      const result = await userModel.updateManyUserRoomId(
        mockUserIds,
        mockRoomId
      );

      expect(result).toEqual({
        acknowledged: mockUpdateResult.acknowledged,
        modifiedCount: mockUpdateResult.modifiedCount,
      });
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.any(Array) } },
        { $set: { room_id: mockRoomId } }
      );
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.updateMany.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateManyUserRoomId(
        mockUserIds,
        mockRoomId
      );

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateUserRoomId', () => {
    it('應該成功更新使用者的房間 ID 並返回結果', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      const mockUpdatedUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        id: mockUserId,
        last_active_at: new Date(),
        room_id: mockRoomId,
        status: 'ACTIVE' as UserStatus,
      };

      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);

      // 首先模擬 findOne 返回更新後的用戶
      mockCollection.findOne.mockResolvedValueOnce(mockUpdatedUser);

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toEqual(expect.objectContaining({
        device: 'APP',
        room_id: mockRoomId,
        status: 'ACTIVE'
      }));
      expect(result.id).toBeTruthy();
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { room_id: mockRoomId } }
      );
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.updateOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('應該成功更新使用者狀態並返回結果', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      const mockUpdatedUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        id: mockUserId,
        last_active_at: new Date(),
        status: mockStatus,
      };

      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);

      // 模擬 findOne 返回更新後的用戶
      mockCollection.findOne.mockResolvedValueOnce(mockUpdatedUser);

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toEqual(expect.objectContaining({
        device: 'APP',
        status: mockStatus
      }));
      expect(result.id).toBeTruthy();
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { status: mockStatus } }
      );
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;

      mockCollection.updateOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
