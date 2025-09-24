import express from 'express';
import http from 'http';
// import { dirname } from 'path';
import { Server } from 'socket.io';

import { connectToDB, disconnectFromDB } from '@/config/db';
// import { fileURLToPath } from 'url';
import { setupCronJobs } from '@/jobs';
import { setupSocketServer } from '@/socket';

const port = process.env.PORT ?? '9001';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// app.get('/', (_, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

app.get('/health', (_, res) => {
  console.log('健康檢查');
  res.send('OK');
});

async function bootstrap() {
  const url =
    process.env.ENV === 'production'
      ? 'https://cozy-chat-penspulse.vercel.app'
      : 'http://localhost:3000';

  try {
    await connectToDB();

    setupSocketServer(
      new Server(server, {
        cors: {
          credentials: true,
          methods: ['GET', 'POST'],
          origin: url,
        },
      })
    );

    server.listen(port, () => {
      console.log(`Server 啟動成功: *:${port}`);
    });

    setupCronJobs();
  } catch (error) {
    console.error('Server 啟動失敗:', error);
    await disconnectFromDB();
    process.exit(1);
  }
}
await bootstrap();
