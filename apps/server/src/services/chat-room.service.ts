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

async function findChatRoomById(id: string) {
  const result = await ChatRoomModel.findChatRoomById(id);

  return result;
}

export default {
  createChatRoom,
  findChatRoomById,
};
