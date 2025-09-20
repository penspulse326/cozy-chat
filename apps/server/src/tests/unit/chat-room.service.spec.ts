import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import chatRoomModel from '@/models/chat-room.model';
import chatRoomService from '@/services/chat-room.service';

vi.mock('@/models/chat-room.model', () => ({
  default: {
    createChatRoom: vi.fn(),
    findChatRoomById: vi.fn(),
  },
}));

describe('Chat Room Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChatRoom', () => {
    it('應該使用正確的載荷建立聊天室', async () => {
      const mockChatRoomUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const mockRoomId = new ObjectId('507f1f77bcf86cd799439022');
      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockRoomId,
      };
      vi.mocked(chatRoomModel.createChatRoom).mockResolvedValue(
        mockInsertResult
      );

      const result = await chatRoomService.createChatRoom(mockChatRoomUserIds);

      expect(result).toBe(mockInsertResult);
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatRoomModel.createChatRoom).mock
        .calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          createdAt: expect.any(Date),
          users: mockChatRoomUserIds,
        })
      );
    });

    it('當模型返回 null 時應拋出錯誤', async () => {
      const mockChatRoomUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      vi.mocked(chatRoomModel.createChatRoom).mockResolvedValue(null);

      await expect(
        chatRoomService.createChatRoom(mockChatRoomUserIds)
      ).rejects.toThrow('建立聊天室失敗');
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockChatRoomUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      vi.mocked(chatRoomModel.createChatRoom).mockRejectedValue(
        new Error('Create chat room failed')
      );

      await expect(
        chatRoomService.createChatRoom(mockChatRoomUserIds)
      ).rejects.toThrow('Create chat room failed');
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChatRoomById', () => {
    it('當找到聊天室時應返回聊天室', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatRoom = {
        _id: new ObjectId(mockRoomId),
        createdAt: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      vi.mocked(chatRoomModel.findChatRoomById).mockResolvedValue(mockChatRoom);

      const result = await chatRoomService.findChatRoomById(mockRoomId);
      expect(result).toBe(mockChatRoom);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledWith(mockRoomId);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });

    it('當找不到聊天室時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatRoomModel.findChatRoomById).mockResolvedValue(null);

      await expect(
        chatRoomService.findChatRoomById(mockRoomId)
      ).rejects.toThrow(`找不到聊天室: ${mockRoomId}`);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledWith(mockRoomId);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatRoomModel.findChatRoomById).mockRejectedValue(
        new Error('Find chat room failed')
      );

      await expect(
        chatRoomService.findChatRoomById(mockRoomId)
      ).rejects.toThrow('Find chat room failed');
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });
  });
});
