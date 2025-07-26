import express from 'express';
import http from 'http';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import { AppDataSource } from './config/db.config';
import userModel from './models/user.model';
import SocketServerService from './services/socket-server.service';

const port = process.env.PORT ?? '9001';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

async function addFakeData() {
  const newUser = await userModel.createUser({
    _id: 'user-123',
    device: 'APP',
    room_id: 'room-456',
    status: 'ACTIVE',
  });

  console.log('hello user', newUser);
}

async function startServer() {
  try {
    await AppDataSource.connect();

    new SocketServerService(new Server(server));

    server.listen(port, () => {
      console.log(`Server 啟動成功: *:${port}`);
    });
  } catch (error) {
    console.error('Server 啟動失敗:', error);
    process.exit(1);
  }
}

await startServer();

await addFakeData();
