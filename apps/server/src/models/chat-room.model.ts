import { ChatRoom } from '@packages/lib';
import mongoose, { Schema } from 'mongoose';

const ChatRoomSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    users: [
      {
        type: String,
        ref: 'User',
        required: true,
      },
    ],
  },
  {
    _id: false,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const ChatRoom = mongoose.model<ChatRoom>('ChatRoom', ChatRoomSchema);

export default ChatRoom;
