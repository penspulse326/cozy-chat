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

describe('User Model', () => {
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
    it('should successfully create user and return result', async () => {
      const mockUser = {
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      const result = await userModel.createUser(mockUser);

      expect(result).toEqual(mockInsertResult);
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockUser);
    });

    it('should return null when validation fails', async () => {
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

    it('should return null when database operation fails', async () => {
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
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findUserById', () => {
    it('should successfully find user and return result', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      mockCollection.findOne.mockResolvedValue(mockUser);

      const result = await userModel.findUserById(mockUserId);

      expect(result).toEqual(mockUser);
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when user does not exist', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockResolvedValue(null);

      const result = await userModel.findUserById(mockUserId);

      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when database operation fails', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.findUserById(mockUserId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('findUsersByRoomId', () => {
    it('should successfully find users in room and return results', async () => {
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

      expect(result).toEqual(mockUsers);
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.find).toHaveBeenCalledWith({ room_id: mockRoomId });
      expect(mockFindCursor.toArray).toHaveBeenCalled();
    });

    it('should return null when database operation fails', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockFindCursor.toArray.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.findUsersByRoomId(mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateManyUserRoomId', () => {
    it('should successfully update multiple users room IDs and return result', async () => {
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

    it('should return null when database operation fails', async () => {
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
    it('should successfully update user room ID and return result', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toEqual(mockUpdateResult);
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { room_id: mockRoomId } }
      );
    });

    it('should return null when database operation fails', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';

      mockCollection.updateOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserRoomId(mockUserId, mockRoomId);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('updateUserStatus', () => {
    it('should successfully update user status and return result', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      mockCollection.updateOne.mockResolvedValue(mockUpdateResult);

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toEqual(mockUpdateResult);
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(ObjectId) },
        { $set: { status: mockStatus } }
      );
    });

    it('should return null when database operation fails', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as UserStatus;

      mockCollection.updateOne.mockRejectedValue(new Error('DB Error'));

      const result = await userModel.updateUserStatus(mockUserId, mockStatus);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
