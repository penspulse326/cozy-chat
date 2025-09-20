import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useMatch from '../useMatch';

// Mock useSocket hook
const mockSocket = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  emit: vi.fn(),
  on: vi.fn(),
  isConnected: vi.fn(() => false),
};

vi.mock('../useSocket', () => ({
  default: () => mockSocket,
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock @mantine/hooks
vi.mock('@mantine/hooks', () => ({
  useLocalStorage: (options: { key: string; defaultValue: unknown }) => {
    const value = mockLocalStorage.getItem(options.key) || options.defaultValue;
    const setValue = vi.fn((newValue: unknown) => {
      mockLocalStorage.setItem(options.key, newValue);
    });
    const removeValue = vi.fn(() => {
      mockLocalStorage.removeItem(options.key);
    });
    return [value, setValue, removeValue];
  },
}));

describe('useMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('初始狀態', () => {
    it('應該設置正確的初始狀態', () => {
      const { result } = renderHook(() => useMatch());

      expect(result.current.matchStatus).toBe('standby');
      expect(result.current.messages).toEqual([]);
    });
  });

  describe('狀態轉移', () => {
    it('設置為 waiting 時應該建立 socket 連線', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      expect(mockSocket.connect).toHaveBeenCalledWith({
        url: 'http://localhost:8080',
        query: { roomId: null },
      });
    });

    it('設置為 standby 時應該斷開 socket 連線', () => {
      const { result } = renderHook(() => useMatch());

      // 先連接
      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 再斷開
      act(() => {
        result.current.setMatchStatus('standby');
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });

    it('設置為 reloading 時應該建立 socket 連線', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('reloading');
      });

      expect(mockSocket.connect).toHaveBeenCalledWith({
        url: 'http://localhost:8080',
        query: { roomId: null },
      });
    });
  });

  describe('Socket 事件處理', () => {
    it('應該設置正確的 socket 事件監聽器', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 檢查是否設置了正確的事件監聽器
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('match:success', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('match:leave', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('chat:send', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('chat:load', expect.any(Function));
    });

    it('處理配對成功事件時應該更新狀態', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 模擬配對成功事件
      const matchSuccessHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'match:success')?.[1];

      act(() => {
        matchSuccessHandler?.({ roomId: 'room123', userId: 'user456' });
      });

      expect(result.current.matchStatus).toBe('matched');
    });

    it('處理配對離開事件時應該更新狀態', () => {
      const { result } = renderHook(() => useMatch());

      // 先建立連線以設置事件監聽器
      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 設置為 matched 狀態
      act(() => {
        result.current.setMatchStatus('matched');
      });

      // 模擬配對離開事件
      const matchLeaveHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'match:leave')?.[1];

      act(() => {
        matchLeaveHandler?.();
      });

      expect(result.current.matchStatus).toBe('left');
    });

    it('處理收到訊息事件時應該更新訊息列表', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      const newMessage = {
        _id: '1',
        roomId: 'room1',
        userId: 'user1',
        content: '測試訊息',
        createdAt: new Date(),
        device: 'PC',
      };

      // 模擬收到訊息事件
      const messageReceiveHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'chat:send')?.[1];

      act(() => {
        messageReceiveHandler?.(newMessage);
      });

      expect(result.current.messages).toContain(newMessage);
    });
  });

  describe('用戶操作', () => {
    it('sendMessage 應該發送正確的 socket 事件', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.sendMessage('測試訊息');
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('chat:send', {
        roomId: null,
        userId: null,
        content: '測試訊息',
      });
    });

    it('設置為 quit 時應該處理離開邏輯', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('quit');
      });

      // 應該發送取消配對事件（因為沒有 roomId 和 userId）
      expect(mockSocket.emit).toHaveBeenCalledWith('match:cancel');
      expect(result.current.matchStatus).toBe('standby');
    });
  });

  describe('重新載入邏輯', () => {
    it('當 localStorage 有 roomId 時應該設置為 reloading 狀態', () => {
      // 模擬 localStorage 有 roomId
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'roomId') return 'room123';
        return null;
      });

      const { result } = renderHook(() => useMatch());

      // 應該自動設置為 reloading 狀態
      expect(result.current.matchStatus).toBe('reloading');
    });
  });
});
