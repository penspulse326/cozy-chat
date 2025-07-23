import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    room_id: { type: String, required: true, ref: 'ChatRoom' },
    user_id: { type: String, required: true, ref: 'MatchedUser' },
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    collection: 'chat_messages',
  }
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
