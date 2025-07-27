import type { CreateUserPayload, User } from '@packages/lib/dist';
import type { Collection, Db, InsertOneResult } from 'mongodb';

import { CreateUserSchema } from '@packages/lib/dist';
import z from 'zod';

class UserModel {
  private users: Collection<User>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<User>('users');
  }

  async createUser(
    user: CreateUserPayload
  ): Promise<InsertOneResult<User> | null> {
    try {
      const validatedUser = CreateUserSchema.parse(user);

      const result = await this.users.insertOne({
        ...validatedUser,
        last_active_at: new Date(),
        created_at: new Date(),
      });

      console.log('新增 User 成功');
      return result;
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        console.error('資料驗證失敗:', error.issues);
      } else {
        console.error('資料庫錯誤:', error);
      }
      return null;
    }
  }
}

export default UserModel;
