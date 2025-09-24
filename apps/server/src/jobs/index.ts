import cron from 'node-cron';

export function setupCronJobs() {
  cron.schedule('*/10 * * * *', () => {
    console.log('測試排程:', new Date().toISOString());
  });
}
