import type { CreateUserPayload, User } from '@packages/lib/dist';
import type { Collection, Db, InsertOneResult } from 'mongodb';

class UserModel {
  private users: Collection<User>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<User>('users');
  }

  async createUser(
    user: CreateUserPayload
  ): Promise<InsertOneResult<User> | null> {
    try {
      const result = await this.users.insertOne(user);
      console.log('新增 User 成功');
      return result;
    } catch (error: unknown) {
      console.error(error);
      return null;
    }
  }

  async getUserById(_id: string): Promise<null | User> {
    const user = await this.users.findOne({ _id });
    return user;
  }
}

export default UserModel;
