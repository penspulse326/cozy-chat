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
  const ANY_DATE = expect.any(Date);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChatRoom', () => {
    it('應該使用正確的載荷建立聊天室', async () => {
      const mockChatRoomUserIds = [
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      ];
      const mockRoomId = 'mockRoomId';
      vi.mocked(chatRoomModel.createChatRoom).mockResolvedValue({
        createdAt: ANY_DATE,
        id: mockRoomId,
        users: mockChatRoomUserIds,
      });

      const actual = await chatRoomService.createChatRoom(mockChatRoomUserIds);

      expect(actual).toEqual({
        createdAt: ANY_DATE,
        id: mockRoomId,
        users: mockChatRoomUserIds,
      });
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatRoomModel.createChatRoom).mock
        .calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          createdAt: ANY_DATE,
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
        _id: 'mockRoomId',
        createdAt: ANY_DATE,
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      vi.mocked(chatRoomModel.findChatRoomById).mockResolvedValue({
        createdAt: mockChatRoom.createdAt,
        id: mockRoomId,
        users: mockChatRoom.users,
      });

      const actual = await chatRoomService.findChatRoomById(mockRoomId);
      expect(actual).toEqual({
        createdAt: ANY_DATE,
        id: mockRoomId,
        users: mockChatRoom.users,
      });
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
