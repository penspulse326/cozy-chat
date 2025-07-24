import { ChatRoom, User } from '@packages/lib';
import mongoose, { HydratedDocument, Schema } from 'mongoose';

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

ChatRoomSchema.pre(
  'save',
  async function (this: HydratedDocument<ChatRoom>, next) {
    if (this.isNew || this.isModified('users')) {
      const MatchedUser = mongoose.model('MatchedUser');
      for (const userId of this.users) {
        const userExists = await MatchedUser.findById(userId);
        if (!userExists) {
          return next(new Error(`MatchedUser with ID ${userId} not found.`));
        }
      }
    }
    next();
  }
);

const ChatRoom = mongoose.model<ChatRoom>('ChatRoom', ChatRoomSchema);

export default ChatRoom;
