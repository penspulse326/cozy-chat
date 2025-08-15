import { MatchStatus } from '@/types';
import { Button, Flex, Input } from '@mantine/core';
import { useState } from 'react';
import styles from './styles.module.css';

interface ChatActionBarProps {
  matchStatus: MatchStatus;
  onSend: (message: string) => void;
  onLeave: () => void;
}

export default function ChatActionBar({
  matchStatus,
  onSend,
  onLeave,
}: ChatActionBarProps) {
  const [message, setMessage] = useState('');

  function handleSendMessage() {
    if (message.trim() === '') {
      return;
    }

    onSend(message);
    setMessage('');
  }

  function handleClearMessage() {
    setMessage('');
  }

  if (matchStatus === 'standby') {
    return null;
  }

  return (
    <Flex className={styles.wrapper}>
      <Button
        variant="subtle"
        onClick={onLeave}
        classNames={{ root: styles.leaveButtonRoot }}
      >
        離開
      </Button>
      <Input
        value={message}
        disabled={matchStatus !== 'matched'}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSendMessage();
          }
        }}
        rightSectionPointerEvents="auto"
        rightSectionWidth="auto"
        rightSection={
          <Input.ClearButton
            onClick={handleClearMessage}
            disabled={message.trim() === ''}
          />
        }
        classNames={{
          wrapper: styles.inputWrapper,
          input: styles.inputInput,
        }}
      />
      <Button
        disabled={matchStatus !== 'matched'}
        onClick={handleSendMessage}
        classNames={{ root: styles.sendButtonRoot }}
      >
        送出
      </Button>
    </Flex>
  );
}
