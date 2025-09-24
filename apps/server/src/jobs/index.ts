import cron from 'node-cron';

import { setupRemoveInactiveDocuments } from './remove-inactive-documents';

export function setupCronJobs() {
  cron.schedule('*/10 * * * *', () => {
    console.log('測試排程:', new Date().toISOString());
  });

  // 移除不活躍的使用者
  setupRemoveInactiveDocuments();
}
