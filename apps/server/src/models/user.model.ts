import { z } from 'zod';

import { AppDataSource } from '@/config/db.config';

import type { User } from '@packages/lib/types/models';
import type { Collection, Db } from 'mongodb';

export const CreateUserSchema = z.object({
  _id: z.string().min(1),
  device: z.enum(['APP', 'MB', 'PC']),
  room_id: z.string(),
  status: z.enum(['ACTIVE', 'LEFT']),
});

export const UpdateUserSchema = z.object({
  last_active_at: z.date(),
  room_id: z.string(),
  status: z.enum(['ACTIVE', 'LEFT']),
});

type CreateUserPayload = z.infer<typeof CreateUserSchema>;
type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

class UserModel {
  private users: Collection<User>;

  constructor(private readonly db: Db) {
    this.users = this.db.collection<User>('users');
  }

  async createUser(user: CreateUserPayload): Promise<User> {
    try {
      const currentTime = new Date();
      const newUser: User = {
        _id: user._id,
        created_at: currentTime,
        device: user.device,
        last_active_at: currentTime,
        room_id: user.room_id,
        status: user.status,
      };

      await this.users.insertOne(newUser);
      console.log('新增 User 成功');

      return newUser;
    } catch (error) {
      console.error(error);
      throw error;
    }
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
      throw error;
    }
  }
}

const userModel = new UserModel(AppDataSource.getDb());

export default userModel;
