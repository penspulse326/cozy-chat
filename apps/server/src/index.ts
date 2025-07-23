import express from 'express';
import http from 'http';
import { dirname } from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.config';
import SocketServerService from './services/socket-server.service';

const port = process.env.PORT ?? '9001';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);
new SocketServerService(new Server(server));

app.get('/', (_, res) => {
  res.sendFile(__dirname + '/index.html');
});

connectDB();

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});
