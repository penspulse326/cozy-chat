import chatRoomModel from '@/models/chat-room.model';

async function createChatRoom(userIds: string[]) {
  const currentTime = new Date();
  const payload = {
    created_at: currentTime,
    users: userIds,
  };

  const result = await chatRoomModel.createChatRoom(payload);

  return result;
}

async function findChatRoomById(id: string) {
  const result = await chatRoomModel.findChatRoomById(id);

  return result;
}

export default {
  createChatRoom,
  findChatRoomById,
};
