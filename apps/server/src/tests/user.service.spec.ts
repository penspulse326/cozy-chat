import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import userModel from '@/models/user.model.js';
import userService from '@/services/user.service.js';

// Mock userModel 模組
vi.mock('@/models/user.model.js', () => ({
  default: {
    createUser: vi.fn(),
  },
}));

describe('User Service', () => {
  // 在每個測試前重置所有 mock
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    // case 1: 成功建立 user
    it('should create user with correct payload', async () => {
      const mockWaitingUser = {
        device: 'APP' as const,
        socketId: 'socket123',
      };

      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(), // 使用 ObjectId
      };

      vi.mocked(userModel.createUser).mockResolvedValue(mockInsertResult);

      const result = await userService.createUser(mockWaitingUser);
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

    // case 2: 傳入錯誤的 device 值
    it('should return null when model throws error', async () => {
      const mockWaitingUser = {
        device: 'MB' as const, // 故意使用無效值
        socketId: 'socket123',
      };

      vi.mocked(userModel.createUser).mockResolvedValue(null);

      const result = await userService.createUser(mockWaitingUser);
      expect(result).toBeNull();
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });

    // case 3: 模擬 userModel.createUser 拋出錯誤
    it('should throw error if model throws error', async () => {
      const mockWaitingUser = {
        device: 'APP' as const,
        socketId: 'socket123',
      };

      vi.mocked(userModel.createUser).mockRejectedValue(
        new Error('Create user failed')
      );

      await expect(userService.createUser(mockWaitingUser)).rejects.toThrow(
        'Create user failed'
      );
      expect(userModel.createUser).toHaveBeenCalledTimes(1);
    });
  });
});
