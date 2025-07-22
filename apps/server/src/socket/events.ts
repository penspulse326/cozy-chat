import type { Server, Socket } from 'socket.io';

import { SocketEvent } from '@/types';

/**
 * 設定 socket 連線
 * @param io - socket.io 實例
 */
export function setupSocketConnection(io: Server): void {
  io.on('connection', (socket: Socket) => {
    const newUserId = socket.id;
    console.log('新的用戶連線:', newUserId);

    subscribeEvent(socket, SocketEvent.SEND_MESSAGE, () => {
      console.log('傳送訊息到特定房間');
    });

    subscribeEvent(socket, SocketEvent.MATCH_START, () => {
      console.log('使用者請求配對');
    });
  });
}

/**
 * 訂閱事件
 * @param socket - client 實例
 * @param event - 事件名稱
 * @param callback - 事件處理函數
 */
function subscribeEvent(
  socket: Socket,
  event: string,
  callback: (...args: unknown[]) => void
): void {
  socket.on(event, callback);
}
