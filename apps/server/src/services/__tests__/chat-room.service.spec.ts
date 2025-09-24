import { beforeEach, describe, expect, it, vi } from 'vitest';

import chatRoomModel from '@/models/chat-room.model';
import chatRoomService from '@/services/chat-room.service';

vi.mock('@/models/chat-room.model', () => ({
  default: {
    createChatRoom: vi.fn(),
    findAllChatRooms: vi.fn(),
    findChatRoomById: vi.fn(),
    removeMany: vi.fn(),
    removeUserFromChatRoom: vi.fn(),
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

  describe('removeUserFromChatRoom', () => {
    it('當成功移除使用者時應返回更新後的聊天室', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';
      const mockChatRoom = {
        createdAt: ANY_DATE,
        id: mockRoomId,
        users: ['507f1f77bcf86cd799439012'], // 已移除 mockUserId
      };

      vi.mocked(chatRoomModel.removeUserFromChatRoom).mockResolvedValue(
        mockChatRoom
      );

      const actual = await chatRoomService.removeUserFromChatRoom(
        mockRoomId,
        mockUserId
      );

      expect(actual).toEqual(mockChatRoom);
      expect(chatRoomModel.removeUserFromChatRoom).toHaveBeenCalledWith(
        mockRoomId,
        mockUserId
      );
      expect(chatRoomModel.removeUserFromChatRoom).toHaveBeenCalledTimes(1);
    });

    it('當找不到聊天室時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';

      vi.mocked(chatRoomModel.removeUserFromChatRoom).mockResolvedValue(null);

      await expect(
        chatRoomService.removeUserFromChatRoom(mockRoomId, mockUserId)
      ).rejects.toThrow(`從聊天室移除使用者失敗: ${mockUserId}`);
      expect(chatRoomModel.removeUserFromChatRoom).toHaveBeenCalledWith(
        mockRoomId,
        mockUserId
      );
      expect(chatRoomModel.removeUserFromChatRoom).toHaveBeenCalledTimes(1);
    });

    it('如果模型拋出錯誤時應拋出錯誤', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockUserId = '507f1f77bcf86cd799439011';

      vi.mocked(chatRoomModel.removeUserFromChatRoom).mockRejectedValue(
        new Error('Remove user from chat room failed')
      );

      await expect(
        chatRoomService.removeUserFromChatRoom(mockRoomId, mockUserId)
      ).rejects.toThrow('Remove user from chat room failed');
      expect(chatRoomModel.removeUserFromChatRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeEmptyChatRooms', () => {
    it('應該成功刪除所有使用者數量小於 2 的聊天室', async () => {
      const mockChatRooms = [
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439011',
          users: ['507f1f77bcf86cd799439001'], // 只有一個使用者
        },
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439012',
          users: ['507f1f77bcf86cd799439002', '507f1f77bcf86cd799439003'], // 兩個使用者
        },
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439013',
          users: [], // 沒有使用者
        },
      ];

      vi.mocked(chatRoomModel.findAllChatRooms).mockResolvedValue(
        mockChatRooms
      );
      vi.mocked(chatRoomModel.removeMany).mockResolvedValue(true);

      await chatRoomService.removeEmptyChatRooms();

      expect(chatRoomModel.removeMany).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439013',
      ]);
      expect(chatRoomModel.removeMany).toHaveBeenCalledTimes(1);
    });

    it('當沒有需要刪除的聊天室時不應呼叫 removeMany', async () => {
      const mockChatRooms = [
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439011',
          users: ['507f1f77bcf86cd799439001', '507f1f77bcf86cd799439002'],
        },
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439012',
          users: ['507f1f77bcf86cd799439003', '507f1f77bcf86cd799439004'],
        },
      ];

      vi.mocked(chatRoomModel.findAllChatRooms).mockResolvedValue(
        mockChatRooms
      );

      await chatRoomService.removeEmptyChatRooms();

      expect(chatRoomModel.removeMany).not.toHaveBeenCalled();
    });

    it('當查詢聊天室失敗時應拋出錯誤', async () => {
      vi.mocked(chatRoomModel.findAllChatRooms).mockResolvedValue(null);

      await expect(chatRoomService.removeEmptyChatRooms()).rejects.toThrow(
        '查詢聊天室失敗'
      );
      expect(chatRoomModel.removeMany).not.toHaveBeenCalled();
    });

    it('當刪除聊天室失敗時應拋出錯誤', async () => {
      const mockChatRooms = [
        {
          createdAt: ANY_DATE,
          id: '507f1f77bcf86cd799439011',
          users: ['507f1f77bcf86cd799439001'], // 只有一個使用者
        },
      ];

      vi.mocked(chatRoomModel.findAllChatRooms).mockResolvedValue(
        mockChatRooms
      );
      vi.mocked(chatRoomModel.removeMany).mockResolvedValue(false);

      await expect(chatRoomService.removeEmptyChatRooms()).rejects.toThrow(
        '刪除聊天室失敗: 507f1f77bcf86cd799439011'
      );
      expect(chatRoomModel.removeMany).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439011',
      ]);
    });
  });
});
