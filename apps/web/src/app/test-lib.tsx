'use client';

import { formatName, sayHello } from '@packages/lib';

import type { User } from '@packages/lib';

export function TestLibComponent() {
  const testUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'John Doe',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-bold mb-2">共用庫測試</h2>
      <p>{sayHello('Next.js')}</p>
      <p>格式化姓名: {formatName('john', 'doe')}</p>
      <p>用戶名稱: {testUser.name}</p>
    </div>
  );
}
