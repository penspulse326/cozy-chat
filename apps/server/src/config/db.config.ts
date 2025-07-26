import { MongoClient } from 'mongodb';

import type { Db } from 'mongodb';

let client: MongoClient;
let db: Db;

async function connectToDB() {
  try {
    client = new MongoClient(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017'
    );
    db = client.db(process.env.DB_NAME ?? 'cozychat');
    await client.connect();
    console.log('DB 連線成功');
  } catch (error) {
    console.error('DB 連線錯誤：', error);
    throw error;
  }
}

async function disconnectFromDB() {
  await client.close();
  console.log('DB 已斷開連線');
}

export { connectToDB, db, disconnectFromDB };
