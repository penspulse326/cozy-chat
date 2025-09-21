import { MongoClient } from 'mongodb';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as dbModule from '@/config/db';

interface MockMongoClientInstance {
  close: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  db: ReturnType<typeof vi.fn>;
}

vi.mock('mongodb', () => {
  const mockDb = {
    collection: vi.fn(),
  };

  const mockMongoClient = vi.fn().mockImplementation(() => ({
    close: vi.fn().mockResolvedValue(undefined),
    connect: vi.fn().mockResolvedValue(undefined),
    db: vi.fn().mockReturnValue(mockDb),
  }));

  return {
    MongoClient: mockMongoClient,
  };
});

describe('Database Configuration', () => {
  const originalEnv = process.env;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let mockMongoClientInstance: MockMongoClientInstance;

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    process.env = { ...originalEnv };

    mockMongoClientInstance = {
      close: vi.fn().mockResolvedValue(undefined),
      connect: vi.fn().mockResolvedValue(undefined),
      db: vi.fn().mockReturnValue({ collection: vi.fn() }),
    };

    (
      vi.mocked(MongoClient) as unknown as ReturnType<typeof vi.fn>
    ).mockImplementation(() => mockMongoClientInstance);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('connectToDB', () => {
    it('應該使用預設值連接到數據庫', async () => {
      delete process.env.MONGODB_URI;
      delete process.env.DB_NAME;

      await dbModule.connectToDB();

      expect(MongoClient).toHaveBeenCalledWith(
        'mongodb://root:1234@localhost:27017'
      );
      expect(mockMongoClientInstance.db).toHaveBeenCalledWith('cozychat');
      expect(mockMongoClientInstance.connect).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('DB 連線成功');
    });

    it('應該使用環境變數連接到數據庫', async () => {
      process.env.MONGODB_URI = 'mongodb://user:pass@testhost:27017';
      process.env.DB_NAME = 'testdb';

      await dbModule.connectToDB();

      expect(MongoClient).toHaveBeenCalledWith(
        'mongodb://user:pass@testhost:27017'
      );
      expect(mockMongoClientInstance.db).toHaveBeenCalledWith('testdb');
    });

    it('當連接失敗時應拋出錯誤', async () => {
      const mockError = new Error('Connection failed');
      mockMongoClientInstance.connect.mockRejectedValueOnce(mockError);

      await expect(dbModule.connectToDB()).rejects.toThrow('Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('DB 連線錯誤：', mockError);
    });
  });

  describe('disconnectFromDB', () => {
    it('應該從數據庫斷開連接', async () => {
      await dbModule.connectToDB();
      await dbModule.disconnectFromDB();

      expect(mockMongoClientInstance.close).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith('DB 已斷開連線');
    });
  });

  describe('db export', () => {
    it('應該導出 db 物件', async () => {
      await dbModule.connectToDB();
      expect(dbModule.db).toBeDefined();
    });
  });

  describe('getCollection', () => {
    it('應該返回指定名稱的集合', async () => {
      await dbModule.connectToDB();
      const mockCollectionName = 'test_collection';
      const mockDbInstance = mockMongoClientInstance.db();
      const mockCollection = {} as any; // Mock collection object
      vi.mocked(mockDbInstance.collection).mockReturnValue(mockCollection);

      const collection = dbModule.getCollection(mockCollectionName);

      expect(mockDbInstance.collection).toHaveBeenCalledWith(mockCollectionName);
      expect(collection).toBe(mockCollection);
    });
  });
});
