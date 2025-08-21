import type { Device } from '@packages/lib';

import { describe, expect, it } from 'vitest';

import { createWaitingPool } from '@/socket/waiting-pool';

describe('Socket State', () => {
  describe('createWaitingPool', () => {
    it('應該建立一個有正確方法的 socket 狀態', () => {
      const waitingPool = createWaitingPool();

      expect(waitingPool).toHaveProperty('addWaitingUser');
      expect(waitingPool).toHaveProperty('removeWaitingUser');
      expect(waitingPool).toHaveProperty('getNextWaitingUser');
      expect(waitingPool).toHaveProperty('getWaitingUsers');
    });
  });

  describe('addWaitingUser', () => {
    it('應該添加等待使用者並返回該使用者', () => {
      const waitingPool = createWaitingPool();
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };

      const result = waitingPool.addWaitingUser(newUser);

      expect(result).toBe(newUser);
      expect(waitingPool.getWaitingUsers()).toContainEqual(newUser);
    });
  });

  describe('removeWaitingUser', () => {
    it('當找到使用者時應該移除等待使用者並返回 true', () => {
      const waitingPool = createWaitingPool();
      const user = { device: 'PC' as Device, socketId: 'socket1' };
      waitingPool.addWaitingUser(user);

      const result = waitingPool.removeWaitingUser('socket1');

      expect(result).toBe(true);
      expect(waitingPool.getWaitingUsers()).not.toContainEqual(user);
    });

    it('當找不到使用者時應該返回 false', () => {
      const waitingPool = createWaitingPool();

      const result = waitingPool.removeWaitingUser('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getNextWaitingUser', () => {
    it('應該返回並移除第一個等待使用者', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addWaitingUser(user1);
      waitingPool.addWaitingUser(user2);

      const result = waitingPool.getNextWaitingUser();

      expect(result).toBe(user1);
      expect(waitingPool.getWaitingUsers()).not.toContainEqual(user1);
      expect(waitingPool.getWaitingUsers()).toContainEqual(user2);
    });

    it('當沒有等待使用者時應該返回 undefined', () => {
      const waitingPool = createWaitingPool();

      const result = waitingPool.getNextWaitingUser();

      expect(result).toBeUndefined();
    });
  });

  describe('getWaitingUsers', () => {
    it('應該返回所有等待使用者的副本', () => {
      const waitingPool = createWaitingPool();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      waitingPool.addWaitingUser(user1);
      waitingPool.addWaitingUser(user2);

      const result = waitingPool.getWaitingUsers();

      expect(result).toEqual([user1, user2]);
      expect(result).not.toBe(waitingPool.getWaitingUsers()); // 確保返回的是副本
    });
  });
});
