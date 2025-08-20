import type { Device } from '@packages/lib';

import { describe, expect, it } from 'vitest';

import { createSocketState } from '@/socket/state';

describe('Socket State', () => {
  describe('createSocketState', () => {
    it('應該建立一個有正確方法的 socket 狀態', () => {
      const state = createSocketState();

      expect(state).toHaveProperty('addWaitingUser');
      expect(state).toHaveProperty('removeWaitingUser');
      expect(state).toHaveProperty('getNextWaitingUser');
      expect(state).toHaveProperty('getWaitingUsers');
    });
  });

  describe('addWaitingUser', () => {
    it('應該添加等待用戶並返回該用戶', () => {
      const state = createSocketState();
      const newUser = { device: 'PC' as Device, socketId: 'socket1' };

      const result = state.addWaitingUser(newUser);

      expect(result).toBe(newUser);
      expect(state.getWaitingUsers()).toContainEqual(newUser);
    });
  });

  describe('removeWaitingUser', () => {
    it('當找到用戶時應該移除等待用戶並返回 true', () => {
      const state = createSocketState();
      const user = { device: 'PC' as Device, socketId: 'socket1' };
      state.addWaitingUser(user);

      const result = state.removeWaitingUser('socket1');

      expect(result).toBe(true);
      expect(state.getWaitingUsers()).not.toContainEqual(user);
    });

    it('當找不到用戶時應該返回 false', () => {
      const state = createSocketState();

      const result = state.removeWaitingUser('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('getNextWaitingUser', () => {
    it('應該返回並移除第一個等待用戶', () => {
      const state = createSocketState();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      state.addWaitingUser(user1);
      state.addWaitingUser(user2);

      const result = state.getNextWaitingUser();

      expect(result).toBe(user1);
      expect(state.getWaitingUsers()).not.toContainEqual(user1);
      expect(state.getWaitingUsers()).toContainEqual(user2);
    });

    it('當沒有等待用戶時應該返回 undefined', () => {
      const state = createSocketState();

      const result = state.getNextWaitingUser();

      expect(result).toBeUndefined();
    });
  });

  describe('getWaitingUsers', () => {
    it('應該返回所有等待用戶的副本', () => {
      const state = createSocketState();
      const user1 = { device: 'PC' as Device, socketId: 'socket1' };
      const user2 = { device: 'APP' as Device, socketId: 'socket2' };
      state.addWaitingUser(user1);
      state.addWaitingUser(user2);

      const result = state.getWaitingUsers();

      expect(result).toEqual([user1, user2]);
      expect(result).not.toBe(state.getWaitingUsers()); // 確保返回的是副本
    });
  });
});
