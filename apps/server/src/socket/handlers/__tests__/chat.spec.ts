import chatMessageService from '@/services/chat-message.service';
import { CHAT_EVENT } from '@packages/lib';
import { vi } from 'vitest';
import { createChatHandlers, type ChatTimer } from '../chat';

vi.mock('@/services/chat-message.service');

describe('chatHandlers', () => {
  let ioMock: any;
  let chatMessageServiceMock: any;
  let timerMap: Map<string, ChatTimer>;

  beforeEach(() => {
    ioMock = {
      to: vi.fn().mockReturnThis(),
      emit: vi.fn(),
    };
    // Mock chatMessageService
    chatMessageServiceMock = {
      sendChatMessage: vi.fn().mockResolvedValue({
        _id: 'new-message-id',
        userId: 'user1',
        roomId: 'room1',
        content: 'test message',
        createdAt: new Date().toISOString(),
        isRead: false,
      }),
      findChatMessagesByRoomId: vi.fn(),
      markAsRead: vi.fn(),
    };
    vi.mocked(chatMessageService).sendChatMessage.mockImplementation(chatMessageServiceMock.sendChatMessage);
    vi.mocked(chatMessageService).findChatMessagesByRoomId.mockImplementation(chatMessageServiceMock.findChatMessagesByRoomId);
    vi.mocked(chatMessageService).markAsRead.mockImplementation(chatMessageServiceMock.markAsRead);

    // Resetting the timerMap for each test to ensure isolation
    // The timerMap is internal to createChatHandlers, so we need to get a new instance each time
    const chatHandlers = createChatHandlers(ioMock);
    // To access the internal timerMap, we need to export it from chat.ts
    // For now, we'll assume createChatHandlers always creates a new, empty map
    // If createChatHandlers is refactored to reuse a single timerMap instance, this will need adjustment.

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('checkMessageRate', () => {
    it('應該在速率限制內允許發送訊息', async () => {
      const { handleChatSend } = createChatHandlers(ioMock);
      const userId = 'user1';
      const roomId = 'room1';
      const data = { userId, roomId, message: 'test message' };

      // 發送 5 條訊息
      for (let i = 0; i < 5; i++) {
        await handleChatSend(data);
      }

      vi.advanceTimersByTime(100); // 確保在 2 秒內
      expect(chatMessageServiceMock.sendChatMessage).toHaveBeenCalledTimes(5);
      expect(ioMock.emit).toHaveBeenCalledTimes(5);
    });

    it('應該在超過速率限制時阻擋用戶並發送 BLOCK 事件', async () => {
      const { handleChatSend } = createChatHandlers(ioMock);
      const userId = 'user1';
      const roomId = 'room1';
      const data = { userId, roomId, message: 'test message' };

      // 發送 5 條訊息
      for (let i = 0; i < 5; i++) {
        await handleChatSend(data);
      }
      // 第 6 條訊息應該被阻擋
      await handleChatSend(data);

      expect(ioMock.to).toHaveBeenCalledWith(roomId);
      expect(ioMock.emit).toHaveBeenCalledWith(CHAT_EVENT.BLOCK, { error: 'Too many messages', userId });
      expect(chatMessageServiceMock.sendChatMessage).toHaveBeenCalledTimes(5); // 只有前 5 條被處理
    });

    it('應該在被阻擋時不允許用戶發送訊息', async () => {
      const { handleChatSend } = createChatHandlers(ioMock);
      const userId = 'user1';
      const roomId = 'room1';
      const data = { userId, roomId, message: 'test message' };

      // 觸發阻擋
      for (let i = 0; i < 6; i++) {
        await handleChatSend(data);
      }

      ioMock.emit.mockClear(); // 清除之前的 emit 呼叫

      // 被阻擋時嘗試發送訊息
      await handleChatSend(data);
      await handleChatSend(data);

      expect(chatMessageServiceMock.sendChatMessage).toHaveBeenCalledTimes(5); // 仍然是 5 條
      expect(ioMock.emit).not.toHaveBeenCalledWith(CHAT_EVENT.SEND, expect.any(Object));
    });

    it('應該在超時後解除阻擋並允許用戶再次發送訊息', async () => {
      const { handleChatSend } = createChatHandlers(ioMock);
      const userId = 'user1';
      const roomId = 'room1';
      const data = { userId, roomId, message: 'test message' };

      // 觸發阻擋
      for (let i = 0; i < 6; i++) {
        await handleChatSend(data);
      }

      expect(ioMock.emit).toHaveBeenCalledWith(CHAT_EVENT.BLOCK, { error: 'Too many messages', userId });
      ioMock.emit.mockClear(); // 清除之前的 emit 呼叫

      // 快轉時間以解除阻擋 (10 秒 + 1ms)
      vi.advanceTimersByTime(10001);

      expect(ioMock.emit).toHaveBeenCalledWith(CHAT_EVENT.UNBLOCK, { userId });
      ioMock.emit.mockClear(); // 清除 UNBLOCK 呼叫

      // 解除阻擋後發送訊息
      await handleChatSend(data);

      expect(chatMessageServiceMock.sendChatMessage).toHaveBeenCalledTimes(6); // 加上解除阻擋後的 1 條
      expect(ioMock.emit).toHaveBeenCalledWith(CHAT_EVENT.SEND, expect.any(Object));
    });
  });

  describe('handleChatSend', () => {
    it('應該在未被阻擋時成功發送聊天訊息', async () => {
      chatMessageServiceMock.sendChatMessage.mockResolvedValue({
        userId: 'user1',
        roomId: 'room1',
        message: 'hello',
      });
      const { handleChatSend } = createChatHandlers(ioMock);
      const data = { userId: 'user1', roomId: 'room1', message: 'hello' };

      await handleChatSend(data);

      expect(chatMessageServiceMock.sendChatMessage).toHaveBeenCalledWith(data);
      expect(ioMock.to).toHaveBeenCalledWith('room1');
      expect(ioMock.emit).toHaveBeenCalledWith(CHAT_EVENT.SEND, {
        userId: 'user1',
        roomId: 'room1',
        message: 'hello',
      });
    });

    it('應該在被阻擋時不發送聊天訊息', async () => {
      const { handleChatSend } = createChatHandlers(ioMock);
      const userId = 'user1';
      const roomId = 'room1';
      const data = { userId, roomId, message: 'test message' };

      // 觸發阻擋
      for (let i = 0; i < 6; i++) {
        await handleChatSend(data);
      }
      chatMessageServiceMock.sendChatMessage.mockClear();
      ioMock.emit.mockClear();

      await handleChatSend(data); // 嘗試發送被阻擋的訊息

      expect(chatMessageServiceMock.sendChatMessage).not.toHaveBeenCalled();
      expect(ioMock.emit).not.toHaveBeenCalledWith(CHAT_EVENT.SEND, expect.any(Object));
    });
  });
});
