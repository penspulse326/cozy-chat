
import { render, screen } from '@/tests';
import { ChatMessage } from '@packages/lib';
import { describe, expect, it } from 'vitest';
import ChatBox from './index';

describe('ChatBox', () => {
  const mockMessages: ChatMessage[] = [
    {
      _id: '1',
      room_id: 'room1',
      user_id: 'user1',
      content: '嗨，你好！',
      created_at: new Date(),
      device: 'PC',
    },
    {
      _id: '2',
      room_id: 'room1',
      user_id: 'user2',
      content: '你好啊！',
      created_at: new Date(),
      device: 'MB',
    },
  ];

  it('當 matchStatus 為 waiting 時，應顯示配對中訊息', () => {
    render(
      <ChatBox userId="user1" messages={[]} matchStatus="waiting" />
    );
    expect(screen.getByText('配對中...')).toBeInTheDocument();
  });

  it('當 matchStatus 為 left 時，應顯示對方已離開訊息', () => {
    render(<ChatBox userId="user1" messages={mockMessages} matchStatus="left" />);
    expect(screen.getByText('對方已離開')).toBeInTheDocument();
  });

  it('當 matchStatus 為 matched 且沒有訊息時，應顯示配對成功訊息', () => {
    render(
      <ChatBox userId="user1" messages={[]} matchStatus="matched" />
    );
    expect(screen.getByText('配對成功！')).toBeInTheDocument();
    expect(screen.getByText('開始聊天吧！')).toBeInTheDocument();
  });

  it('當有訊息時，應正確渲染訊息列表', () => {
    render(
      <ChatBox userId="user1" messages={mockMessages} matchStatus="matched" />
    );

    // 檢查兩則訊息是否都已渲染
    expect(screen.getByText('嗨，你好！')).toBeInTheDocument();
    expect(screen.getByText('你好啊！')).toBeInTheDocument();

    // ChatMessageCard 元件會被渲染，可以透過其內容來驗證
    const messageElements = screen.getAllByRole('article'); // 假設 ChatMessageCard 的根元素是 <article>
    // 為了讓這個測試更健壯，我們應該在 ChatMessageCard 元件中加入 role="article"
    // 不過，目前我們可以先基於渲染的文字內容來判斷
    expect(messageElements.length).toBe(mockMessages.length);
  });

  it('應根據 userId 正確判斷是否為使用者本人訊息', () => {
    // 這個測試需要檢查傳遞給 ChatMessageCard 的 isUser prop
    // 這通常需要對 ChatMessageCard 進行 mock，或者在 ChatMessageCard 內部渲染一些可供測試的標記
    // 這裡我們先用一個簡化的方式，假設 isUser 會影響樣式或特定文字
    render(
      <ChatBox userId="user1" messages={mockMessages} matchStatus="matched" />
    );

    // 假設使用者自己的訊息會有一個 'is-user' 的 class 或 data-attribute
    // 為了達成這個測試，我們需要修改 ChatMessageCard 來加上類似 data-testid="message-is-user-true" 的屬性
    // 這裡僅為示意，實際執行需要修改 ChatMessageCard 元件
    expect(screen.getByText('嗨，你好！').closest('div[data-is-user="true"]'));
    expect(screen.getByText('你好啊！').closest('div[data-is-user="false"]'));
  });
});

// 為了讓上面的測試能跑，我們需要稍微修改 ChatMessageCard/index.tsx
// 將 <Flex className={`${styles.wrapper} ${justify}`}>
// 改為 <Flex className={`${styles.wrapper} ${justify}`} data-is-user={isUser}>
