import { DeviceNameMap } from '@/types';
import { formatMessageTime } from '@/utils/formatTime';
import { Flex, Stack, Text, alpha } from '@mantine/core';
import { useIntersection } from '@mantine/hooks';
import { ChatMessageDto } from '@packages/lib';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface MessageContentProps {
  data: ChatMessageDto;
  isUser: boolean;
  onRead: (id: string) => void;
}

export default function ChatMessageCard({
  data,
  isUser,
  onRead,
}: MessageContentProps) {
  const { id, device, content, createdAt, isRead } = data;
  const justify = isUser ? styles.wrapperEnd : styles.wrapperStart;

  const [formattedTime, setFormattedTime] = useState<string>(
    formatMessageTime(createdAt)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(formatMessageTime(createdAt));
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [createdAt]);

  const { ref, entry } = useIntersection({
    threshold: 0.8,
  });

  useEffect(() => {
    if (!entry?.isIntersecting || isUser || isRead) {
      return;
    }

    onRead(id);
  }, [id, isRead, isUser, onRead, entry]);

  return (
    <Flex
      ref={ref}
      role="article"
      className={`${styles.wrapper} ${justify}`}
      data-is-user={isUser}
    >
      <Flex
        className={`${styles.messageBox} ${isUser ? styles.messageBoxUser : styles.messageBoxOther}`}
        bg={alpha('var(--mantine-color-soft-lime-0)', 0.5)}
      >
        <Text className={styles.messageText}>{content}</Text>
      </Flex>
      <Stack
        className={`${styles.infoStack} ${isUser ? styles.infoStackRight : styles.infoStackLeft}`}
      >
        {isUser ? (
          <Text size="xs"> {isRead ? '已讀' : '未讀'}</Text>
        ) : (
          <Text size="xs">{DeviceNameMap[device]}</Text>
        )}
        <Text size="xs">{formattedTime}</Text>
      </Stack>
    </Flex>
  );
}
