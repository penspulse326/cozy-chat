import { Stack, Text, alpha } from '@mantine/core';
import ChatMessageCard from '../ChatMessageCard';
import styles from './styles.module.css';

import { MatchStatus } from '@/types';
import { ChatMessageDto } from '@packages/lib';

interface ChatBoxProps {
  userId: string | null;
  messages: ChatMessageDto[];
  matchStatus: MatchStatus;
  onRead: (id: string) => void;
}

export default function ChatBox({
  userId,
  messages,
  matchStatus,
  onRead,
}: ChatBoxProps) {
  return (
    <>
      <Stack
        className={styles.chatBoxWrapper}
        bg={alpha('var(--mantine-color-moss-green-2)', 0.4)}
      >
        {matchStatus === 'waiting' ? (
          <Text className={styles.chatBoxHint}>配對中...</Text>
        ) : (
          <>
            <Text className={styles.chatBoxHint}>配對成功！</Text>
            <Text className={styles.chatBoxTextMb}>開始聊天吧 🤝</Text>

            <Stack className={styles.messagesContainer}>
              {messages.map((message: ChatMessageDto) => (
                <ChatMessageCard
                  key={message.id}
                  data={message}
                  isUser={message.userId === userId}
                  onRead={onRead}
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
