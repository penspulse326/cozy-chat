import { Stack, Text, alpha } from '@mantine/core';
import MessageContent from '../MessageContent';
import styles from './styles.module.css';

import { MatchStatus } from '@/types';
import type { MessageContentData } from '../MessageContent';

interface ChatBoxProps {
  userId: string | null;
  messages: MessageContentData[];
  matchingStatus: MatchStatus;
}

export default function ChatBox({
  userId,
  messages,
  matchingStatus,
}: ChatBoxProps) {
  return (
    <>
      <Stack
        className={styles.chatBoxWrapper}
        bg={alpha('var(--mantine-color-moss-green-2)', 0.4)}
      >
        {matchingStatus === 'waiting' ? (
          <Text>配對中...</Text>
        ) : (
          <>
            <Text>配對成功！</Text>
            <Text className={styles.chatBoxTextMb}>開始聊天吧！</Text>

            <Stack className={styles.messagesContainer}>
              {messages.map((message: MessageContentData) => (
                <MessageContent
                  key={message.id}
                  data={message}
                  isUser={message.user_id === userId}
                />
              ))}
            </Stack>
          </>
        )}
        {matchingStatus === 'left' && <Text>對方已離開</Text>}
      </Stack>
    </>
  );
}
