import { render } from '@/tests';
import { ChatMessage } from '@packages/lib';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MessageContent from './index';

describe('MessageContent', () => {
  const mockChatMessage: ChatMessage = {
    _id: '1',
    room_id: 'room1',
    user_id: 'user1',
    content: 'Hello, this is a test message!',
    created_at: new Date('2023-10-27T10:00:00Z'),
    device: 'MB',
  };

  it('應該正確渲染訊息內容、裝置和時間 (作為用戶)', () => {
    render(<MessageContent data={mockChatMessage} isUser={true} />);

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('行動裝置')).toBeInTheDocument();
    expect(screen.getByText('2023/10/27')).toBeInTheDocument();
  });

  it('應該正確渲染訊息內容、裝置和時間 (作為對方)', () => {
    const mockOtherMessage = { ...mockChatMessage, sender_id: 'otherUser' };
    render(<MessageContent data={mockOtherMessage} isUser={false} />);

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('行動裝置')).toBeInTheDocument();
    expect(screen.getByText('2023/10/27')).toBeInTheDocument();
  });
});
