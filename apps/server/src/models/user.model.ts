import { z } from 'zod';

import type { Collection, Db, InsertOneResult } from 'mongodb';

const UserSchema = z.object({
  _id: z.string(),
  room_id: z.string().optional(),
  device: z.enum(['APP', 'MB', 'PC']),
  status: z.enum(['ACTIVE', 'LEFT']),
  last_active_at: z.date(),
  created_at: z.date(),
});

const CreateUserSchema = UserSchema.omit({
  room_id: true,
});

const UpdateUserSchema = UserSchema.omit({
  device: true,
  created_at: true,
});

type User = z.infer<typeof UserSchema>;
type CreateUserPayload = z.infer<typeof CreateUserSchema>;
type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

class UserModel {
  private users: Collection<User>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<User>('users');
  }

  async createUser(
    user: CreateUserPayload
  ): Promise<null | InsertOneResult<User>> {
    try {
      const result = await this.users.insertOne(user);
      console.log('新增 User 成功');
      return result;
    } catch (error: unknown) {
      console.error(error);
      return null;
    }
  }

  async getUserById(_id: string): Promise<User | null> {
    const user = await this.users.findOne({ _id });
    return user;
  }

  async updateUser(_id: string, payload: UpdateUserPayload): Promise<void> {
    try {
      const result = await this.users.updateOne({ _id }, { $set: payload });

      if (result.matchedCount === 0) {
        throw new Error(`找不到 ID 為 ${_id} 的使用者`);
      }

      console.log('更新 User 成功');
    } catch (error) {
      console.error(error);
    }
  }
}

export default UserModel;
