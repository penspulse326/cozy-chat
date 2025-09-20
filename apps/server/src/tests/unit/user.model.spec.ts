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
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateMany: vi.fn(),
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
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
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

      expect(result!).toEqual(expect.objectContaining({
        createdAt: expect.any(Date),
        device: mockUser.device,
        lastActiveAt: expect.any(Date),
        status: mockUser.status
      }));
      expect(result.id).toBeTruthy(); // 只檢查 ID 存在
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockUser));
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidUser = {
        createdAt: new Date(),
        device: 'INVALID_DEVICE' as unknown as Device,
        lastActiveAt: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      const result = await userModel.createUser(mockInvalidUser);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUser = {
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
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
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
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
          createdAt: new Date(),
          device: 'APP' as Device,
          lastActiveAt: new Date(),
          roomId: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          createdAt: new Date(),
          device: 'PC' as Device,
          lastActiveAt: new Date(),
          roomId: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
      ];

      mockFindCursor.toArray.mockResolvedValue(mockUsers);

      const result = await userModel.findUsersByRoomId(mockRoomId);

      expect(result).toEqual(mockUsers?.map(user => ({
        ...user,
        id: user._id.toString(),
      })));
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.find).toHaveBeenCalledWith({ roomId: mockRoomId });
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
    it('應該成功更新多個使用者的房間 ID 並返回更新後的使用者', async () => {
      const mockUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdateResult = {
        acknowledged: true,
        modifiedCount: 2,
      };
      const mockUpdatedUsers = [
        {
          _id: new ObjectId(mockUserIds[0]),
          createdAt: new Date(),
          device: 'APP' as Device,
          lastActiveAt: new Date(),
          roomId: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
        {
          _id: new ObjectId(mockUserIds[1]),
          createdAt: new Date(),
          device: 'PC' as Device,
          lastActiveAt: new Date(),
          roomId: mockRoomId,
          status: 'ACTIVE' as UserStatus,
        },
      ];

      mockCollection.updateMany.mockResolvedValue(mockUpdateResult);
      mockCollection.find.mockReturnValue({
        toArray: vi.fn().mockResolvedValue(mockUpdatedUsers),
      });

      const result = await userModel.updateManyUserRoomId(
        mockUserIds,
        mockRoomId
      );

      expect(result).toEqual(mockUpdatedUsers.map(user => ({
        ...user,
        id: user._id.toString(),
      })));
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateMany).toHaveBeenCalledWith(
        { _id: { $in: expect.any(Array) } },
        { $set: { roomId: mockRoomId } }
      );
      expect(mockCollection.find).toHaveBeenCalledWith(
        { _id: { $in: expect.any(Array) } }
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
    it('應該成功更新使用者的房間 ID 並返回更新後的使用者', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdatedUser = {
        _id: new ObjectId(mockUserId),
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
        roomId: mockRoomId,
        status: 'ACTIVE' as UserStatus,
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toEqual({
        ...mockUpdatedUser,
        id: mockUpdatedUser._id.toString(),
      });
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { roomId: mockRoomId } },
        { returnDocument: 'after' }
      );
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('應該成功更新使用者狀態並返回更新後的使用者', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;
      const mockUpdatedUser = {
        _id: new ObjectId(mockUserId),
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
        status: mockStatus,
      };

      mockCollection.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toEqual({
        ...mockUpdatedUser,
        id: mockUpdatedUser._id.toString(),
      });
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { status: mockStatus } },
        { returnDocument: 'after' }
      );
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;

      mockCollection.findOneAndUpdate.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
