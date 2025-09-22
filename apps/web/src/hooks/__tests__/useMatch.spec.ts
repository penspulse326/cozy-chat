import { act, renderHook } from '@testing-library/react';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import useMatch from '../useMatch';

beforeAll(() => {
  vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => { });
});

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

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


describe('useMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('初始狀態', () => {
    it('應該設定正確的初始狀態', () => {
      const { result } = renderHook(() => useMatch());

      expect(result.current.matchStatus).toBe('standby');
      expect(result.current.messages).toEqual([]);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('roomId');
    });
  });

  describe('狀態轉移', () => {
    it('設定為 waiting 時應該建立 socket 連線', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      expect(mockSocket.connect).toHaveBeenCalledWith({
        url: 'http://localhost:8080',
        query: { roomId: null },
      });
    });

    it('設定為 standby 時應該斷開 socket 連線', () => {
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

    it('設定為 reloading 時應該建立 socket 連線', () => {
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
    it('應該設定正確的 socket 事件監聽器', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 檢查是否設定了正確的事件監聽器
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

      // 先建立連線以設定事件監聽器
      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 設定為 matched 狀態
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
        userId: null, // 將 userId 修改為 null，使其與 result.current.userId 相同
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
      expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });

    it('處理收到來自其他使用者的訊息事件時應該更新訊息列表並播放音效', () => {
      const { result } = renderHook(() => useMatch());

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // 模擬配對成功以設定 userId
      const matchSuccessHandler = mockSocket.on.mock.calls
        .find(call => call[0] === 'match:success')?.[1];

      act(() => {
        matchSuccessHandler?.({ roomId: 'room123', userId: 'user456' });
      });

      const newMessage = {
        id: '1',
        roomId: 'room123',
        userId: 'anotherUser', // 來自其他使用者的訊息
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
      expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });
  });

  describe('使用者操作', () => {
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

    it('設定為 quit 時應該處理離開邏輯', () => {
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
    it('當 localStorage 有 roomId 時應該設定為 reloading 狀態', () => {
      // 直接設定 mockStore，模擬 localStorage 中有 roomId
      localStorage.setItem('roomId', 'room123');

      const { result } = renderHook(() => useMatch());

      // 應該自動設定為 reloading 狀態
      expect(result.current.matchStatus).toBe('reloading');
      expect(localStorage.getItem).toHaveBeenCalledWith('roomId');
    });
  });
});
