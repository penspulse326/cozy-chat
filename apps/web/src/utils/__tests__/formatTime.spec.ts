import dayjs from 'dayjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatMessageTime } from '../formatTime';

describe('formatMessageTime', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2025-09-24T10:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('應在時間差小於 1 分鐘時回傳 "剛剛"', () => {
    // arrange
    const messageTime = '2025-09-24T09:59:30.000Z';

    // act
    const actual = formatMessageTime(messageTime);

    // assert
    expect(actual).toBe('剛剛');
  });

  it('應在時間差小於 60 分鐘時回傳 "X 分鐘前"', () => {
    // arrange
    const messageTime = '2025-09-24T09:55:00.000Z';

    // act
    const actual = formatMessageTime(messageTime);

    // assert
    expect(actual).toBe('5 分鐘前');
  });

  it('應在時間差小於 24 小時時回傳 "HH:mm"', () => {
    // arrange
    const messageTime = '2025-09-24T05:00:00.000Z';

    // act
    const actual = formatMessageTime(messageTime);

    // assert
    expect(actual).toBe(dayjs(messageTime).format('HH:mm'));
  });

  it('應在時間差大於或等於 24 小時時回傳 "X 天前"', () => {
    // arrange
    const messageTime = '2025-09-22T10:00:00.000Z';

    // act
    const actual = formatMessageTime(messageTime);

    // assert
    expect(actual).toBe('2 天前');
  });
});
