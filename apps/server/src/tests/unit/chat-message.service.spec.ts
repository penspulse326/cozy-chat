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
    it('should create chat message with correct payload', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };
      const mockDevice = 'APP';
      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId('507f1f77bcf86cd799439033'),
      };
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockInsertResult
      );

      const result = await chatMessageService.createChatMessage(
        mockChatMessageData,
        mockDevice
      );

      expect(result).toBe(mockInsertResult);
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatMessageModel.createChatMessage).mock
        .calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          content: mockChatMessageData.content,
          created_at: expect.any(Date),
          device: mockDevice,
          room_id: mockChatMessageData.roomId,
          user_id: mockChatMessageData.userId,
        })
      );
    });

    it('should throw error when model returns null', async () => {
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

    it('should throw error if model throws error', async () => {
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
    it('should return chat message when found', async () => {
      const mockMessageId = '507f1f77bcf86cd799439033';
      const mockChatMessage = {
        _id: new ObjectId(mockMessageId),
        content: 'Hello world',
        created_at: new Date(),
        device: 'APP' as Device,
        room_id: '507f1f77bcf86cd799439022',
        user_id: '507f1f77bcf86cd799439011',
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

    it('should throw error when chat message not found', async () => {
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

    it('should throw error if model throws error', async () => {
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
    it('should return chat messages when found', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatMessages = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439033'),
          content: 'Hello world',
          created_at: new Date(),
          device: 'APP' as Device,
          room_id: mockRoomId,
          user_id: '507f1f77bcf86cd799439011',
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439034'),
          content: 'How are you?',
          created_at: new Date(),
          device: 'PC' as Device,
          room_id: mockRoomId,
          user_id: '507f1f77bcf86cd799439012',
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

    it('should throw error when chat messages not found', async () => {
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

    it('should throw error if model throws error', async () => {
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
    it('should send chat message successfully and return new message', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockUser = {
        _id: new ObjectId(mockChatMessageData.userId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        room_id: mockChatMessageData.roomId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockInsertedId = new ObjectId('507f1f77bcf86cd799439033');

      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockInsertedId,
      };

      const mockChatMessage = {
        _id: mockInsertedId,
        content: mockChatMessageData.content,
        created_at: new Date(),
        device: mockUser.device,
        room_id: mockChatMessageData.roomId,
        user_id: mockChatMessageData.userId,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockInsertResult
      );
      vi.mocked(chatMessageModel.findChatMessageById).mockResolvedValue(
        mockChatMessage
      );

      const result =
        await chatMessageService.sendChatMessage(mockChatMessageData);

      expect(result).toBe(mockChatMessage);
      expect(userModel.findUserById).toHaveBeenCalledWith(
        mockChatMessageData.userId
      );
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledWith(
        mockInsertedId.toString()
      );
    });

    it('should throw error when user not found', async () => {
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

    it('should throw error when createChatMessage returns null', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockUser = {
        _id: new ObjectId(mockChatMessageData.userId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        room_id: mockChatMessageData.roomId,
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
      expect(chatMessageModel.findChatMessageById).not.toHaveBeenCalled();
    });

    it('should throw error when findChatMessageById returns null', async () => {
      const mockChatMessageData = {
        content: 'Hello world',
        roomId: '507f1f77bcf86cd799439022',
        userId: '507f1f77bcf86cd799439011',
      };

      const mockUser = {
        _id: new ObjectId(mockChatMessageData.userId),
        created_at: new Date(),
        device: 'APP' as Device,
        last_active_at: new Date(),
        room_id: mockChatMessageData.roomId,
        status: 'ACTIVE' as UserStatus,
      };

      const mockInsertedId = new ObjectId('507f1f77bcf86cd799439033');

      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockInsertedId,
      };

      vi.mocked(userModel.findUserById).mockResolvedValue(mockUser);
      vi.mocked(chatMessageModel.createChatMessage).mockResolvedValue(
        mockInsertResult
      );
      vi.mocked(chatMessageModel.findChatMessageById).mockResolvedValue(null);

      await expect(
        chatMessageService.sendChatMessage(mockChatMessageData)
      ).rejects.toThrow(`找不到聊天訊息: ${mockInsertedId.toString()}`);
      expect(userModel.findUserById).toHaveBeenCalledWith(
        mockChatMessageData.userId
      );
      expect(chatMessageModel.createChatMessage).toHaveBeenCalledTimes(1);
      expect(chatMessageModel.findChatMessageById).toHaveBeenCalledWith(
        mockInsertedId.toString()
      );
    });
  });
});
