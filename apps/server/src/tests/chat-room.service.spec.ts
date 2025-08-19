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
    it('should create chat room with correct payload', async () => {
      // Arrange
      const mockUserIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const mockRoomId = new ObjectId('507f1f77bcf86cd799439022');
      const mockInsertResult = {
        acknowledged: true,
        insertedId: mockRoomId,
      };
      vi.mocked(chatRoomModel.createChatRoom).mockResolvedValue(mockInsertResult);

      // Act
      const result = await chatRoomService.createChatRoom(mockUserIds);

      // Assert
      expect(result).toBe(mockInsertResult);
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
      const calledWith = vi.mocked(chatRoomModel.createChatRoom).mock.calls[0][0];
      expect(calledWith).toEqual(
        expect.objectContaining({
          created_at: expect.any(Date),
          users: mockUserIds,
        })
      );
    });

    it('should return null when model returns null', async () => {
      // Arrange
      const mockUserIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      vi.mocked(chatRoomModel.createChatRoom).mockResolvedValue(null);

      // Act
      const result = await chatRoomService.createChatRoom(mockUserIds);

      // Assert
      expect(result).toBeNull();
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
    });

    it('should throw error if model throws error', async () => {
      // Arrange
      const mockUserIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      vi.mocked(chatRoomModel.createChatRoom).mockRejectedValue(
        new Error('Create chat room failed')
      );

      // Act & Assert
      await expect(chatRoomService.createChatRoom(mockUserIds)).rejects.toThrow(
        'Create chat room failed'
      );
      expect(chatRoomModel.createChatRoom).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChatRoomById', () => {
    it('should return chat room when found', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatRoom = {
        _id: new ObjectId(mockRoomId),
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      vi.mocked(chatRoomModel.findChatRoomById).mockResolvedValue(mockChatRoom);

      const result = await chatRoomService.findChatRoomById(mockRoomId);
      expect(result).toBe(mockChatRoom);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledWith(mockRoomId);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });

    it('should return null when chat room not found', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatRoomModel.findChatRoomById).mockResolvedValue(null);

      const result = await chatRoomService.findChatRoomById(mockRoomId);
      expect(result).toBeNull();
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledWith(mockRoomId);
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });

    it('should throw error if model throws error', async () => {
      const mockRoomId = '507f1f77bcf86cd799439022';

      vi.mocked(chatRoomModel.findChatRoomById).mockRejectedValue(
        new Error('Find chat room failed')
      );

      await expect(chatRoomService.findChatRoomById(mockRoomId)).rejects.toThrow(
        'Find chat room failed'
      );
      expect(chatRoomModel.findChatRoomById).toHaveBeenCalledTimes(1);
    });
  });
});
