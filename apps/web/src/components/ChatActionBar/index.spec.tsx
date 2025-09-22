import { render, screen, userEvent } from '@/tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChatActionBar from './index';

describe('ChatActionBar', () => {
  const onSendMock = vi.fn();
  const onLeaveMock = vi.fn();

  beforeEach(() => {
    onSendMock.mockClear();
    onLeaveMock.mockClear();
  });

  it('當 matchStatus 為 standby 時，不應渲染任何內容', () => {
    render(
      <ChatActionBar
        matchStatus="standby"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    // 當 status 為 standby 時，元件應回傳 null，不渲染任何主要元素
    expect(
      screen.queryByRole('button', { name: '離開' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('當 matchStatus 為 matched 時，輸入框和按鈕應為啟用狀態', () => {
    render(
      <ChatActionBar
        matchStatus="matched"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    expect(screen.getByRole('textbox')).toBeEnabled();
    expect(screen.getByRole('button', { name: '送出' })).toBeEnabled();
  });

  it('當 matchStatus 為 waiting 時，輸入框和按鈕應為禁用狀態', () => {
    render(
      <ChatActionBar
        matchStatus="waiting"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button', { name: '送出' })).toBeDisabled();
  });

  it('點擊離開按鈕時，應呼叫 onLeave', async () => {
    render(
      <ChatActionBar
        matchStatus="matched"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    await userEvent.click(screen.getByRole('button', { name: '離開' }));
    expect(onLeaveMock).toHaveBeenCalledOnce();
  });

  it('輸入文字並點擊送出按鈕時，應呼叫 onSend 並清空輸入框', async () => {
    render(
      <ChatActionBar
        matchStatus="matched"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '你好');
    expect(input).toHaveValue('你好');

    await userEvent.click(screen.getByRole('button', { name: '送出' }));
    expect(onSendMock).toHaveBeenCalledWith('你好');
    expect(input).toHaveValue('');
  });

  it('輸入空白訊息時，點擊送出不應呼叫 onSend', async () => {
    render(
      <ChatActionBar
        matchStatus="matched"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '   ');
    await userEvent.click(screen.getByRole('button', { name: '送出' }));
    expect(onSendMock).not.toHaveBeenCalled();
  });

  it('在輸入框中按下 Enter 鍵時，應呼叫 onSend', async () => {
    render(
      <ChatActionBar
        matchStatus="matched"
        onSend={onSendMock}
        onLeave={onLeaveMock}
      />
    );
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '測試 Enter');
    await userEvent.keyboard('{enter}');
    expect(onSendMock).toHaveBeenCalledWith('測試 Enter');
  });
});
