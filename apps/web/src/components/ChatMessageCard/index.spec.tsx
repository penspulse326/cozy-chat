import { act, render } from '@/tests';
import { ChatMessageDto, Device } from '@packages/lib';
import { screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import ChatMessageCard from './index';

describe('ChatMessageCard', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-10-29T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const mockChatMessage: ChatMessageDto = {
    id: '1',
    roomId: 'room1',
    userId: 'user1',
    content: 'Hello, this is a test message!',
    createdAt: new Date('2023-10-27T10:00:00Z'),
    device: 'MB',
    isRead: false,
  };

  it('應該正確渲染訊息內容、裝置和時間 (作為使用者)', () => {
    render(
      <ChatMessageCard data={mockChatMessage} isUser={true} onRead={vi.fn()} />
    );

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('未讀')).toBeInTheDocument();
    expect(screen.getByText('2 天前')).toBeInTheDocument();
  });

  it('應該正確渲染訊息內容、裝置和時間 (作為對方)', () => {
    const mockOtherMessage = { ...mockChatMessage };
    render(
      <ChatMessageCard
        data={mockOtherMessage}
        isUser={false}
        onRead={vi.fn()}
      />
    );

    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();
    expect(screen.getByText('行動裝置')).toBeInTheDocument();
    expect(screen.getByText('2 天前')).toBeInTheDocument();
  });

  it('當 device 不合法時，應能正常渲染而不顯示裝置資訊', () => {
    const mockInvalidMessage = {
      ...mockChatMessage,
      id: '3',
      device: 'non-existent-device' as Device,
    };

    render(
      <ChatMessageCard
        data={mockInvalidMessage}
        isUser={true}
        onRead={vi.fn()}
      />
    );

    // 訊息內容應該還在
    expect(
      screen.getByText('Hello, this is a test message!')
    ).toBeInTheDocument();

    // 預期找不到任何對應的裝置文字
    expect(screen.queryByText('網站')).not.toBeInTheDocument();
    expect(screen.queryByText('行動裝置')).not.toBeInTheDocument();
  });

  it('當訊息已讀時，應顯示已讀標記', () => {
    const readMessage = { ...mockChatMessage, isRead: true };
    render(
      <ChatMessageCard data={readMessage} isUser={true} onRead={vi.fn()} />
    );
    expect(screen.getByText('已讀')).toBeInTheDocument();
  });

  it('當訊息未讀時，不應顯示已讀標記', () => {
    const unreadMessage = { ...mockChatMessage, isRead: false };
    render(
      <ChatMessageCard data={unreadMessage} isUser={true} onRead={vi.fn()} />
    );
    expect(screen.queryByText('已讀')).not.toBeInTheDocument();
  });

  // Mock IntersectionObserver
  const intersectionObserverMock = () => {
    let callback: (entries: any[]) => void = () => {};
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      trigger: (entries: any[]) => callback(entries),
      callback: (cb: (entries: any[]) => void) => {
        callback = cb;
      },
    };
  };
  const observer = intersectionObserverMock();
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn().mockImplementation((cb) => {
      observer.callback(cb);
      return observer;
    })
  );

  it('當對方未讀的訊息可見時，應呼叫 onRead', () => {
    const onRead = vi.fn();
    const unreadMessage = {
      ...mockChatMessage,
      isRead: false,
      userId: 'other-user',
    };
    render(
      <ChatMessageCard data={unreadMessage} isUser={false} onRead={onRead} />
    );

    act(() => {
      observer.trigger([{ isIntersecting: true }]);
    });

    expect(onRead).toHaveBeenCalledWith(unreadMessage.id);
  });

  it('當自己的訊息或已讀訊息可見時，不應呼叫 onRead', () => {
    const onRead = vi.fn();

    // Test with user's own message
    const userMessage = { ...mockChatMessage, isRead: false };
    const { unmount } = render(
      <ChatMessageCard data={userMessage} isUser={true} onRead={onRead} />
    );
    act(() => {
      observer.trigger([{ isIntersecting: true }]);
    });
    expect(onRead).not.toHaveBeenCalled();
    unmount();

    // Test with already read message
    const readMessage = {
      ...mockChatMessage,
      isRead: true,
      userId: 'other-user',
    };
    render(
      <ChatMessageCard data={readMessage} isUser={false} onRead={onRead} />
    );
    act(() => {
      observer.trigger([{ isIntersecting: true }]);
    });
    expect(onRead).not.toHaveBeenCalled();
  });
});
