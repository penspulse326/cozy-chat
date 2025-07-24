import mongoose from 'mongoose';

const ChatMessageSchema = new mongoose.Schema(
  {
    content: { required: true, type: String },
    room_id: { ref: 'ChatRoom', required: true, type: String },
    user_id: { ref: 'MatchedUser', required: true, type: String },
  },
  {
    collection: 'chat_messages',
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

const ChatMessage = mongoose.model('ChatMessage', ChatMessageSchema);

export default ChatMessage;
