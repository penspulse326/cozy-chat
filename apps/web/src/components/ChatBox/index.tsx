import { Box, Stack, alpha } from '@mantine/core';
import { Text } from '@mantine/core';
import MessageContent from '../MessageContent';
import MessageInput from '../MessageInput';
import styles from './styles.module.css';

import type { MessageContentData } from '../MessageContent';
import { MatchingStatus } from '@/types';

interface ChatBoxProps {
  userId: string;
  messages: MessageContentData[];
  matchingStatus: MatchingStatus;
  onLeaveChat: () => void;
}

export default function ChatBox({
  userId,
  messages,
  matchingStatus,
  onLeaveChat,
}: ChatBoxProps) {
  return (
    <>
      <Stack
        className={styles.chatBoxWrapper}
        bg={alpha('var(--mantine-color-moss-green-4)', 0.4)}
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
      </Stack>
    </>
  );
}
