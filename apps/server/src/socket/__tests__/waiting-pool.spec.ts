import type { Device } from '@packages/lib';

import { describe, expect, it } from 'vitest';

import { createWaitingPool } from '@/socket/waiting-pool';

describe('Socket State', () => {
  describe('createWaitingPool', () => {
    it('應該建立一個有正確方法的 socket 狀態', () => {
      const waitingPool = createWaitingPool();

      expect(waitingPool).toHaveProperty('addUserToPool');
      expect(waitingPool).toHaveProperty('removeUserFromPool');
      expect(waitingPool).toHaveProperty('getNextUserFromPool');
      expect(waitingPool).toHaveProperty('getPoolUsers');
    });
  });

  describe('addUserToPool', () => {
    it('應該添加等待使用者並返回該使用者', () => {
      const waitingPool = createWaitingPool();
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };

      waitingPool.addUserToPool(newUser);

      expect(waitingPool.getPoolUsers()).toContainEqual(newUser);
    });
  });

  describe('removeUserFromPool', () => {
    it('當找到使用者時應該移除等待使用者並返回 true', () => {
      const waitingPool = createWaitingPool();
      const user = { device: 'PC' as Device, socketId: 'socket1' };
      waitingPool.addUserToPool(user);

      const actual = waitingPool.removeUserFromPool('socket1');

      expect(actual).toBe(true);
      expect(waitingPool.getPoolUsers()).not.toContainEqual(user);
    });

    it('當找不到使用者時應該返回 false', () => {
      const waitingPool = createWaitingPool();

      const actual = waitingPool.removeUserFromPool('nonexistent');

      expect(actual).toBe(false);
    });
  });

  describe('getNextUserFromPool', () => {
    it('應該返回並移除第一個等待使用者', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addUserToPool(user1);
      waitingPool.addUserToPool(user2);

      const actual = waitingPool.getNextUserFromPool();

      expect(actual).toBe(user1);
      expect(waitingPool.getPoolUsers()).not.toContainEqual(user1);
      expect(waitingPool.getPoolUsers()).toContainEqual(user2);
    });

    it('當沒有等待使用者時應該返回 undefined', () => {
      const waitingPool = createWaitingPool();

      const actual = waitingPool.getNextUserFromPool();

      expect(actual).toBeUndefined();
    });
  });

  describe('getPoolUsers', () => {
    it('應該返回所有等待使用者的副本', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addUserToPool(user1);
      waitingPool.addUserToPool(user2);

      const actual = waitingPool.getPoolUsers();

      expect(actual).toEqual([user1, user2]);
      expect(actual).not.toBe(waitingPool.getPoolUsers()); // 確保返回的是副本
    });
  });
});
