import type { Device } from '@packages/lib';

import { describe, expect, it } from 'vitest';

import { createWaitingPool } from '@/socket/waiting-pool';

describe('Socket State', () => {
  describe('createWaitingPool', () => {
    it('應該建立一個有正確方法的 socket 狀態', () => {
      const waitingPool = createWaitingPool();

      expect(waitingPool).toHaveProperty('addToPool');
      expect(waitingPool).toHaveProperty('removeFromPool');
      expect(waitingPool).toHaveProperty('getNextFromPool');
      expect(waitingPool).toHaveProperty('getPoolUsers');
    });
  });

  describe('addToPool', () => {
    it('應該添加等待使用者並返回該使用者', () => {
      const waitingPool = createWaitingPool();
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };

      const result = waitingPool.addToPool(newUser);

      expect(result).toBe(newUser);
      expect(waitingPool.getPoolUsers()).toContainEqual(newUser);
    });
  });

  describe('removeFromPool', () => {
    it('當找到使用者時應該移除等待使用者並返回 true', () => {
      const waitingPool = createWaitingPool();
      const user = { device: 'PC' as Device, socketId: 'socket1' };
      waitingPool.addToPool(user);

      const result = waitingPool.removeFromPool('socket1');

      expect(result).toBe(true);
      expect(waitingPool.getPoolUsers()).not.toContainEqual(user);
    });

    it('當找不到使用者時應該返回 false', () => {
      const waitingPool = createWaitingPool();

      const result = waitingPool.removeFromPool('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getNextFromPool', () => {
    it('應該返回並移除第一個等待使用者', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addToPool(user1);
      waitingPool.addToPool(user2);

      const result = waitingPool.getNextFromPool();

      expect(result).toBe(user1);
      expect(waitingPool.getPoolUsers()).not.toContainEqual(user1);
      expect(waitingPool.getPoolUsers()).toContainEqual(user2);
    });

    it('當沒有等待使用者時應該返回 undefined', () => {
      const waitingPool = createWaitingPool();

      const result = waitingPool.getNextFromPool();

      expect(result).toBeUndefined();
    });
  });

  describe('getPoolUsers', () => {
    it('應該返回所有等待使用者的副本', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addToPool(user1);
      waitingPool.addToPool(user2);

      const result = waitingPool.getPoolUsers();

      expect(result).toEqual([user1, user2]);
      expect(result).not.toBe(waitingPool.getPoolUsers()); // 確保返回的是副本
    });
  });
});
