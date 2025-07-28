import type { WaitingUser } from '@/types';

import chatRoomModel from '@/models/chat-room.model';

async function createChatRoom(users: WaitingUser[]) {
  const currentTime = new Date();
  const roomId = `room-${users[0].socketId}-${users[1].socketId}`;
  const payload = {
    _id: roomId,
    created_at: currentTime,
    users: [users[0].socketId, users[1].socketId],
  };

  const result = await chatRoomModel.createChatRoom(payload);

  return result;
}

export default {
  createChatRoom,
};
