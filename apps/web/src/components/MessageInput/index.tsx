import { MatchStatus } from '@/types';
import { Button, Flex, Input } from '@mantine/core';
import { useState } from 'react';
import styles from './styles.module.css';

interface MessageInputProps {
  matchingStatus: MatchStatus;
  onChatSend: (message: string) => void;
  onLeave: () => void;
}

export default function MessageInput({
  matchingStatus,
  onChatSend,
  onLeave,
}: MessageInputProps) {
  const [message, setMessage] = useState('');

  function handleSendMessage() {
    if (message.trim() === '') {
      return;
    }

    onChatSend(message);
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
        onClick={onLeave}
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
          if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
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
