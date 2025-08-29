/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalStorage } from '@mantine/hooks';
import { CHAT_EVENT, MATCH_EVENT } from '@packages/lib';
import { io } from 'socket.io-client';
import { SocketProvider } from '../contexts/SocketContext';
import useMatch from './useMatch';

// Mock dependencies
vi.mock('@mantine/hooks', async () => ({
  useLocalStorage: vi.fn(),
}));

const mockSocket = {
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  disconnect: vi.fn(),
};
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('useMatch', () => {
  const useLocalStorageMock = vi.mocked(useLocalStorage);
  const ioMock = vi.mocked(io);

  // Helper to create a wrapper with the real SocketProvider
  const createWrapper = () => {
    return ({ children }: { children: ReactNode }) => (
      <SocketProvider>{children}</SocketProvider>
    );
  };

  const setRoomIdMock = vi.fn();
  const setUserIdMock = vi.fn();

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    // Mock useLocalStorage based on the key
    useLocalStorageMock.mockImplementation((options) => {
      if (options.key === 'userId') {
        return [null, setUserIdMock, vi.fn()];
      }
      if (options.key === 'roomId') {
        return [null, setRoomIdMock, vi.fn()];
      }
      return [null, vi.fn(), vi.fn()];
    });
  });

  describe('Initialization', () => {
    it('should start with "standby" status and not connect', () => {
      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.matchStatus).toBe('standby');
      expect(ioMock).not.toHaveBeenCalled();
    });

    it('should start with "reloading" status if roomId exists', () => {
      useLocalStorageMock.mockImplementation((options) => {
        if (options.key === 'roomId') {
          return ['existing-room', setRoomIdMock, vi.fn()];
        }
        return [null, setUserIdMock, vi.fn()];
      });

      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      expect(result.current.matchStatus).toBe('reloading');
    });
  });

  describe('Connection Management', () => {
    it('should call connect when status changes to "waiting"', () => {
      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      expect(ioMock).toHaveBeenCalledWith('http://localhost:8080', {
        query: { roomId: null },
      });
    });

    it('should call connect when status is "reloading"', () => {
      useLocalStorageMock.mockImplementation((options) => {
        if (options.key === 'roomId') {
          return ['existing-room', setRoomIdMock, vi.fn()];
        }
        return [null, setUserIdMock, vi.fn()];
      });

      renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      expect(ioMock).toHaveBeenCalledWith('http://localhost:8080', {
        query: { roomId: 'existing-room' },
      });
    });

    it('should call disconnect when status changes to "standby"', () => {
      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      // First, connect
      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // Then, disconnect by setting status to standby
      act(() => {
        result.current.setMatchStatus('standby');
      });

      expect(mockSocket.disconnect).toHaveBeenCalled();
    });
  });

  describe('Socket Event Handlers', () => {
    it('should transition to "matched" on MATCH_EVENT.SUCCESS', () => {
      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      // Simulate server event
      act(() => {
        const successCallback = mockSocket.on.mock.calls.find(
          (call) => call[0] === MATCH_EVENT.SUCCESS,
        )[1];
        successCallback({ roomId: 'new-room', userId: 'new-user' });
      });

      expect(result.current.matchStatus).toBe('matched');
      expect(setRoomIdMock).toHaveBeenCalledWith('new-room');
      expect(setUserIdMock).toHaveBeenCalledWith('new-user');
    });

    it('should update messages on CHAT_EVENT.LOAD', () => {
      const { result } = renderHook(() => useMatch(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.setMatchStatus('waiting');
      });

      const initialMessages = [{ content: 'Hello' }];
      // Simulate server event
      act(() => {
        const loadCallback = mockSocket.on.mock.calls.find(
          (call) => call[0] === CHAT_EVENT.LOAD,
        )[1];
        loadCallback(initialMessages);
      });

      expect(result.current.messages).toEqual(initialMessages);
    });
  });
});
