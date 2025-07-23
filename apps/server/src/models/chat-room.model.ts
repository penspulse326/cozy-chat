import { ChatRoom, User } from '@packages/lib';
import mongoose, { Schema } from 'mongoose';

const ChatRoomSchema: Schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
    },
    users: {
      type: [
        {
          type: String,
          ref: 'MatchedUser',
          required: true,
        },
      ],
      validate: {
        validator: (v: User[]) => v.length <= 2,
        message: (props: any) =>
          `Chat room cannot have more than 2 users, but got ${props.value.length}.`,
      },
    },
  },
  {
    _id: false,
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'chat_rooms',
  }
);

const ChatRoom = mongoose.model<ChatRoom>('ChatRoom', ChatRoomSchema);

export default ChatRoom;
