import { Device, User, UserStatus } from '@packages/lib';
import mongoose, { Schema } from 'mongoose';

const UserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    room_id: {
      type: String,
      ref: 'ChatRoom',
      required: true,
    },
    device: {
      type: String,
      enum: Object.keys(Device),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      required: true,
    },
    last_active_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    _id: false,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const User = mongoose.model<User>('User', UserSchema);

export default User;
