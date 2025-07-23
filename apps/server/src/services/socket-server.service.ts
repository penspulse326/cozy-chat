import type { Server, Socket } from 'socket.io';

import { SocketEvent } from '@/types';

class SocketServerService {
  private readonly waitingUsers: string[] = [];

  constructor(private readonly io: Server) {
    io.on('connection', (socket: Socket) => {
      this.onClientConnect(socket);
    });
  }

  onClientConnect(socket: Socket) {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(SocketEvent.MATCH_START, () => {
      this.handleMatchRequest(socket);
    });

    socket.on(SocketEvent.MESSAGE_SEND, ({ message, roomId }) => {
      this.sendMessageToRoom(message, roomId);
    });

    socket.on('disconnect', () => {
      this.onClientDisconnect(socket);
    });
  }

  handleMatchRequest(socket: Socket) {
    const newUserId = socket.id;

    // 無人等待時加入 pool
    if (this.waitingUsers.length === 0) {
      this.waitingUsers.push(newUserId);
      console.log(`找不到等待中的用戶，${newUserId} 加入等待池`);
      console.log('waitingUsers', this.waitingUsers);
      return;
    }

    const peerUserId = this.waitingUsers.shift()!;

    // 配對成功
    this.processMatchSuccess(socket, newUserId, peerUserId);
  }

  async processMatchSuccess(
    socket: Socket,
    newUserId: string,
    peerUserId: string
  ) {
    const roomId = `room-${peerUserId}-${newUserId}`;

    await socket.join(roomId);
    await this.io.of('/').sockets.get(peerUserId)?.join(roomId);

    // 通知雙方配對成功，附帶 roomId
    this.io.to(roomId).emit('match:success', {
      userIds: [newUserId, peerUserId],
      roomId,
    });

    console.log(`配對成功: ${peerUserId} <-> ${newUserId} 房間 ID: ${roomId}`);
  }

  sendMessageToRoom(message: string, roomId: string) {
    this.io.to(roomId).emit(SocketEvent.MESSAGE_RECEIVE, message);
  }

  onClientDisconnect(socket: Socket) {
    const userId = socket.id;
    console.log('用戶斷開連線:', userId);
  }
}

export default SocketServerService;
