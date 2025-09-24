import cron from 'node-cron';

import { setupRemoveExpiredDocuments } from './remove-expired-documents';

export function setupCronJobs() {
  cron.schedule('*/10 * * * *', () => {
    console.log('排程: 測試', new Date().toISOString());
  });

  // 移除過期的文件
  setupRemoveExpiredDocuments();
}
