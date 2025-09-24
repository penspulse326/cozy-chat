import { render } from '@/tests';
import { ChatMessageDto, Device } from '@packages/lib';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ChatMessageCard from './index';

describe('ChatMessageCard', () => {
  const mockChatMessage: ChatMessageDto = {
    id: '1',
    roomId: 'room1',
    userId: 'user1',
    content: 'Hello, this is a test message!',
    createdAt: new Date('2023-10-27T10:00:00Z'),
    device: 'MB',
  };

  it('應該正確渲染訊息內容、裝置和時間 (作為使用者)', () => {
    render(<ChatMessageCard data={mockChatMessage} isUser={true} />);

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('行動裝置')).toBeInTheDocument();
    expect(screen.getByText('698 天前')).toBeInTheDocument();
  });

  it('應該正確渲染訊息內容、裝置和時間 (作為對方)', () => {
    const mockOtherMessage = { ...mockChatMessage };
    render(<ChatMessageCard data={mockOtherMessage} isUser={false} />);

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('行動裝置')).toBeInTheDocument();
    expect(screen.getByText('698 天前')).toBeInTheDocument();
  });

  it('當 device 不合法時，應能正常渲染而不顯示裝置資訊', () => {
    const mockInvalidMessage = {
      ...mockChatMessage,
      id: '3',
      device: 'non-existent-device' as Device,
    };

    render(<ChatMessageCard data={mockInvalidMessage} isUser={true} />);

    // 訊息內容應該還在
    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();

    // 預期找不到任何對應的裝置文字
    expect(screen.queryByText('網站')).not.toBeInTheDocument();
    expect(screen.queryByText('行動裝置')).not.toBeInTheDocument();
  });
});
