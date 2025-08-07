import { MatchStatus } from '@/types';
import { Button, Flex, Input } from '@mantine/core';
import { useState } from 'react';
import styles from './styles.module.css';

interface MessageInputProps {
  matchingStatus: MatchStatus;
  onSendMessage: (message: string) => void;
  onLeaveChat: () => void;
}

export default function MessageInput({
  matchingStatus,
  onSendMessage,
  onLeaveChat,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  function handleSendMessage() {
    if (message.trim() === '') {
      return;
    }

    onSendMessage(message);
    setMessage('');
  }

  function handleClearMessage() {
    setMessage('');
  }

  if (matchingStatus === 'standby') {
    return null;
  }

  return (
    <Flex className={styles.wrapper}>
      <Button
        variant="subtle"
        onClick={onLeaveChat}
        classNames={{ root: styles.leaveButtonRoot }}
      >
        離開
      </Button>
      <Input
        disabled={matchingStatus !== 'matched'}
        rightSection={
          <Input.ClearButton
            onClick={handleClearMessage}
            disabled={message.trim() === ''}
          />
        }
        rightSectionPointerEvents="auto"
        rightSectionWidth="auto"
        classNames={{
          wrapper: styles.inputWrapper,
          input: styles.inputInput,
        }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage();
          }
        }}
      />
      <Button
        disabled={matchingStatus !== 'matched'}
        classNames={{ root: styles.sendButtonRoot }}
        onClick={handleSendMessage}
      >
        送出
      </Button>
    </Flex>
  );
}
