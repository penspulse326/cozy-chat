import type { Device, SocketChatMessage } from '@packages/lib';
import type { Server } from 'socket.io';

import { ObjectId } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import chatMessageService from '@/services/chat-message.service';
import { createChatHandlers } from '@/socket/handlers/chat';

vi.mock('@/services/chat-message.service', () => ({
  default: {
    findChatMessagesByRoomId: vi.fn(),
    markAsRead: vi.fn(),
    sendChatMessage: vi.fn(),
  },
}));

describe('Chat Handlers', () => {
  const mockIo = {
    emit: vi.fn(),
    to: vi.fn().mockReturnThis(),
  } as unknown as Server;

  describe('handleChatRead', () => {
    it('應該將訊息標記為已讀並通知房間內所有使用者', async () => {
      const chatHandlers = createChatHandlers(mockIo);
      const messageId = new ObjectId().toHexString();
      const userId = new ObjectId().toHexString();
      const roomId = 'room-123';

      const updatedMessage = {
        content: '已讀訊息',
        createdAt: new Date(),
        device: 'PC' as Device,
        id: messageId,
        isRead: true,
        roomId: roomId,
        userId: userId,
      };

      vi.mocked(chatMessageService.markAsRead).mockResolvedValue(
        updatedMessage
      );

      await chatHandlers.handleChatRead(messageId);

      expect(chatMessageService.markAsRead).toHaveBeenCalledWith(messageId);
      expect(mockIo.to).toHaveBeenCalledWith(roomId);
      expect(mockIo.emit).toHaveBeenCalledWith('chat:read', updatedMessage);
    });
  });

  describe('handleChatSend', () => {
    it('應該發送聊天訊息並通知房間內所有使用者', async () => {
      const chatHandlers = createChatHandlers(mockIo);
      const mockChatMessage: SocketChatMessage = {
        content: '你好',
        roomId: 'room123',
        userId: 'user456',
      };
      const mockNewChatMessage = {
        content: '你好',
        createdAt: new Date(),
        device: 'PC' as Device,
        id: new ObjectId('507f1f77bcf86cd799439011').toHexString(),
        isRead: false,
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
          content: '你好',
          createdAt: new Date(),
          device: 'PC' as Device,
          id: new ObjectId('507f1f77bcf86cd799439011').toHexString(),
          isRead: false,
          roomId: mockRoomId,
          userId: 'user1',
        },
        {
          content: '你好嗎？',
          createdAt: new Date(),
          device: 'APP' as Device,
          id: new ObjectId('507f1f77bcf86cd799439022').toHexString(),
          isRead: false,
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
