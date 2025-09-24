import type { Device, UserStatus } from '@packages/lib';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import userModel from '@/models/user.model';
import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';

vi.mock('@/models/user.model', () => ({
  default: {
    createUser: vi.fn(),
    findAllUsers: vi.fn(),
    findUserById: vi.fn(),
    findUsersByRoomId: vi.fn(),
    removeMany: vi.fn(),
    updateManyUserRoomId: vi.fn(),
    updateUserRoomId: vi.fn(),
    updateUserStatus: vi.fn(),
  },
}));

vi.mock('@/services/chat-room.service', () => ({
  default: {
    createChatRoom: vi.fn(),
    removeUserFromChatRoom: vi.fn(),
  },
}));

describe('User Service', () => {
  const ANY_DATE = expect.any(Date);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('應該使用正確的資料建立使用者', async () => {
      const mockUserData = {
        device: 'APP' as any,
        socketId: 'socket123',
      };
      const mockInsertResult = {
        createdAt: ANY_DATE,
        device: 'APP' as any,
        id: 'mockUserId1',
        lastActiveAt: ANY_DATE,
        socketId: 'socket123',
        status: 'ACTIVE' as any,
      };
      vi.mocked(userModel.createUser).mockResolvedValue(mockInsertResult);

      const actual = await userService.createUser(mockUserData);

      expect(actual).toBe(mockInsertResult);
      expect(userModel.createUser).toHaveBeenCalledTimes(1);

      const calledWith = vi.mocked(userModel.createUser).mock.calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          createdAt: ANY_DATE,
          device: 'APP',
          lastActiveAt: ANY_DATE,
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
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockUserId,
        lastActiveAt: ANY_DATE,
        roomId: '507f1f77bcf86cd799439022',
        socketId: 'socket123',
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);

      const actual = await userService.findUserById(mockUserId);
      expect(actual).toBe(mockUser);
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
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: 'mockUserId2',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket222',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const actual = await userService.findUsersByRoomId(mockRoomId);
      expect(actual).toBe(mockUsers);
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
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockUserId,
        lastActiveAt: ANY_DATE,
        roomId: mockRoomId,
        socketId: 'socket123',
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.updateUserRoomId).mockResolvedValue(mockUpdateResult);

      const actual = await userService.updateUserRoomId(mockUserId, mockRoomId);
      expect(actual).toBe(mockUpdateResult);
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
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockUserId,
        lastActiveAt: ANY_DATE,
        roomId: mockRoomId,
        socketId: 'socket123',
        status: 'ACTIVE' as UserStatus,
      };
      const mockUpdateResult = {
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockUserId,
        lastActiveAt: ANY_DATE,
        roomId: mockRoomId,
        socketId: 'socket123',
        status: mockStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(userModel.updateUserStatus).mockResolvedValue(mockUpdateResult);

      const actual = await userService.updateUserStatus(mockUserId, mockStatus);
      expect(actual).toEqual(mockUpdateResult);
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
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockUserId,
        lastActiveAt: ANY_DATE,
        socketId: 'socket123',
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
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: 'mockUserId2',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket222',
          status: 'LEFT' as UserStatus,
        },
      ];

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const actual = await userService.checkUserStatus(mockRoomId);
      expect(actual).toBe(true);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('當沒有使用者狀態為 LEFT 時應返回 false', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUsers = [
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: 'mockUserId2',
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: 'socket222',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(mockUsers);

      const actual = await userService.checkUserStatus(mockRoomId);
      expect(actual).toBe(false);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledWith(mockRoomId);
      expect(userModel.findUsersByRoomId).toHaveBeenCalledTimes(1);
    });

    it('當找不到使用者時應返回 false', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(userModel.findUsersByRoomId).mockResolvedValue(null);

      const actual = await userService.checkUserStatus(mockRoomId);
      expect(actual).toBe(false);
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

      const mockNewUserId = 'mockNewUserId';
      const mockPeerUserId = 'mockPeerUserId';
      const mockRoomId = 'mockRoomId';

      const mockNewUserResult = {
        createdAt: ANY_DATE,
        device: mockNewUserData.device,
        id: mockNewUserId,
        lastActiveAt: ANY_DATE,
        socketId: mockNewUserData.socketId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockPeerUserResult = {
        createdAt: ANY_DATE,
        device: mockPeerUserData.device,
        id: mockPeerUserId,
        lastActiveAt: ANY_DATE,
        socketId: mockPeerUserData.socketId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockChatRoomResult = {
        createdAt: ANY_DATE,
        id: mockRoomId,
        users: [mockNewUserId, mockPeerUserId],
      };

      const mockUpdateManyResult = [
        {
          createdAt: ANY_DATE,
          device: mockNewUserData.device,
          id: mockNewUserId,
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: mockNewUserData.socketId,
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: mockPeerUserData.device,
          id: mockPeerUserId,
          lastActiveAt: ANY_DATE,
          roomId: mockRoomId,
          socketId: mockPeerUserData.socketId,
          status: 'ACTIVE' as UserStatus,
        },
      ];

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

      const actual = await userService.createMatchedUsers(
        mockNewUserData,
        mockPeerUserData
      );

      expect(actual).toEqual(mockUpdateManyResult);

      expect(userModel.createUser).toHaveBeenCalledTimes(2);
      expect(chatRoomService.createChatRoom).toHaveBeenCalledWith([
        mockNewUserId,
        mockPeerUserId,
      ]);
      expect(userModel.updateManyUserRoomId).toHaveBeenCalledWith(
        [mockNewUserId, mockPeerUserId],
        mockRoomId
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

      expect(userModel.createUser).toHaveBeenCalledTimes(2);
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

      const mockNewUserId = 'mockNewUserId';

      const mockNewUserResult = {
        createdAt: ANY_DATE,
        device: mockNewUserData.device,
        id: mockNewUserId,
        lastActiveAt: ANY_DATE,
        socketId: mockNewUserData.socketId,
        status: 'ACTIVE' as UserStatus,
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

      const mockNewUserId = 'mockNewUserId';
      const mockPeerUserId = 'mockPeerUserId';

      const mockNewUserResult = {
        createdAt: ANY_DATE,
        device: mockNewUserData.device,
        id: mockNewUserId,
        lastActiveAt: ANY_DATE,
        socketId: mockNewUserData.socketId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockPeerUserResult = {
        createdAt: ANY_DATE,
        device: mockPeerUserData.device,
        id: mockPeerUserId,
        lastActiveAt: ANY_DATE,
        socketId: mockPeerUserData.socketId,
        status: 'ACTIVE' as UserStatus,
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

  describe('removeInactiveUsers', () => {
    it('應該成功移除不活躍的使用者及其聊天室關聯', async () => {
      const mockUsers = [
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: new Date(Date.now() - 6 * 60 * 1000), // 6 分鐘前
          roomId: 'mockRoomId1',
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: 'mockUserId2',
          lastActiveAt: new Date(Date.now() - 7 * 60 * 1000), // 7 分鐘前
          roomId: 'mockRoomId2',
          socketId: 'socket222',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId3',
          lastActiveAt: new Date(Date.now() - 2 * 60 * 1000), // 2 分鐘前
          socketId: 'socket333',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findAllUsers).mockResolvedValue(mockUsers);
      vi.mocked(chatRoomService.removeUserFromChatRoom).mockResolvedValue({
        createdAt: ANY_DATE,
        id: 'mockRoomId1',
        users: ['mockUserId2'],
      });
      vi.mocked(userModel.removeMany).mockResolvedValue(true);

      await userService.removeInactiveUsers();

      expect(chatRoomService.removeUserFromChatRoom).toHaveBeenCalledWith(
        'mockRoomId1',
        'mockUserId1'
      );
      expect(chatRoomService.removeUserFromChatRoom).toHaveBeenCalledWith(
        'mockRoomId2',
        'mockUserId2'
      );
      expect(chatRoomService.removeUserFromChatRoom).toHaveBeenCalledTimes(2);
      expect(userModel.removeMany).toHaveBeenCalledWith([
        'mockUserId1',
        'mockUserId2',
      ]);
      expect(userModel.removeMany).toHaveBeenCalledTimes(1);
    });

    it('當沒有不活躍的使用者時不應呼叫任何移除方法', async () => {
      const mockUsers = [
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: new Date(Date.now() - 2 * 60 * 1000), // 2 分鐘前
          roomId: 'mockRoomId1',
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
        {
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: 'mockUserId2',
          lastActiveAt: new Date(Date.now() - 3 * 60 * 1000), // 3 分鐘前
          roomId: 'mockRoomId2',
          socketId: 'socket222',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findAllUsers).mockResolvedValue(mockUsers);

      await userService.removeInactiveUsers();

      expect(chatRoomService.removeUserFromChatRoom).not.toHaveBeenCalled();
      expect(userModel.removeMany).not.toHaveBeenCalled();
    });

    it('當查詢使用者失敗時應拋出錯誤', async () => {
      vi.mocked(userModel.findAllUsers).mockResolvedValue(null);

      await expect(userService.removeInactiveUsers()).rejects.toThrow(
        '查詢使用者失敗'
      );
      expect(chatRoomService.removeUserFromChatRoom).not.toHaveBeenCalled();
      expect(userModel.removeMany).not.toHaveBeenCalled();
    });

    it('當從聊天室移除使用者失敗時應拋出錯誤', async () => {
      const mockUsers = [
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: new Date(Date.now() - 6 * 60 * 1000), // 6 分鐘前
          roomId: 'mockRoomId1',
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findAllUsers).mockResolvedValue(mockUsers);
      vi.mocked(chatRoomService.removeUserFromChatRoom).mockRejectedValue(
        new Error('從聊天室移除使用者失敗')
      );

      await expect(userService.removeInactiveUsers()).rejects.toThrow(
        '從聊天室移除使用者失敗'
      );
      expect(chatRoomService.removeUserFromChatRoom).toHaveBeenCalledWith(
        'mockRoomId1',
        'mockUserId1'
      );
      expect(userModel.removeMany).not.toHaveBeenCalled();
    });

    it('當移除使用者失敗時應拋出錯誤', async () => {
      const mockUsers = [
        {
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: 'mockUserId1',
          lastActiveAt: new Date(Date.now() - 6 * 60 * 1000), // 6 分鐘前
          roomId: 'mockRoomId1',
          socketId: 'socket111',
          status: 'ACTIVE' as UserStatus,
        },
      ];

      vi.mocked(userModel.findAllUsers).mockResolvedValue(mockUsers);
      vi.mocked(chatRoomService.removeUserFromChatRoom).mockResolvedValue({
        createdAt: ANY_DATE,
        id: 'mockRoomId1',
        users: [],
      });
      vi.mocked(userModel.removeMany).mockResolvedValue(false);

      await expect(userService.removeInactiveUsers()).rejects.toThrow(
        '移除不活躍使用者失敗: mockUserId1'
      );
      expect(chatRoomService.removeUserFromChatRoom).toHaveBeenCalledWith(
        'mockRoomId1',
        'mockUserId1'
      );
      expect(userModel.removeMany).toHaveBeenCalledWith(['mockUserId1']);
      expect(userModel.removeMany).toHaveBeenCalledTimes(1);
    });
  });
});
