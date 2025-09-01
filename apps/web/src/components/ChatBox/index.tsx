import { Stack, Text, alpha } from '@mantine/core';
import ChatMessageCard from '../ChatMessageCard';
import styles from './styles.module.css';

import { MatchStatus } from '@/types';
import { ChatMessageDTO } from '@packages/lib';

interface ChatBoxProps {
  userId: string | null;
  messages: ChatMessageDTO[];
  matchStatus: MatchStatus;
}

export default function ChatBox({
  userId,
  messages,
  matchStatus,
}: ChatBoxProps) {
  return (
    <>
      <Stack
        className={styles.chatBoxWrapper}
        bg={alpha('var(--mantine-color-moss-green-2)', 0.4)}
      >
        {matchStatus === 'waiting' ? (
          <Text>配對中...</Text>
        ) : (
          <>
            <Text>配對成功！</Text>
            <Text className={styles.chatBoxTextMb}>開始聊天吧！</Text>

            <Stack className={styles.messagesContainer}>
              {messages.map((message: ChatMessageDTO) => (
                <ChatMessageCard
                  key={message._id}
                  data={message}
                  isUser={message.user_id === userId}
                />
              ))}
            </Stack>
          </>
        )}
        {matchStatus === 'left' && <Text>對方已離開</Text>}
      </Stack>
    </>
  );
}
