import cron from 'node-cron';

export function setupRemoveInactiveUserJob() {
  cron.schedule('*/1 * * * *', () => {
    console.log('執行健康檢查:', new Date().toISOString());
  });
}
