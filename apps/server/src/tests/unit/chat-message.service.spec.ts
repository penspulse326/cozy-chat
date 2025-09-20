import type { Device, UserStatus } from '@packages/lib';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import chatMessageModel from '@/models/chat-message.model';
import userModel from '@/models/user.model';
import chatMessageService from '@/services/chat-message.service';

vi.mock('@/models/chat-message.model', () => ({
  default: {
    createChatMessage: vi.fn(),
    findChatMessageById: vi.fn(),
    findChatMessagesByRoomId: vi.fn(),
  },
}));

vi.mock('@/models/user.model', () => ({
  default: {
    findUserById: vi.fn(),
  },
}));

describe('Chat Message Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
        createdAt: new Date(),
        device: mockDevice,
        id: '507f1f77bcf86cd799439033',
        roomId: mockChatMessageData.roomId,
        userId: mockChatMessageData.userId,
      };
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockChatMessageResult
      );

      const result = await chatMessageService.createChatMessage(
        mockChatMessageData,
        mockDevice
      );

      expect(result).toBe(mockChatMessageResult);
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatMessageModel.createChatMessage).mock
        .calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          content: mockChatMessageData.content,
          createdAt: expect.any(Date),
          device: mockDevice,
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
        _id: new ObjectId(mockMessageId),
        content: 'Hello world',
        createdAt: new Date(),
        device: 'APP' as Device,
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      vi.mocked(chatMessageModel.findChatMessageById).mockResolvedValue(
        mockChatMessage
      );

      const result =
        await chatMessageService.findChatMessageById(mockMessageId);
      expect(result).toBe(mockChatMessage);
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

  describe('findChatMessagesByRoomId', () => {
    it('當找到聊天訊息時應返回聊天訊息', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatMessages = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439033'),
          content: 'Hello world',
          createdAt: new Date(),
          device: 'APP' as Device,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439011',
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439034'),
          content: 'How are you?',
          createdAt: new Date(),
          device: 'PC' as Device,
          roomId: mockRoomId,
          userId: '507f1f77bcf86cd799439012',
        },
      ];

      vi.mocked(chatMessageModel.findChatMessagesByRoomId).mockResolvedValue(
        mockChatMessages
      );

      const result =
        await chatMessageService.findChatMessagesByRoomId(mockRoomId);
      expect(result).toBe(mockChatMessages);
      expect(chatMessageModel.findChatMessagesByRoomId).toHaveBeenCalledWith(
        mockRoomId
      );
      expect(chatMessageModel.findChatMessagesByRoomId).toHaveBeenCalledTimes(
        1
      );
    });

    it('當找不到聊天訊息時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatMessageModel.findChatMessagesByRoomId).mockResolvedValue(
        null
      );

      await expect(
        chatMessageService.findChatMessagesByRoomId(mockRoomId)
      ).rejects.toThrow(`找不到聊天室訊息: ${mockRoomId}`);
      expect(chatMessageModel.findChatMessagesByRoomId).toHaveBeenCalledWith(
        mockRoomId
      );
      expect(chatMessageModel.findChatMessagesByRoomId).toHaveBeenCalledTimes(
        1
      );
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatMessageModel.findChatMessagesByRoomId).mockRejectedValue(
        new Error('Find chat messages failed')
      );

      await expect(
        chatMessageService.findChatMessagesByRoomId(mockRoomId)
      ).rejects.toThrow('Find chat messages failed');
      expect(chatMessageModel.findChatMessagesByRoomId).toHaveBeenCalledTimes(
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
        _id: new ObjectId(mockChatMessageData.userId),
        createdAt: new Date(),
        device: 'APP' as Device,
        id: mockChatMessageData.userId,
        lastActiveAt: new Date(),
        roomId: mockChatMessageData.roomId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockChatMessage = {
        content: mockChatMessageData.content,
        createdAt: new Date(),
        device: mockUser.device,
        id: '507f1f77bcf86cd799439033',
        roomId: mockChatMessageData.roomId,
        userId: mockChatMessageData.userId,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockChatMessage
      );

      const result =
        await chatMessageService.sendChatMessage(mockChatMessageData);

      expect(result).toBe(mockChatMessage);
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
        _id: new ObjectId(mockChatMessageData.userId),
        createdAt: new Date(),
        device: 'APP' as Device,
        id: mockChatMessageData.userId,
        lastActiveAt: new Date(),
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
});
