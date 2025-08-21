import type { Server, Socket } from 'socket.io';

import { ObjectId } from 'mongodb';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ChatHandlers } from '@/socket/handlers/chat';

import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';
import { createUserHandlers } from '@/socket/handlers/user';

vi.mock('@/services/chat-room.service', () => ({
  default: {
    findChatRoomById: vi.fn(),
  },
}));

vi.mock('@/services/user.service', () => ({
  default: {
    checkUserStatus: vi.fn(),
  },
}));

describe('User Handlers', () => {
  let mockIo: Partial<Server>;
  let mockSocket: Partial<Socket>;
  let mockSocketsMap: Map<string, Socket>;
  let mockChatHandlers: Partial<ChatHandlers>;

  beforeEach(() => {
    mockSocket = {
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
    };

    mockSocketsMap = new Map();
    mockSocketsMap.set('socket1', mockSocket as unknown as Socket);

    mockIo = {
      emit: vi.fn(),
      of: vi.fn().mockReturnValue({
        sockets: {
          get: vi.fn((id: string) => mockSocketsMap.get(id)),
        },
      }),
      to: vi.fn().mockReturnThis(),
    };

    mockChatHandlers = {
      handleChatLoad: vi.fn(),
      handleChatSend: vi.fn(),
    };

    vi.clearAllMocks();
  });

  describe('handleCheckUser', () => {
    it('當聊天室存在時，應該加入房間並載入聊天訊息', async () => {
      const userHandlers = createUserHandlers(
        mockIo as unknown as Server,
        mockChatHandlers as ChatHandlers
      );
      const socketId = 'socket1';
      const roomId = 'room123';

      vi.mocked(chatRoomService.findChatRoomById).mockResolvedValue({
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        created_at: new Date(),
        users: ['user1', 'user2'],
      });

      vi.mocked(userService.checkUserStatus).mockResolvedValue(false);

      await userHandlers.handleCheckUser(socketId, roomId);

      expect(chatRoomService.findChatRoomById).toHaveBeenCalledWith(roomId);
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);
      expect(mockChatHandlers.handleChatLoad).toHaveBeenCalledWith(roomId);
      expect(userService.checkUserStatus).toHaveBeenCalledWith(roomId);
      expect(mockSocket.emit).not.toHaveBeenCalled();
    });

    it('當聊天室不存在時，應該發送重連失敗事件', async () => {
      const userHandlers = createUserHandlers(
        mockIo as unknown as Server,
        mockChatHandlers as ChatHandlers
      );
      const socketId = 'socket1';
      const roomId = 'nonexistent';

      vi.mocked(chatRoomService.findChatRoomById).mockRejectedValue(
        new Error('找不到聊天室')
      );

      await userHandlers.handleCheckUser(socketId, roomId);

      expect(chatRoomService.findChatRoomById).toHaveBeenCalledWith(roomId);
      expect(mockIo.to).toHaveBeenCalledWith(socketId);
      expect(mockIo.emit).toHaveBeenCalledWith('match:reconnect-fail');
      expect(mockSocket.join).not.toHaveBeenCalled();
      expect(mockChatHandlers.handleChatLoad).not.toHaveBeenCalled();
    });

    it('當使用者已離開時，應該發送離開事件', async () => {
      const userHandlers = createUserHandlers(
        mockIo as unknown as Server,
        mockChatHandlers as ChatHandlers
      );
      const socketId = 'socket1';
      const roomId = 'room123';

      vi.mocked(chatRoomService.findChatRoomById).mockResolvedValue({
        _id: new ObjectId('507f1f77bcf86cd799439011'),
        created_at: new Date(),
        users: ['user1', 'user2'],
      });

      vi.mocked(userService.checkUserStatus).mockResolvedValue(true);

      await userHandlers.handleCheckUser(socketId, roomId);

      expect(chatRoomService.findChatRoomById).toHaveBeenCalledWith(roomId);
      expect(mockSocket.join).toHaveBeenCalledWith(roomId);
      expect(mockChatHandlers.handleChatLoad).toHaveBeenCalledWith(roomId);
      expect(userService.checkUserStatus).toHaveBeenCalledWith(roomId);
      expect(mockSocket.emit).toHaveBeenCalledWith('match:leave');
    });
  });
});
