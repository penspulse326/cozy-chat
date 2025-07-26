// import { ChatRoom } from '@packages/lib';
// import mongoose, { Schema } from 'mongoose';

// import type { User } from '@packages/lib';
// import type { HydratedDocument } from 'mongoose';

// const ChatRoomSchema: Schema = new Schema(
//   {
//     _id: {
//       required: true,
//       type: String,
//       unique: true,
//     },
//     users: {
//       type: [
//         {
//           ref: 'MatchedUser',
//           required: true,
//           type: String,
//         },
//       ],
//     },
//   },
//   {
//     _id: false,
//     collection: 'chat_rooms',
//     timestamps: {
//       createdAt: 'created_at',
//       updatedAt: 'updated_at',
//     },
//   }
// );

// ChatRoomSchema.pre(
//   'save',
//   async function (this: HydratedDocument<ChatRoom>, next) {
//     if (this.isNew || this.isModified('users')) {
//       const MatchedUser = mongoose.model<User>('MatchedUser');

//       for (const userId of this.users) {
//         const userExists = await MatchedUser.findById(userId);

//         if (!userExists) {
//           next(new Error(`${JSON.stringify(this)} 資料處理失敗`));
//           return;
//         }
//       }
//     }
//     next();
//   }
// );

// const ChatRoom = mongoose.model<ChatRoom>('ChatRoom', ChatRoomSchema);

// export default ChatRoom;
