import type { Device } from '@packages/lib/dist';
import type { Server, Socket } from 'socket.io';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { WaitingPool } from '@/socket/waiting-pool';

import userService from '@/services/user.service';
import { createMatchHandlers } from '@/socket/handlers/match';
import { createWaitingPool } from '@/socket/waiting-pool';

vi.mock('@/services/user.service', () => ({
  default: {
    createMatchedUsers: vi.fn(),
    updateUserStatus: vi.fn(),
  },
}));

describe('Match Handlers', () => {
  let mockIo: Partial<Server>;
  let mockSocket: Partial<Socket>;
  let mockSocketsMap: Map<string, Socket>;
  let waitingPool: WaitingPool;

  beforeEach(() => {
    mockSocket = {
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
    };

    mockSocketsMap = new Map();
    mockSocketsMap.set('socket1', mockSocket as unknown as Socket);
    mockSocketsMap.set('socket2', mockSocket as unknown as Socket);

    mockIo = {
      emit: vi.fn(),
      of: vi.fn().mockReturnValue({
        sockets: {
          get: vi.fn((id: string) => mockSocketsMap.get(id)),
        },
      }),
      to: vi.fn().mockReturnThis(),
    };

    waitingPool = createWaitingPool();
    vi.clearAllMocks();
  });

  describe('handleMatchStart', () => {
    it('當沒有等待使用者時，應該將新使用者添加到等待池', async () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };

      vi.spyOn(waitingPool, 'getNextFromPool').mockReturnValue(undefined);
      vi.spyOn(waitingPool, 'addToPool');

      await matchHandlers.handleMatchStart(newUser);

      expect(waitingPool.getNextFromPool).toHaveBeenCalled();
      expect(waitingPool.addToPool).toHaveBeenCalledWith(newUser);
    });

    it('當有等待使用者時，應該匹配並通知兩個使用者', async () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };
      const peerUser = { device: 'APP' as Device, socketId: 'socket2' };

      vi.spyOn(waitingPool, 'getNextFromPool').mockReturnValue(peerUser);

      const mockMatchedUsers = [
        { ...newUser, userId: 'user1' },
        { ...peerUser, userId: 'user2' },
      ];

      vi.mocked(userService.createMatchedUsers).mockResolvedValue({
        matchedUsers: mockMatchedUsers,
        roomId: 'room123',
      });

      await matchHandlers.handleMatchStart(newUser);

      expect(waitingPool.getNextFromPool).toHaveBeenCalled();
      expect(userService.createMatchedUsers).toHaveBeenCalledWith(
        newUser,
        peerUser
      );
      expect(mockSocket.join).toHaveBeenCalled();
      expect(mockIo.to).toHaveBeenCalled();
      expect(mockIo.emit).toHaveBeenCalled();
    });
  });

  describe('handleMatchCancel', () => {
    it('當成功移除等待使用者時，應該發送取消事件', () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );

      vi.spyOn(waitingPool, 'removeFromPool').mockReturnValue(true);
      vi.spyOn(waitingPool, 'getPoolUsers').mockReturnValue([]);

      matchHandlers.handleMatchCancel('socket1');

      expect(waitingPool.removeFromPool).toHaveBeenCalledWith('socket1');
      expect(mockSocket.emit).toHaveBeenCalledWith('match:cancel');
    });

    it('當找不到等待使用者時，不應該發送任何事件', () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );

      vi.spyOn(waitingPool, 'removeFromPool').mockReturnValue(false);

      matchHandlers.handleMatchCancel('nonexistent');

      expect(waitingPool.removeFromPool).toHaveBeenCalledWith('nonexistent');
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleMatchLeave', () => {
    it('應該更新使用者狀態並通知房間內所有使用者', async () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );
      const userId = 'user123';
      const roomId = 'room123';

      vi.mocked(userService.updateUserStatus).mockResolvedValue({
        roomId,
      });

      await matchHandlers.handleMatchLeave(userId);

      expect(userService.updateUserStatus).toHaveBeenCalledWith(userId, 'LEFT');
      expect(mockIo.to).toHaveBeenCalledWith(roomId);
      expect(mockIo.emit).toHaveBeenCalledWith('match:leave');
    });
  });

  describe('notifyMatchLeave', () => {
    it('應該向房間內所有使用者發送離開事件', () => {
      const matchHandlers = createMatchHandlers(
        mockIo as unknown as Server,
        waitingPool
      );
      const roomId = 'room123';

      matchHandlers.notifyMatchLeave(roomId);

      expect(mockIo.to).toHaveBeenCalledWith(roomId);
      expect(mockIo.emit).toHaveBeenCalledWith('match:leave');
    });
  });
});
