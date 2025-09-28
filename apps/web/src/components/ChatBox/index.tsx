import { Stack, Text, alpha } from '@mantine/core';
import ChatMessageCard from '../ChatMessageCard';
import styles from './styles.module.css';

import { MatchStatus } from '@/types';
import { ChatMessageDto } from '@packages/lib';
import Link from 'next/link';

interface ChatBoxProps {
  userId: string | null;
  trends: any;
  messages: ChatMessageDto[];
  matchStatus: MatchStatus;
  isBlocked: boolean;
  onRead: (id: string) => void;
}

export default function ChatBox({
  userId,
  trends,
  messages,
  matchStatus,
  isBlocked,
  onRead,
}: ChatBoxProps) {
  const filteredTrends = (trends || [])
    .filter((trend: { content: string }) => trend.content !== '')
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(5, trends.length));
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
            {filteredTrends.map((trend: { content: string }) => (
              <Text className={styles.chatBoxTopic}>
                來聊聊
                <Link
                  href={`https://www.google.com.tw/search?q=${trend.content}&hl=zh-TW`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {trend.content}
                </Link>
                吧
              </Text>
            ))}

            <Stack className={styles.messagesContainer}>
              {messages.map((message: ChatMessageDto) => (
                <ChatMessageCard
                  key={message.id}
                  data={message}
                  isUser={message.userId === userId}
                  onRead={onRead}
                />
              ))}
              {isBlocked && (
                <Text className={styles.chatBoxAlert}>
                  短時間內發送訊息過多，請稍後再試
                </Text>
              )}
            </Stack>
          </>
        )}
        {matchStatus === 'left' && <Text>對方已離開</Text>}
      </Stack>
    </>
  );
}
