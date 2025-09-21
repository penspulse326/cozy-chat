import type { Server, Socket } from 'socket.io';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChatHandlers } from '@/socket/handlers/chat';
import type { MatchHandlers } from '@/socket/handlers/match';
import type { UserHandlers } from '@/socket/handlers/user';
import type { WaitingPool } from '@/socket/waiting-pool';

import { setupSocketServer } from '@/socket';
import * as chatHandlersModule from '@/socket/handlers/chat';
import * as matchHandlersModule from '@/socket/handlers/match';
import * as userHandlersModule from '@/socket/handlers/user';
import * as waitingPoolModule from '@/socket/waiting-pool';

vi.mock('@/socket/handlers/chat', () => ({
  createChatHandlers: vi.fn(),
}));

vi.mock('@/socket/handlers/match', () => ({
  createMatchHandlers: vi.fn(),
}));

vi.mock('@/socket/handlers/user', () => ({
  createUserHandlers: vi.fn(),
}));

vi.mock('@/socket/waiting-pool', () => ({
  createWaitingPool: vi.fn(),
}));



interface MockServer extends Partial<Server> {
  connectionCallback?: (socket: Socket) => void;
}

describe('Socket Server', () => {
  let mockIo: MockServer;
  let mockSocket: Partial<Socket>;
  let mockState: Partial<WaitingPool>;
  let mockChatHandlers: Partial<ChatHandlers>;
  let mockMatchHandlers: Partial<MatchHandlers>;
  let mockUserHandlers: Partial<UserHandlers>;

  beforeEach(() => {
    mockSocket = {
      handshake: {
        address: '',
        auth: {},
        headers: {},
        issued: 0,
        query: {},
        secure: false,
        time: new Date().toString(),
        url: '',
        xdomain: false,
      },
      id: 'socket1',
      on: vi.fn(),
    };

    mockState = {
      removeUserFromPool: vi.fn(),
    };

    mockChatHandlers = {
      handleChatSend: vi.fn(),
    };

    mockMatchHandlers = {
      handleMatchCancel: vi.fn(),
      handleMatchLeave: vi.fn(),
      handleMatchStart: vi.fn(),
    };

    mockUserHandlers = {
      handleCheckUser: vi.fn(),
    };

    mockIo = {
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'connection') {
          mockIo.connectionCallback = callback;
        }
        return mockIo as Server;
      }),
    };

    vi.mocked(waitingPoolModule.createWaitingPool).mockReturnValue(
      mockState as WaitingPool
    );
    vi.mocked(chatHandlersModule.createChatHandlers).mockReturnValue(
      mockChatHandlers as ChatHandlers
    );
    vi.mocked(matchHandlersModule.createMatchHandlers).mockReturnValue(
      mockMatchHandlers as MatchHandlers
    );
    vi.mocked(userHandlersModule.createUserHandlers).mockReturnValue(
      mockUserHandlers as UserHandlers
    );

    vi.clearAllMocks();
  });

  it('應該建立 socket 伺服器並設置連接處理程序', () => {
    setupSocketServer(mockIo as Server);

    expect(waitingPoolModule.createWaitingPool).toHaveBeenCalled();
    expect(chatHandlersModule.createChatHandlers).toHaveBeenCalledWith(mockIo);
    expect(matchHandlersModule.createMatchHandlers).toHaveBeenCalledWith(
      mockIo,
      mockState
    );
    expect(userHandlersModule.createUserHandlers).toHaveBeenCalledWith(
      mockIo,
      mockChatHandlers
    );
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('當有 roomId 時，應該檢查使用者', () => {
    setupSocketServer(mockIo as Server);

    // 確保 connectionCallback 已被設置
    expect(mockIo.connectionCallback).toBeDefined();
    if (!mockIo.connectionCallback) {
      return;
    }

    if (mockSocket.handshake) {
      mockSocket.handshake.query.roomId = 'room123';
    }

    // 使用存儲的 callback
    mockIo.connectionCallback(mockSocket as Socket);

    expect(mockUserHandlers.handleCheckUser).toHaveBeenCalledWith(
      mockSocket.id,
      'room123'
    );
  });

  it('應該設置所有必要的事件監聽器', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    expect(mockSocket.on).toHaveBeenCalledWith(
      'match:start',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'match:cancel',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'match:leave',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'chat:send',
      expect.any(Function)
    );
    expect(mockSocket.on).toHaveBeenCalledWith(
      'disconnect',
      expect.any(Function)
    );
  });

  it('當收到 match:start 事件時，應該呼叫 handleMatchStart', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    // 直接獲取並呼叫事件處理程序
    const onMock = vi.mocked(mockSocket.on);
    if (!onMock) {
      return;
    }

    const matchStartHandler = onMock.mock.calls.find(
      (call) => call[0] === 'match:start'
    )?.[1] as ((device: string) => void) | undefined;

    expect(matchStartHandler).toBeDefined();

    const device = 'PC';
    if (matchStartHandler) {
      matchStartHandler(device);
    }

    expect(mockMatchHandlers.handleMatchStart).toHaveBeenCalledWith({
      device,
      socketId: mockSocket.id,
    });
  });

  it('當收到 match:cancel 事件時，應該呼叫 handleMatchCancel', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    // 直接獲取並呼叫事件處理程序
    const onMock = vi.mocked(mockSocket.on);
    if (!onMock) {
      return;
    }

    const matchCancelHandler = onMock.mock.calls.find(
      (call) => call[0] === 'match:cancel'
    )?.[1] as (() => void) | undefined;

    expect(matchCancelHandler).toBeDefined();

    if (matchCancelHandler) {
      matchCancelHandler();
    }

    expect(mockMatchHandlers.handleMatchCancel).toHaveBeenCalledWith(
      mockSocket.id
    );
  });

  it('當收到 match:leave 事件時，應該呼叫 handleMatchLeave', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    // 直接獲取並呼叫事件處理程序
    const onMock = vi.mocked(mockSocket.on);
    if (!onMock) {
      return;
    }

    const matchLeaveHandler = onMock.mock.calls.find(
      (call) => call[0] === 'match:leave'
    )?.[1] as ((userId: string) => void) | undefined;

    expect(matchLeaveHandler).toBeDefined();

    const userId = 'user123';
    if (matchLeaveHandler) {
      matchLeaveHandler(userId);
    }

    expect(mockMatchHandlers.handleMatchLeave).toHaveBeenCalledWith(userId);
  });

  it('當收到 chat:send 事件時，應該呼叫 handleChatSend', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    // 直接獲取並呼叫事件處理程序
    const onMock = vi.mocked(mockSocket.on);
    if (!onMock) {
      return;
    }

    const chatSendHandler = onMock.mock.calls.find(
      (call) => call[0] === 'chat:send'
    )?.[1] as ((data: any) => void) | undefined;

    expect(chatSendHandler).toBeDefined();

    const chatMessage = {
      content: '你好',
      roomId: 'room123',
      userId: 'user456',
    };

    if (chatSendHandler) {
      chatSendHandler(chatMessage);
    }

    expect(mockChatHandlers.handleChatSend).toHaveBeenCalledWith(chatMessage);
  });

  it('當斷開連接時，應該從等待池中移除使用者', () => {
    setupSocketServer(mockIo as Server);

    // 使用存儲的 callback
    if (!mockIo.connectionCallback) {
      return;
    }
    mockIo.connectionCallback(mockSocket as Socket);

    // 直接獲取並呼叫事件處理程序
    const onMock = vi.mocked(mockSocket.on);
    if (!onMock) {
      return;
    }

    const disconnectHandler = onMock.mock.calls.find(
      (call) => call[0] === 'disconnect'
    )?.[1] as (() => void) | undefined;

    expect(disconnectHandler).toBeDefined();

    if (disconnectHandler) {
      disconnectHandler();
    }

    expect(mockState.removeUserFromPool).toHaveBeenCalledWith(mockSocket.id);
  });
});
