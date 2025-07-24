import { Device, User, UserStatus } from '@packages/lib';
import mongoose, { HydratedDocument, Schema } from 'mongoose';

const MatchedUserSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    room_id: {
      type: String,
      ref: 'ChatRoom',
      required: false,
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
    collection: 'matched_users',
  }
);

MatchedUserSchema.pre(
  'save',
  async function (this: HydratedDocument<User>, next) {
    if (this.isNew || this.isModified('room_id')) {
      if (this.room_id) {
        const ChatRoom = mongoose.model('ChatRoom');
        const roomExists = await ChatRoom.findById(this.room_id);
        if (!roomExists) {
          return next(new Error(`ChatRoom with ID ${this.room_id} not found.`));
        }
      }
    }
    next();
  }
);

const MatchedUser = mongoose.model<User>('MatchedUser', MatchedUserSchema);

export default MatchedUser;
