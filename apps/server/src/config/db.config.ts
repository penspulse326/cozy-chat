import { MongoClient } from 'mongodb';

import type { Db } from 'mongodb';

export class DataSource {
  private client: MongoClient;
  private db: Db;

  constructor() {
    const username = process.env.MONGO_ROOT_USERNAME;
    const password = process.env.MONGO_ROOT_PASSWORD;

    console.log('MongoDB 帳號:', username, '密碼:', password);

    if (!username || !password) {
      throw new Error(
        'MongoDB username and password must be provided in environment variables.'
      );
    }

    this.client = new MongoClient(
      process.env.MONGODB_URI ?? 'mongodb://localhost:27017',
      {
        auth: {
          password: password,
          username: username,
        },
        // 加上這個選項，指定身份驗證資料庫
        authSource: 'admin',
      }
    );
    this.db = this.client.db(process.env.DB_NAME ?? 'cozychat');
  }

  async connect() {
    try {
      await this.client.connect();
      console.log('DB 連線成功');
    } catch (error) {
      console.error('DB 連線錯誤：', error);
      process.exit(1);
    }
  }

  async disconnect() {
    await this.client.close();
    console.log('DB 已斷開連線');
  }

  getDb() {
    return this.db;
  }
}

export const AppDataSource = new DataSource();
