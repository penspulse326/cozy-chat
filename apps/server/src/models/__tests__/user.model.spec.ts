import type { Device, UserStatus } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCollection } from '@/config/db';
import userModel from '@/models/user.model';

vi.mock('@/config/db', () => ({
  getCollection: vi.fn(),
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

      mockCollection.insertOne.mockImplementation(() => {
        return mockInsertResult;
      });

      const actual = await userModel.createUser(mockUser);

      expect(actual).toEqual(expect.objectContaining({
        createdAt: expect.any(Date),
        device: mockUser.device,
        lastActiveAt: expect.any(Date),
        status: mockUser.status
      }));
      expect(actual?.id).toBeTruthy(); // 只檢查 ID 存在
      expect(getCollection).toHaveBeenCalledWith('users');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining(mockUser));
    });

    it('當驗證失敗時應返回 null', async () => {
      const mockInvalidUser = {
        createdAt: new Date(),
        device: 'INVALID_DEVICE' as unknown as Device,
        lastActiveAt: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      const actual = await userModel.createUser(mockInvalidUser);

      expect(actual).toBeNull();
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

      const actual = await userModel.createUser(mockUser);

      expect(actual).toBeNull();
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

      const actual = await userModel.findUserById(mockUserId);

      expect(actual).toEqual({
        createdAt: mockUser.createdAt,
        device: mockUser.device,
        id: mockUserId,
        lastActiveAt: mockUser.lastActiveAt,
        status: mockUser.status,
      });
      expect(getCollection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當使用者不存在時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockResolvedValue(null);

      const actual = await userModel.findUserById(mockUserId);

      expect(actual).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const actual = await userModel.findUserById(mockUserId);

      expect(actual).toBeNull();
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

      const actual = await userModel.findUsersByRoomId(mockRoomId);

      expect(actual).toEqual(mockUsers.map(user => ({
        createdAt: user.createdAt,
        device: user.device,
        id: user._id.toString(),
        lastActiveAt: user.lastActiveAt,
        roomId: user.roomId,
        status: user.status,
      })));
      expect(getCollection).toHaveBeenCalledWith('users');
      expect(mockCollection.find).toHaveBeenCalledWith({ roomId: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('當數據庫操作失敗時應返回 null', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));

      const actual = await userModel.findUsersByRoomId(mockRoomId);

      expect(actual).toBeNull();
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

      const actual = await userModel.updateManyUserRoomId(
        mockUserIds,
        mockRoomId
      );

      expect(actual).toEqual(mockUpdatedUsers.map(user => ({
        createdAt: user.createdAt,
        device: user.device,
        id: user._id.toString(),
        lastActiveAt: user.lastActiveAt,
        roomId: user.roomId,
        status: user.status,
      })));
      expect(getCollection).toHaveBeenCalledWith('users');
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

      const actual = await userModel.updateManyUserRoomId(
        mockUserIds,
        mockRoomId
      );

      expect(actual).toBeNull();
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

      const actual = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(actual).toEqual({
        createdAt: mockUpdatedUser.createdAt,
        device: mockUpdatedUser.device,
        id: mockUpdatedUser._id.toString(),
        lastActiveAt: mockUpdatedUser.lastActiveAt,
        roomId: mockUpdatedUser.roomId,
        status: mockUpdatedUser.status,
      });
      expect(getCollection).toHaveBeenCalledWith('users');
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

      const actual = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(actual).toBeNull();
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

      const actual = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(actual).toEqual({
        createdAt: mockUpdatedUser.createdAt,
        device: mockUpdatedUser.device,
        id: mockUpdatedUser._id.toString(),
        lastActiveAt: mockUpdatedUser.lastActiveAt,
        status: mockUpdatedUser.status,
      });
      expect(getCollection).toHaveBeenCalledWith('users');
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

      const actual = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(actual).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
