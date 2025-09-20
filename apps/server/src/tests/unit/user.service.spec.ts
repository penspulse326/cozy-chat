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

vi.mock('@/services/chat-room.service', () => ({
  default: {
    createChatRoom: vi.fn(),
  },
}));

describe('UserDto Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('應該使用正確的載荷建立使用者', async () => {
      const mockUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };
      vi.mocked(userModel.createUser).mockResolvedValue(mockInsertResult);

      const result = await userService.createUser(mockUserData);

      expect(result).toBe(mockInsertResult);
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(userModel.createUser).mock.calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          createdAt: expect.any(Date),
          device: 'APP',
          lastActiveAt: expect.any(Date),
          status: 'ACTIVE',
        })
      );
    });

    it('當模型返回 null 時應拋出錯誤', async () => {
      const mockUserData = {
        device: 'PS5' as Device,
        socketId: 'socket123',
      };
      vi.mocked(userModel.createUser).mockResolvedValue(null);

      await expect(userService.createUser(mockUserData)).rejects.toThrow(
        '建立使用者失敗'
      );
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      vi.mocked(userModel.createUser).mockRejectedValue(
        new Error('Create user failed')
      );

      await expect(userService.createUser(mockUserData)).rejects.toThrow(
        'Create user failed'
      );
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUserById', () => {
    it('當找到使用者時應返回使用者', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockUser = {
        _id: new ObjectId(mockUserId),
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
        roomId: '507f1f77bcf86cd799439022',
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);

      const result = await userService.findUserById(mockUserId);
      expect(result).toBe(mockUser);
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });

    it('當找不到使用者時應拋出錯誤', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';

      vi.mocked(userModel.findUserById).mockResolvedValue(null);

      await expect(userService.findUserById(mockUserId)).rejects.toThrow(
        `找不到使用者: ${mockUserId}`
      );
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('findUsersByRoomId', () => {
    it('當找到使用者時應返回使用者', async () => {
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

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.findUsersByRoomId(mockRoomId);
      expect(result).toBe(mockUsers);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('當找不到使用者時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(null);

      await expect(userService.findUsersByRoomId(mockRoomId)).rejects.toThrow(
        `找不到聊天室的使用者: ${mockRoomId}`
      );
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserRoomId', () => {
    it('應該成功更新使用者房間 ID', async () => {
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
      expect(userModel.updateUserRoomId).toHaveBeenCalledWith(
        mockUserId,
        mockRoomId
      );
      expect(userModel.updateUserRoomId).toHaveBeenCalledTimes(1);
    });

    it('當更新失敗時應拋出錯誤', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.updateUserRoomId).mockResolvedValue(null);

      await expect(
        userService.updateUserRoomId(mockUserId, mockRoomId)
      ).rejects.toThrow(`更新使用者聊天室失敗: ${mockUserId}`);
      expect(userModel.updateUserRoomId).toHaveBeenCalledWith(
        mockUserId,
        mockRoomId
      );
      expect(userModel.updateUserRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUserStatus', () => {
    it('當使用者存在時應更新使用者狀態並返回房間 ID', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockStatus = 'LEFT' as const;
      const mockUser = {
        _id: new ObjectId(mockUserId),
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
        roomId: mockRoomId,
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
      expect(userModel.updateUserStatus).toHaveBeenCalledWith(
        mockUserId,
        mockStatus
      );
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
      expect(userModel.updateUserStatus).toHaveBeenCalledTimes(1);
    });

    it('當使用者不存在時應拋出錯誤', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as const;

      vi.mocked(userModel.findUserById).mockResolvedValue(null);

      await expect(
        userService.updateUserStatus(mockUserId, mockStatus)
      ).rejects.toThrow(`找不到使用者: ${mockUserId}`);
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.updateUserStatus).not.toHaveBeenCalled();
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });

    it('當使用者沒有房間 ID 時應拋出錯誤', async () => {
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockStatus = 'LEFT' as const;
      const mockUser = {
        _id: new ObjectId(mockUserId),
        createdAt: new Date(),
        device: 'APP' as Device,
        lastActiveAt: new Date(),
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);

      await expect(
        userService.updateUserStatus(mockUserId, mockStatus)
      ).rejects.toThrow(`使用者沒有聊天室: ${mockUserId}`);
      expect(userModel.findUserById).toHaveBeenCalledWith(mockUserId);
      expect(userModel.updateUserStatus).not.toHaveBeenCalled();
      expect(userModel.findUserById).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkUserStatus', () => {
    it('當至少有一個使用者狀態為 LEFT 時應返回 true', async () => {
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
          status: 'LEFT' as UserStatus,
        },
      ];

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(true);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('當沒有使用者狀態為 LEFT 時應返回 false', async () => {
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

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(false);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('當找不到使用者時應返回 false', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(null);

      const result = await userService.checkUserStatus(mockRoomId);
      expect(result).toBe(false);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });
  });

  describe('createMatchedUsers', () => {
    it('應該建立匹配的使用者並返回帶有房間 ID 的使用者', async () => {
      const mockNewUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUserData = {
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

      vi.mocked(chatRoomService.createChatRoom).mockResolvedValue(
        mockChatRoomResult
      );
      vi.mocked(userModel.updateManyUserRoomId).mockResolvedValue(
        mockUpdateManyResult
      );

      const result = await userService.createMatchedUsers(
        mockNewUserData,
        mockPeerUserData
      );

      expect(result).toEqual({
        matchedUsers: [
          {
            ...mockNewUserData,
            userId: mockNewUserId.toString(),
          },
          {
            ...mockPeerUserData,
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

    it('當第一個 createUser 失敗時應拋出錯誤', async () => {
      const mockNewUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUserData = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser).mockResolvedValueOnce(null);

      await expect(
        userService.createMatchedUsers(mockNewUserData, mockPeerUserData)
      ).rejects.toThrow('建立使用者失敗');

      expect(userModel.createUser).toHaveBeenCalledTimes(1);
      expect(chatRoomService.createChatRoom).not.toHaveBeenCalled();
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });

    it('當第二個 createUser 失敗時應拋出錯誤', async () => {
      const mockNewUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUserData = {
        device: 'PC' as Device,
        socketId: 'socket456',
      };

      const mockNewUserId = new ObjectId('507f1f77bcf86cd799439011');

      const mockNewUserResult = {
        acknowledged: true,
        insertedId: mockNewUserId,
      };

      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser)
        .mockResolvedValueOnce(mockNewUserResult)
        .mockResolvedValueOnce(null);

      await expect(
        userService.createMatchedUsers(mockNewUserData, mockPeerUserData)
      ).rejects.toThrow('建立使用者失敗');

      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).not.toHaveBeenCalled();
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });

    it('當 createChatRoom 失敗時應拋出錯誤', async () => {
      const mockNewUserData = {
        device: 'APP' as Device,
        socketId: 'socket123',
      };
      const mockPeerUserData = {
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

      vi.mocked(userModel.createUser).mockReset();
      vi.mocked(userModel.createUser)
        .mockResolvedValueOnce(mockNewUserResult)
        .mockResolvedValueOnce(mockPeerUserResult);

      vi.mocked(chatRoomService.createChatRoom).mockRejectedValue(
        new Error('建立聊天室失敗')
      );

      await expect(
        userService.createMatchedUsers(mockNewUserData, mockPeerUserData)
      ).rejects.toThrow('建立聊天室失敗');

      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).toHaveBeenCalledTimes(1);
      expect(userModel.updateUserRoomId).not.toHaveBeenCalled();
    });
  });
});
