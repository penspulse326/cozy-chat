import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDeviceType } from '../getDeviceType';

describe('getDeviceType', () => {
  const originalMatchMedia = window.matchMedia;
  const originalOntouchstart = Object.getOwnPropertyDescriptor(window, 'ontouchstart');

  beforeEach(() => {
    // 清除 vitest.setup.ts 的全局 mock
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });

    if (originalOntouchstart) {
      Object.defineProperty(window, 'ontouchstart', originalOntouchstart);
    } else {
      delete (window as any).ontouchstart;
    }
  });

  it('當 matchMedia 為 false 且沒有 ontouchstart 時應該回傳 PC', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(pointer:coarse)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    delete (window as any).ontouchstart;

    expect(getDeviceType()).toBe('PC');
  });

  it('當 matchMedia 為 true 時應該回傳 MB，不管 ontouchstart 的值', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(pointer:coarse)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    expect(getDeviceType()).toBe('MB');
  });

  it('當 matchMedia 為 false 但有 ontouchstart 時應該回傳 MB', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '(pointer:coarse)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: 'some value',
    });

    expect(getDeviceType()).toBe('MB');
  });
});
