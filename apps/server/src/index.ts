import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const port = process.env.PORT ?? '9001';

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

const waitingUsers: string[] = [];

io.on('connection', (socket) => {
  const newUserId = socket.id;
  console.log('新的用戶連線:', newUserId);

  // 使用者請求配對
  socket.on('match:start', async () => {
    if (waitingUsers.length > 0) {
      const peerUserId = waitingUsers.shift();

      if (!peerUserId) {
        return;
      }

      const roomId = `room-${peerUserId}-${newUserId}`;

      await socket.join(roomId);
      await io.sockets.sockets.get(peerUserId)?.join(roomId);

      // 通知雙方配對成功，附帶 roomId
      socket.emit('match:success', { peerId: peerUserId, roomId });
      io.to(peerUserId).emit('match:success', {
        peerId: newUserId,
        roomId,
      });
      console.log(
        `配對成功: ${peerUserId} <-> ${newUserId} 房間 ID: ${roomId}`
      );
    } else {
      waitingUsers.push(newUserId); // 尚無人等待，加入 pool
      console.log(`用戶 ${newUserId} 加入等待池`);
    }
  });

  // 傳送訊息到特定房間
  socket.on('chat:message', ({ message, roomId }) => {
    io.to(roomId as string).emit('chat:message', message);
  });
});

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
