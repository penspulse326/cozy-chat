import type { CreateUserPayload, User } from '@packages/lib/dist';
import type { Collection, Db, InsertOneResult } from 'mongodb';

import { CreateUserSchema } from '@packages/lib/dist';

import { catchDbError } from '@/utils/catch-db-error';

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
        created_at: new Date(),
        last_active_at: new Date(),
      });
      console.log('新增 User 成功');

      return result;
    } catch (error: unknown) {
      catchDbError(error);
      return null;
    }
  }

  async getUserById(id: string): Promise<null | User> {
    try {
      const user = await this.users.findOne({ _id: id });
      return user;
    } catch (error: unknown) {
      catchDbError(error);
      return null;
    }
  }
}

export default UserModel;
