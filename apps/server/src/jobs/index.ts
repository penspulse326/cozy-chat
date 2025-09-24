import cron from 'node-cron';

import { setupRemoveInactiveUserJob } from './remove-inactive-user';

export function setupCronJobs() {
  cron.schedule('*/10 * * * *', () => {
    console.log('測試排程:', new Date().toISOString());
  });

  // 移除不活躍的使用者
  setupRemoveInactiveUserJob();
}
