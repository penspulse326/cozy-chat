import type { ChatMessageDto, Device, UserStatus } from '@packages/lib';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';
import chatMessageService from '@/services/chat-message.service';

vi.mock('@/models/chat-message.model', () => ({
  default: {
    createChatMessage: vi.fn(),
    findChatMessageById: vi.fn(),
    findChatMessagesByRoomIds: vi.fn(),
    removeManyByRoomIds: vi.fn(),
    updateChatMessage: vi.fn(), // Add mock for update
  },
}));

vi.mock('@/models/user.model', () => ({
  default: {
    findUserById: vi.fn(),
  },
}));

describe('Chat Message Service', () => {
  const ANY_DATE = expect.any(Date);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('markAsRead', () => {
    it('應該成功將訊息標記為已讀', async () => {
      const messageId = 'message-1';

      const mockMessage = {
        content: 'Hello',
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: messageId,
        isRead: false,
        roomId: 'room-1',
        userId: 'user-1',
      };

      const updatedMessage = { ...mockMessage, isRead: true };

      vi.mocked(chatMessageModel.updateChatMessage).mockResolvedValue(
        updatedMessage as ChatMessageDto
      );

      const result = await chatMessageService.markAsRead(messageId);

      expect(chatMessageModel.updateChatMessage).toHaveBeenCalledWith(
        messageId,
        { isRead: true }
      );
      expect(result).toEqual(updatedMessage);
    });

    it('當更新訊息失敗時應拋出錯誤', async () => {
      const messageId = 'message-1';

      vi.mocked(chatMessageModel.updateChatMessage).mockResolvedValue(null);

      await expect(chatMessageService.markAsRead(messageId)).rejects.toThrow(
        '更新聊天訊息失敗'
      );

      expect(chatMessageModel.updateChatMessage).toHaveBeenCalledWith(
        messageId,
        { isRead: true }
      );
    });
  });

  describe('createChatMessage', () => {
    it('應該使用正確的載荷建立聊天訊息', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };
      const mockDevice = 'APP';
      const mockChatMessageResult = {
        content: 'Hello world',
        createdAt: ANY_DATE,
        device: mockDevice as Device,
        id: '507f1f77bcf86cd799439033',
        isRead: false,
        roomId: mockChatMessageData.roomId,
        userId: mockChatMessageData.userId,
      };
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockChatMessageResult as ChatMessageDto
      );

      const actual = await chatMessageService.createChatMessage(
        mockChatMessageData,
        mockDevice
      );

      expect(actual).toBe(mockChatMessageResult);
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatMessageModel.createChatMessage).mock
        .calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          content: mockChatMessageData.content,
          createdAt: ANY_DATE,
          device: mockDevice as Device,
          roomId: mockChatMessageData.roomId,
          userId: mockChatMessageData.userId,
        })
      );
    });

    it('當模型返回 null 時應拋出錯誤', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };
      const mockDevice = 'APP';
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(null);

      await expect(
        chatMessageService.createChatMessage(mockChatMessageData, mockDevice)
      ).rejects.toThrow('建立聊天訊息失敗');

      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };
      const mockDevice = 'APP';
      vi.mocked(chatMessageModel.createChatMessage).mockRejectedValue(
        new Error('Create chat message failed')
      );

      await expect(
        chatMessageService.createChatMessage(mockChatMessageData, mockDevice)
      ).rejects.toThrow('Create chat message failed');
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChatMessageById', () => {
    it('當找到聊天訊息時應返回聊天訊息', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      const mockChatMessage = {
        _id: '507f1f77bcf86cd799439033',
        content: 'Hello world',
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockMessageId,
        isRead: false,
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      vi.mocked(chatMessageModel.findChatMessageById).mockResolvedValue(
        mockChatMessage as ChatMessageDto
      );

      const actual =
        await chatMessageService.findChatMessageById(mockMessageId);
      expect(actual).toEqual(mockChatMessage);
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledWith(
        mockMessageId
      );
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledTimes(1);
    });

    it('當找不到聊天訊息時應拋出錯誤', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';

      vi.mocked(chatMessageModel.findChatMessageById).mockResolvedValue(null);

      await expect(
        chatMessageService.findChatMessageById(mockMessageId)
      ).rejects.toThrow(`找不到聊天訊息: ${mockMessageId}`);
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledWith(
        mockMessageId
      );
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';

      vi.mocked(chatMessageModel.findChatMessageById).mockRejectedValue(
        new Error('Find chat message failed')
      );

      await expect(
        chatMessageService.findChatMessageById(mockMessageId)
      ).rejects.toThrow('Find chat message failed');
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChatMessagesByRoomIds', () => {
    it('當找到聊天訊息時應返回聊天訊息', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatMessages = [
        {
          _id: 'mockMessageId1',
          content: 'Hello world',
          createdAt: ANY_DATE,
          device: 'APP' as Device,
          id: '507f1f77bcf86cd799439033',
          isRead: false,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439011',
        },
        {
          _id: 'mockMessageId2',
          content: 'How are you?',
          createdAt: ANY_DATE,
          device: 'PC' as Device,
          id: '507f1f77bcf86cd799439034',
          isRead: false,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439012',
        },
      ];

      vi.mocked(chatMessageModel.findChatMessagesByRoomIds).mockResolvedValue(
        mockChatMessages
      );

      const actual =
        await chatMessageService.findChatMessagesByRoomId(mockRoomId);
      expect(actual).toBe(mockChatMessages);
      expect(chatMessageModel.findChatMessagesByRoomIds).toHaveBeenCalledWith(
        mockRoomId
      );
      expect(chatMessageModel.findChatMessagesByRoomIds).toHaveBeenCalledTimes(
        1
      );
    });

    it('當找不到聊天訊息時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatMessageModel.findChatMessagesByRoomIds).mockResolvedValue(
        null
      );

      await expect(
        chatMessageService.findChatMessagesByRoomId(mockRoomId)
      ).rejects.toThrow(`找不到聊天室訊息: ${mockRoomId}`);
      expect(chatMessageModel.findChatMessagesByRoomIds).toHaveBeenCalledWith(
        mockRoomId
      );
      expect(chatMessageModel.findChatMessagesByRoomIds).toHaveBeenCalledTimes(
        1
      );
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatMessageModel.findChatMessagesByRoomIds).mockRejectedValue(
        new Error('Find chat messages failed')
      );

      await expect(
        chatMessageService.findChatMessagesByRoomId(mockRoomId)
      ).rejects.toThrow('Find chat messages failed');
      expect(chatMessageModel.findChatMessagesByRoomIds).toHaveBeenCalledTimes(
        1
      );
    });
  });

  describe('sendChatMessage', () => {
    it('應該成功發送聊天訊息並返回新訊息', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockUser = {
        _id: 'mockUserId',
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockChatMessageData.userId,
        lastActiveAt: ANY_DATE,
        roomId: mockChatMessageData.roomId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockChatMessage = {
        content: mockChatMessageData.content,
        createdAt: ANY_DATE,
        device: mockUser.device,
        id: '507f1f77bcf86cd799439033',
        isRead: false,
        roomId: mockChatMessageData.roomId,
        userId: mockChatMessageData.userId,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockChatMessage as ChatMessageDto
      );

      const actual =
        await chatMessageService.sendChatMessage(mockChatMessageData);

      expect(actual).toBe(mockChatMessage);
      expect(userModel.findUserById).toHaveBeenCalledWith(
        mockChatMessageData.userId
      );
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
    });

    it('當找不到使用者時應拋出錯誤', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(null);

      await expect(
        chatMessageService.sendChatMessage(mockChatMessageData)
      ).rejects.toThrow(`找不到使用者: ${mockChatMessageData.userId}`);
      expect(userModel.findUserById).toHaveBeenCalledWith(
        mockChatMessageData.userId
      );
      expect(chatMessageModel.createChatMessage).not.toHaveBeenCalled();
      expect(chatMessageModel.findChatMessageById).not.toHaveBeenCalled();
    });

    it('當 createChatMessage 返回 null 時應拋出錯誤', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockUser = {
        _id: 'mockUserId',
        createdAt: ANY_DATE,
        device: 'APP' as Device,
        id: mockChatMessageData.userId,
        lastActiveAt: ANY_DATE,
        roomId: mockChatMessageData.roomId,
        status: 'ACTIVE' as UserStatus,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(null);

      await expect(
        chatMessageService.sendChatMessage(mockChatMessageData)
      ).rejects.toThrow('建立聊天訊息失敗');
      expect(userModel.findUserById).toHaveBeenCalledWith(
        mockChatMessageData.userId
      );
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeManyByRoomIds', () => {
    it('應該成功刪除指定聊天室的所有訊息', async () => {
      const mockRoomIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];

      vi.mocked(chatMessageModel.removeManyByRoomIds).mockResolvedValue(true);

      await expect(
        chatMessageService.removeManyByRoomIds(mockRoomIds)
      ).resolves.not.toThrow();

      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledWith(
        mockRoomIds
      );
      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledTimes(1);
    });

    it('當刪除訊息失敗時應拋出錯誤', async () => {
      const mockRoomIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];

      vi.mocked(chatMessageModel.removeManyByRoomIds).mockResolvedValue(false);

      await expect(
        chatMessageService.removeManyByRoomIds(mockRoomIds)
      ).rejects.toThrow(`刪除聊天室訊息失敗: ${mockRoomIds.join(', ')}`);

      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledWith(
        mockRoomIds
      );
      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockRoomIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];

      vi.mocked(chatMessageModel.removeManyByRoomIds).mockRejectedValue(
        new Error('Remove chat messages failed')
      );

      await expect(
        chatMessageService.removeManyByRoomIds(mockRoomIds)
      ).rejects.toThrow('Remove chat messages failed');

      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledWith(
        mockRoomIds
      );
      expect(chatMessageModel.removeManyByRoomIds).toHaveBeenCalledTimes(1);
    });
  });
});
