import ChatRoomModel from '@/models/chat-room.model';

async function createChatRoom(userIds: string[]) {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    users: userIds,
  };

  const result = await ChatRoomModel.createChatRoom(payload);

  return result;
}

export default {
  createChatRoom,
};
