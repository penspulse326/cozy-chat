import type { User } from '@packages/lib';
import type { Db } from 'mongodb';

class UserService {
  constructor(private readonly db: Db) {}

  async createUser(user: User) {
    try {
      const result = await this.db.collection<User>('users').insertOne(user);
      console.log('新增 User 成功', result);

      return result.insertedId;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default UserService;
