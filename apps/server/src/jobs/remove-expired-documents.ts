import cron from 'node-cron';

import chatRoomService from '@/services/chat-room.service';
import userService from '@/services/user.service';

// 移除不活躍的使用者
export function setupRemoveExpiredDocuments() {
  cron.schedule('0 3 * * *', async () => {
    console.log('排程：移除不活躍使用者:', new Date().toISOString());

    try {
      await userService.removeInactiveUsers();
    } catch (error) {
      console.error('移除不活躍使用者失敗:', error);
    }

    console.log('排程：移除空聊天室:', new Date().toISOString());

    try {
      await chatRoomService.removeEmptyChatRooms();
    } catch (error) {
      console.error('移除空聊天室失敗:', error);
    }
  });
}
