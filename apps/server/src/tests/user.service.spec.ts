import type { Device, UserStatus } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import userModel from '@/models/user.model';
import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';

vi.mock('@/models/user.model', () => ({
  default: {
    createUser: vi.fn(),
    findUserById: vi.fn(),
    findUsersByRoomId: vi.fn(),
    updateManyUserRoomId: vi.fn(),
    updateUserRoomId: vi.fn(),
    updateUserStatus: vi.fn(),
  },
}));

vi.mock('@/services/chat-room.service.ts', () => ({
  default: {
    createChatRoom: vi.fn(),
  },
}));

describe('User Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create user with correct payload', async () => {
      // Arrange
      const mockWaitingUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };
      vi.mocked(userModel.createUser).mockResolvedValue(mockInsertResult);

      // Act
      const result = await userService.createUser(mockWaitingUser);

      // Assert
      expect(result).toBe(mockInsertResult);
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(userModel.createUser).mock.calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          created_at: expect.any(Date),
          device: 'APP',
          last_active_at: expect.any(Date),
          status: 'ACTIVE',
        })
      );
    });

    it('should return null when model throws error', async () => {
      // Arrange
      const mockWaitingUser = {
        device: 'MB' as Device, // 故意使用無效值
        socketId: 'socket123',
      };
      vi.mocked(userModel.createUser).mockResolvedValue(null);

      // Act
      const result = await userService.createUser(mockWaitingUser);

      // Assert
      expect(result).toBeNull();
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });

    it('should throw error if model throws error', async () => {
      // Arrange
      const mockWaitingUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      vi.mocked(userModel.createUser).mockRejectedValue(
        new Error('Create user failed')
      );

      // Act & Assert
      await expect(userService.createUser(mockWaitingUser)).rejects.toThrow(
        'Create user failed'
      );
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserById', () => {
    it('should return user when found', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        room_id: '507f1f77bcf86cd799439022',
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);

      const result = await userService.findUserById(mockUserId);
      expect(result).toBe(mockUser);
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should return null when user not found', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      vi.mocked(userModel.findUserById).mockResolvedValue(null);

      const result = await userService.findUserById(mockUserId);
      expect(result).toBeNull();
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUsersByRoomId', () => {
    it('should return users when found', async () => {
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

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.findUsersByRoomId(mockRoomId);
      expect(result).toBe(mockUsers);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('should return null when users not found', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(null);

      const result = await userService.findUsersByRoomId(mockRoomId);
      expect(result).toBeNull();
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserRoomId', () => {
    it('should update user room id successfully', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      vi.mocked(userModel.updateUserRoomId).mockResolvedValue(mockUpdateResult);

      const result = await userService.updateUserRoomId(mockUserId, mockRoomId);
      expect(result).toBe(mockUpdateResult);
      expect(userModel.updateUserRoomId).toHaveBeenCalledWith(mockUserId, mockRoomId);
      expect(userModel.updateUserRoomId).toHaveBeenCalledTimes(1);
    });

    it('should return null when update fails', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.updateUserRoomId).mockResolvedValue(null);

      const result = await userService.updateUserRoomId(mockUserId, mockRoomId);
      expect(result).toBeNull();
      expect(userModel.updateUserRoomId).toHaveBeenCalledWith(mockUserId, mockRoomId);
      expect(userModel.updateUserRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status and return roomId when user exists', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockStatus = 'LEFT' as const;
      const mockUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        room_id: mockRoomId,
        status: 'ACTIVE' as UserStatus,
      };
      const mockUpdateResult = {
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(userModel.updateUserStatus).mockResolvedValue(mockUpdateResult);

      const result = await userService.updateUserStatus(mockUserId, mockStatus);
      expect(result).toEqual({ roomId: mockRoomId });
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.updateUserStatus).toHaveBeenCalledWith(mockUserId, mockStatus);
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
      expect(userModel.updateUserStatus).toHaveBeenCalledTimes(1);
    });

    it('should return null when user does not exist', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as const;

      vi.mocked(userModel.findUserById).mockResolvedValue(null);

      const result = await userService.updateUserStatus(mockUserId, mockStatus);
      expect(result).toBeNull();
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.updateUserStatus).not.toHaveBeenCalled();
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });

    it('should return null when user has no room_id', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as const;
      const mockUser = {
        _id: new ObjectId(mockUserId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);

      const result = await userService.updateUserStatus(mockUserId, mockStatus);
      expect(result).toBeNull();
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.updateUserStatus).not.toHaveBeenCalled();
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkUserStatus', () => {
    it('should return true when at least one user has LEFT status', async () => {
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
          status: 'LEFT' as UserStatus,
        },
      ];

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(true);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('should return false when no user has LEFT status', async () => {
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

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(false);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('should return false when users not found', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(null);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(false);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('createMatchedUsers', () => {
    it('should create matched users and return users with roomId', async () => {
      const mockNewUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUser = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      const mockNewUserId = new ObjectId('507f1f77bcf86cd799439011');
      const mockPeerUserId = new ObjectId('507f1f77bcf86cd799439012');
      const mockRoomId = new ObjectId('507f1f77bcf86cd799439022');

      const mockNewUserResult = {
        acknowledged: true,
        insertedId: mockNewUserId,
      };

      const mockPeerUserResult = {
        acknowledged: true,
        insertedId: mockPeerUserId,
      };

      const mockChatRoomResult = {
        acknowledged: true,
        insertedId: mockRoomId,
      };

      const mockUpdateManyResult = {
        acknowledged: true,
        modifiedCount: 2,
      };

      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser)
        .mockResolvedValueOnce(mockNewUserResult)
        .mockResolvedValueOnce(mockPeerUserResult);

      vi.mocked(chatRoomService.createChatRoom).mockResolvedValue(mockChatRoomResult);
      vi.mocked(userModel.updateManyUserRoomId).mockResolvedValue(mockUpdateManyResult);

      const result = await userService.createMatchedUsers(mockNewUser, mockPeerUser);

      expect(result).toEqual({
        matchedUsers: [
          {
            ...mockNewUser,
            userId: mockNewUserId.toString(),
          },
          {
            ...mockPeerUser,
            userId: mockPeerUserId.toString(),
          },
        ],
        roomId: mockRoomId.toString(),
      });

      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).toHaveBeenCalledWith([
        mockNewUserId.toString(),
        mockPeerUserId.toString(),
      ]);
      expect(userModel.updateManyUserRoomId).toHaveBeenCalledWith(
        [mockNewUserId.toString(), mockPeerUserId.toString()],
        mockRoomId.toString()
      );
      expect(userModel.updateManyUserRoomId).toHaveBeenCalledTimes(1);
    });

    it('should return null when first createUser fails', async () => {
      const mockNewUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUser = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      // 重置 mock 以確保之前的測試不會影響這個測試
      vi.mocked(userModel.createUser).mockReset();
      // 設置第一次調用返回 null
      vi.mocked(userModel.createUser).mockResolvedValueOnce(null);

      const result = await userService.createMatchedUsers(mockNewUser, mockPeerUser);

      expect(result).toBeNull();
      // 即使第一次調用返回 null，createMatchedUsers 仍然會嘗試調用第二次 createUser
      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).not.toHaveBeenCalled();
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });

    it('should return null when second createUser fails', async () => {
      const mockNewUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUser = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      const mockNewUserId = new ObjectId('507f1f77bcf86cd799439011');

      const mockNewUserResult = {
        acknowledged: true,
        insertedId: mockNewUserId,
      };

      // 重置 mock 以確保之前的測試不會影響這個測試
      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser)
        .mockResolvedValueOnce(mockNewUserResult)
        .mockResolvedValueOnce(null);

      const result = await userService.createMatchedUsers(mockNewUser, mockPeerUser);

      expect(result).toBeNull();
      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).not.toHaveBeenCalled();
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });

    it('should return null when createChatRoom fails', async () => {
      const mockNewUser = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUser = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      const mockNewUserId = new ObjectId('507f1f77bcf86cd799439011');
      const mockPeerUserId = new ObjectId('507f1f77bcf86cd799439012');

      const mockNewUserResult = {
        acknowledged: true,
        insertedId: mockNewUserId,
      };

      const mockPeerUserResult = {
        acknowledged: true,
        insertedId: mockPeerUserId,
      };

      // 重置 mock 以確保之前的測試不會影響這個測試
      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser)
        .mockResolvedValueOnce(mockNewUserResult)
        .mockResolvedValueOnce(mockPeerUserResult);

      vi.mocked(chatRoomService.createChatRoom).mockResolvedValue(null);

      const result = await userService.createMatchedUsers(mockNewUser, mockPeerUser);

      expect(result).toBeNull();
      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).toHaveBeenCalledTimes(1);
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });
  });
});