import type { Device, SocketChatMessage } from '@packages/lib';
import type { Server } from 'socket.io';

import { ObjectId } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import chatMessageService from '@/services/chat-message.service';
import { createChatHandlers } from '@/socket/handlers/chat';

vi.mock('@/services/chat-message.service', () => ({
  default: {
    findChatMessagesByRoomId: vi.fn(),
    sendChatMessage: vi.fn(),
  },
}));

describe('Chat Handlers', () => {
  const mockIo = {
    emit: vi.fn(),
    to: vi.fn().mockReturnThis(),
  } as unknown as Server;

  describe('handleChatSend', () => {
    it('應該發送聊天訊息並通知房間內所有使用者', async () => {
      const chatHandlers = createChatHandlers(mockIo);
      const mockChatMessage: SocketChatMessage = {
        content: '你好',
        roomId: 'room123',
        userId: 'user456',
      };
      const mockNewChatMessage = {
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        content: '你好',
        createdAt: new Date(),
        device: 'PC' as Device,
        roomId: 'room123',
        userId: 'user456',
      };

      vi.mocked(chatMessageService.sendChatMessage).mockResolvedValue(
        mockNewChatMessage
      );

      await chatHandlers.handleChatSend(mockChatMessage);

      expect(chatMessageService.sendChatMessage).toHaveBeenCalledWith(
        mockChatMessage
      );
      expect(mockIo.to).toHaveBeenCalledWith(mockChatMessage.roomId);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:send', mockNewChatMessage);
    });
  });

  describe('handleChatLoad', () => {
    it('應該載入聊天訊息並通知房間內所有使用者', async () => {
      const chatHandlers = createChatHandlers(mockIo);
      const mockRoomId = 'room123';
      const mockChatMessages = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439011'),
          content: '你好',
          createdAt: new Date(),
          device: 'PC' as Device,
          roomId: mockRoomId,
          userId: 'user1',
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439022'),
          content: '你好嗎？',
          createdAt: new Date(),
          device: 'APP' as Device,
          roomId: mockRoomId,
          userId: 'user2',
        },
      ];

      vi.mocked(chatMessageService.findChatMessagesByRoomId).mockResolvedValue(
        mockChatMessages
      );

      await chatHandlers.handleChatLoad(mockRoomId);

      expect(chatMessageService.findChatMessagesByRoomId).toHaveBeenCalledWith(
        mockRoomId
      );
      expect(mockIo.to).toHaveBeenCalledWith(mockRoomId);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:load', mockChatMessages);
    });
  });
});
