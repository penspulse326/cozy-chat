import mongoose from 'mongoose';

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/cozychat'
    );
    console.log('DB 連線成功！');
  } catch (error) {
    console.error('DB 連線錯誤：', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  console.log('DB 已斷開連線。');
}

export { connectDB, disconnectDB };
