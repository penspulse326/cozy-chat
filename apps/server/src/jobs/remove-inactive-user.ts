import cron from 'node-cron';

import userService from '@/services/user.service';

// 移除不活躍的使用者
export function setupRemoveInactiveUserJob() {
  cron.schedule('*/1 * * * *', async () => {
    console.log('執行移除不活躍使用者:', new Date().toISOString());
    try {
      await userService.removeInactiveUsers();
    } catch (error) {
      console.error('移除不活躍使用者失敗:', error);
    }
  });
}
