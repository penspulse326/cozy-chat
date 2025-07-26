import express from 'express';
import http from 'http';
import { ObjectId } from 'mongodb';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';

import { connectToDB, db, disconnectFromDB } from './config/db';
import UserModel from './models/user.model';
import SocketServer from './socket';

const port = process.env.PORT ?? '9001';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

async function addFakeData() {
  const fakeId = new ObjectId().toHexString();
  const userModel = new UserModel(db);
  const currentTime = new Date();
  const newUser = await userModel.createUser({
    _id: fakeId,
    device: 'APP',
    status: 'ACTIVE',
    last_active_at: currentTime,
    created_at: currentTime,
  });

  console.log('hello user', newUser);

  const user = await userModel.getUserById(fakeId);
  console.log('find user', user);
}

async function bootstrap() {
  try {
    await connectToDB();
    new SocketServer(new Server(server));

    server.listen(port, () => {
      console.log(`Server 啟動成功: *:${port}`);
    });
  } catch (error) {
    console.error('Server 啟動失敗:', error);
    await disconnectFromDB();
    process.exit(1);
  }
}
await bootstrap();
await addFakeData();
