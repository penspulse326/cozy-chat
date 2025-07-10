import type { ApiResponse, Meeting, User } from '@packages/lib';

import {
  capitalize,
  formatDate,
  formatName,
  isEmpty,
  isToday,
  pick,
  sayGoodbye,
  sayHello,
  unique,
} from '@packages/lib';
import { describe, expect, it } from 'vitest';

describe('Shared Library Tests', () => {
  describe('String utilities', () => {
    it('should say hello correctly', () => {
      expect(sayHello('世界')).toBe('Hello 世界');
    });

    it('should say goodbye correctly', () => {
      expect(sayGoodbye('朋友')).toBe('Goodbye 朋友');
    });

    it('should capitalize strings', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
    });

    it('should format names correctly', () => {
      expect(formatName('john', 'DOE')).toBe('John Doe');
    });
  });

  describe('Array utilities', () => {
    it('should check if array is empty', () => {
      expect(isEmpty([])).toBe(true);
      expect(isEmpty([1, 2, 3])).toBe(false);
    });

    it('should return unique values', () => {
      expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
      expect(unique(['a', 'b', 'a', 'c'])).toEqual(['a', 'b', 'c']);
    });
  });

  describe('Object utilities', () => {
    it('should pick properties from object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });
  });

  describe('Date utilities', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-01');
      expect(formatDate(date)).toBe('2024/1/1');
    });

    it('should check if date is today', () => {
      const today = new Date();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

      expect(isToday(today)).toBe(true);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('Type definitions', () => {
    it('should use User type correctly', () => {
      const user: User = {
        createdAt: new Date(),
        email: 'test@example.com',
        id: '123',
        name: '測試用戶',
        updatedAt: new Date(),
      };

      expect(user.name).toBe('測試用戶');
    });

    it('should use ApiResponse type correctly', () => {
      const response: ApiResponse<string> = {
        data: 'test data',
        message: '成功',
        success: true,
      };

      expect(response.success).toBe(true);
    });

    it('should use Meeting type correctly', () => {
      const user: User = {
        createdAt: new Date(),
        email: 'organizer@example.com',
        id: '1',
        name: '組織者',
        updatedAt: new Date(),
      };

      const meeting: Meeting = {
        createdAt: new Date(),
        endTime: new Date(),
        id: 'meeting-1',
        organizer: user,
        participants: [user],
        startTime: new Date(),
        status: 'scheduled',
        title: '團隊會議',
        updatedAt: new Date(),
      };

      expect(meeting.title).toBe('團隊會議');
      expect(meeting.status).toBe('scheduled');
    });
  });
});
