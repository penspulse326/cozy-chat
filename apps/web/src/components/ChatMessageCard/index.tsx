import { DeviceEnum } from '@/types';
import { formatMessageTime } from '@/utils/formatTime';
import { Flex, Stack, Text, alpha } from '@mantine/core';
import { ChatMessageDto } from '@packages/lib';
import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface MessageContentProps {
  data: ChatMessageDto;
  isUser: boolean;
}

export default function ChatMessageCard({ data, isUser }: MessageContentProps) {
  const { device, content, createdAt } = data;
  const [formattedTime, setFormattedTime] = useState<string>(
    formatMessageTime(createdAt)
  );
  const justify = isUser ? styles.wrapperEnd : styles.wrapperStart;

  useEffect(() => {
    const interval = setInterval(() => {
      setFormattedTime(formatMessageTime(createdAt));
    }, 1000 * 60);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <Flex
      role="article"
      className={`${styles.wrapper} ${justify}`}
      data-is-user={isUser}
    >
      <Flex
        className={styles.messageBox}
        bg={alpha('var(--mantine-color-soft-lime-0)', 0.5)}
      >
        <Text className={styles.messageText}>{content}</Text>
      </Flex>
      <Stack
        className={`${styles.infoStack} ${isUser ? styles.infoStackRight : styles.infoStackLeft}`}
      >
        <Text size="xs">{DeviceEnum[device]}</Text>
        <Text size="xs">{formattedTime}</Text>
      </Stack>
    </Flex>
  );
}
