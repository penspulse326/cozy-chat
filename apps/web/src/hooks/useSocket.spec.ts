import { act, renderHook } from '@testing-library/react';
import { io } from 'socket.io-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useSocket from './useSocket';

// Mock socket.io-client
const mockSocketInstance = {
  on: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
  connected: false,
};

vi.mock('socket.io-client', () => {
  const mockIo = vi.fn(() => mockSocketInstance);
  return {
    io: mockIo,
  };
});

describe('useSocket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('應該提供正確的 API', () => {
    const { result } = renderHook(() => useSocket());

    expect(result.current).toEqual({
      connect: expect.any(Function),
      disconnect: expect.any(Function),
      emit: expect.any(Function),
      on: expect.any(Function),
      isConnected: expect.any(Function),
    });
  });

  describe('connect', () => {
    it('應該使用正確的參數建立 socket 連線', () => {
      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
          query: { roomId: 'room123' },
        });
      });

      expect(vi.mocked(io)).toHaveBeenCalledWith('http://localhost:8080', {
        query: { roomId: 'room123' },
      });
    });

    it('當沒有 options 時不應該建立連線', () => {
      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.connect();
      });

      expect(vi.mocked(io)).not.toHaveBeenCalled();
    });

    it('當 query 為空時應該使用空對象', () => {
      const { result } = renderHook(() => useSocket());

      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      expect(vi.mocked(io)).toHaveBeenCalledWith('http://localhost:8080', {
        query: {},
      });
    });
  });

  describe('disconnect', () => {
    it('應該正確斷開 socket 連線', () => {
      const { result } = renderHook(() => useSocket());

      // 先建立連線
      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      // 斷開連線
      act(() => {
        result.current.disconnect();
      });

      expect(mockSocketInstance.disconnect).toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('應該正確發送事件', () => {
      const { result } = renderHook(() => useSocket());

      // 先建立連線
      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      // 發送事件
      act(() => {
        result.current.emit('test-event', { data: 'test' });
      });

      expect(mockSocketInstance.emit).toHaveBeenCalledWith('test-event', {
        data: 'test',
      });
    });

    it('應該能發送沒有資料的事件', () => {
      const { result } = renderHook(() => useSocket());

      // 先建立連線
      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      // 發送事件
      act(() => {
        result.current.emit('test-event');
      });

      expect(mockSocketInstance.emit).toHaveBeenCalledWith(
        'test-event',
        undefined
      );
    });
  });

  describe('on', () => {
    it('應該正確設定事件監聽器', () => {
      const { result } = renderHook(() => useSocket());
      const mockHandler = vi.fn();

      // 先建立連線
      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      // 設定事件監聽器
      act(() => {
        result.current.on('test-event', mockHandler);
      });

      expect(mockSocketInstance.on).toHaveBeenCalledWith(
        'test-event',
        mockHandler
      );
    });
  });

  describe('isConnected', () => {
    it('應該回傳正確的連線狀態', () => {
      const { result } = renderHook(() => useSocket());

      // 初始狀態應該是 false
      expect(result.current.isConnected()).toBe(false);

      // 建立連線後模擬連線狀態
      act(() => {
        result.current.connect({
          url: 'http://localhost:8080',
        });
      });

      mockSocketInstance.connected = true;
      expect(result.current.isConnected()).toBe(true);
    });

    it('當沒有 socket 實例時應該回傳 false', () => {
      const { result } = renderHook(() => useSocket());

      expect(result.current.isConnected()).toBe(false);
    });
  });
});
