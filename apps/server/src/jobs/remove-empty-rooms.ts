import cron from 'node-cron';

import chatRoomService from '@/services/chat-room.service';

// 移除空的聊天室
export function setupRemoveEmptyRoomsJob() {
  cron.schedule('*/1 * * * *', async () => {
    console.log('執行移除空聊天室:', new Date().toISOString());

    try {
      await chatRoomService.removeEmptyChatRooms();
    } catch (error) {
      console.error('移除空聊天室失敗:', error);
    }
  });
}
