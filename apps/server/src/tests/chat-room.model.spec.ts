import { CreateChatRoomSchema } from '@packages/lib';
import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/config/db';
import chatRoomModel from '@/models/chat-room.model';

vi.mock('@/config/db', () => ({
  db: {
    collection: vi.fn(),
  },
}));

vi.mock('@packages/lib', () => ({
  CreateChatRoomSchema: {
    parse: vi.fn().mockImplementation((data: unknown) => data),
  },
}));

describe('Chat Room Model', () => {
  const mockCollection = {
    findOne: vi.fn(),
    insertOne: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(db.collection).mockReturnValue(mockCollection as unknown as ReturnType<typeof db.collection>);
  });

  describe('createChatRoom', () => {
    it('should successfully create chat room and return result', async () => {
      // Arrange
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      const mockInsertResult = {
        acknowledged: true,
        insertedId: new ObjectId(),
      };

      mockCollection.insertOne.mockResolvedValue(mockInsertResult);

      // Act
      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      // Assert
      expect(result).toEqual(mockInsertResult);
      expect(db.collection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });

    it('should return null when validation fails', async () => {
      // Arrange
      const mockInvalidChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011'],
      };

      vi.mocked(CreateChatRoomSchema.parse).mockImplementationOnce(() => {
        throw new Error('Validation error');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Act
      const result = await chatRoomModel.createChatRoom(mockInvalidChatRoom);

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should return null when database operation fails', async () => {
      // Arrange
      const mockChatRoom = {
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };

      mockCollection.insertOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Act
      const result = await chatRoomModel.createChatRoom(mockChatRoom);

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(mockChatRoom);
    });
  });

  describe('findChatRoomById', () => {
    it('should successfully find chat room and return result', async () => {
      // Arrange
      const mockRoomId = '507f1f77bcf86cd799439022';
      const mockChatRoom = {
        _id: new ObjectId(mockRoomId),
        created_at: new Date(),
        users: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'],
      };
      mockCollection.findOne.mockResolvedValue(mockChatRoom);

      // Act
      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      // Assert
      expect(result).toEqual(mockChatRoom);
      expect(db.collection).toHaveBeenCalledWith('chat_rooms');
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when chat room does not exist', async () => {
      // Arrange
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockResolvedValue(null);

      // Act
      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      // Assert
      expect(result).toBeNull();
      expect(mockCollection.findOne).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
      });
    });

    it('should return null when database operation fails', async () => {
      // Arrange
      const mockRoomId = '507f1f77bcf86cd799439022';
      mockCollection.findOne.mockRejectedValue(new Error('DB Error'));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

      // Act
      const result = await chatRoomModel.findChatRoomById(mockRoomId);

      // Assert
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
