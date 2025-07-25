import express from 'express';
import http from 'http';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.config';
import ChatRoom from './models/chat-room.model';
import MatchedUser from './models/matched-user.model';
import SocketServerService from './services/socket-server.service';

import type { User } from '@packages/lib';
import type { HydratedDocument } from 'mongoose';

const port = process.env.PORT ?? '9001';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
new SocketServerService(new Server(server));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

async function addFakeData() {
  const newUser: HydratedDocument<User> = new MatchedUser({
    device: 'APP',
    status: 'active',
  });

  await newUser.save();

  const newRoom = new ChatRoom({
    _id: '1',
    users: ['1'],
  });

  await newRoom.save();
  await ChatRoom.create({
    _id: '1',
    users: ['999'],
  });

  console.log('fake data added');
}

async function startServer() {
  try {
    await connectDB();

    server.listen(port, () => {
      console.log(`server 啟動成功: *:${port}`);
    });

    await addFakeData();
  } catch (error) {
    console.error('server 啟動失敗:', error);
    process.exit(1);
  }
}

await startServer();
