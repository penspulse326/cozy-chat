import { Server, Socket } from 'socket.io';

import { CHAT_EVENT } from '@/types';

class SocketServerService {
  private waitingUsers: string[] = [];

  constructor(private readonly io: Server) {
    io.on('connection', (socket: Socket) => {
      this.onClientConnect(socket);
    });
  }

  private onClientConnect(socket: Socket) {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    socket.on(CHAT_EVENT.MATCH_START, () => {
      this.handleMatchRequest(socket.id);
    });

    socket.on(CHAT_EVENT.CHAT_SEND, ({ message, roomId }) => {
      this.sendMessageToRoom(message, roomId);
    });

    socket.on('disconnect', () => {
      this.onClientDisconnect(socket);
    });
  }

  private handleMatchRequest(newUserId: string) {
    // 無人等待時加入等待池
    if (this.waitingUsers.length === 0) {
      this.addWaitingUser(newUserId);
      return;
    }

    // 從等待池中移除用戶
    const peerUserId = this.waitingUsers.shift();

    if (!peerUserId) {
      this.addWaitingUser(newUserId);
      return;
    }

    // 配對成功
    this.processMatchSuccess(newUserId, peerUserId);
  }

  private addWaitingUser(newUserId: string) {
    this.waitingUsers.push(newUserId);
    console.log(`找不到等待中的用戶，${newUserId} 加入等待池`);

    setTimeout(() => {
      if (this.waitingUsers.includes(newUserId)) {
        this.waitingUsers = this.waitingUsers.filter(
          (userId) => userId !== newUserId
        );

        console.log(`${newUserId} 等待超時，從等待池移除`);
        this.io.of('/').sockets.get(newUserId)?.emit(CHAT_EVENT.MATCH_FAIL);
      }
    }, 3000);
  }

  private async processMatchSuccess(newUserId: string, peerUserId: string) {
    const roomId = `room-${peerUserId}-${newUserId}`;

    await this.io.of('/').sockets.get(newUserId)?.join(roomId);
    await this.io.of('/').sockets.get(peerUserId)?.join(roomId);

    // 通知雙方配對成功，附帶 roomId
    this.io.to(roomId).emit(CHAT_EVENT.MATCH_SUCCESS, {
      userIds: [newUserId, peerUserId],
      roomId,
    });

    console.log(`配對成功: ${peerUserId} <-> ${newUserId} 房間 ID: ${roomId}`);
  }

  private sendMessageToRoom(message: string, roomId: string) {
    this.io.to(roomId).emit(CHAT_EVENT.CHAT_RECEIVE, message);
  }

  private onClientDisconnect(socket: Socket) {
    const userId = socket.id;
    console.log('用戶斷開連線:', userId);
  }
}

export default SocketServerService;
