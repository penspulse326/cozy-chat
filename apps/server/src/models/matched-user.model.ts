import { Device, UserStatus } from '@packages/lib';
import mongoose, { Schema } from 'mongoose';

import type { ChatRoom, User } from '@packages/lib';
import type { HydratedDocument } from 'mongoose';

const MatchedUserSchema = new Schema<User>(
  {
    _id: {
      required: true,
      type: String,
      unique: true,
    },
    device: {
      enum: Object.keys(Device),
      required: true,
      type: String,
    },
    last_active_at: {
      default: Date.now,
      required: true,
      type: Date,
    },
    room_id: {
      ref: 'ChatRoom',
      required: false,
      type: String,
    },
    status: {
      enum: Object.values(UserStatus),
      required: true,
      type: String,
    },
  },
  {
    _id: false,
    collection: 'matched_users',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

MatchedUserSchema.pre(
  'save',
  async function (this: HydratedDocument<User>, next) {
    // 非新增且有修改 room_id 時進行檢查
    if (!this.isNew && this.isModified('room_id')) {
      if (!this.room_id) {
        next(new Error('須指定有效的 room_id'));
        return;
      }

      const ChatRoom = mongoose.model<ChatRoom>('ChatRoom');
      const roomExists = await ChatRoom.findById(this.room_id);

      if (!roomExists) {
        next(new Error(`無效的 room_id: ${this.room_id}`));
        return;
      }
    }

    next();
  }
);

const MatchedUser = mongoose.model<User>('MatchedUser', MatchedUserSchema);

export default MatchedUser;
