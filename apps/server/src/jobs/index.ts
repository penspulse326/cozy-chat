import cron from 'node-cron';

import { setupRemoveEmptyRoomsJob } from './remove-empty-rooms';
import { setupRemoveInactiveUsers } from './remove-inactive-users';

export function setupCronJobs() {
  cron.schedule('*/10 * * * *', () => {
    console.log('測試排程:', new Date().toISOString());
  });

  // 移除不活躍的使用者
  setupRemoveInactiveUsers();

  // 移除空的聊天室
  setupRemoveEmptyRoomsJob();
}
