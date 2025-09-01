import { Flex, Stack, Text, alpha } from '@mantine/core';
import { ChatMessageDTO } from '@packages/lib';
import styles from './styles.module.css';
import { DeviceEnum } from '@/types';

interface MessageContentProps {
  data: ChatMessageDTO;
  isUser: boolean;
}

export default function ChatMessageCard({ data, isUser }: MessageContentProps) {
  const { device, content, created_at } = data;
  const justify = isUser ? styles.wrapperEnd : styles.wrapperStart;

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
        <Text size="xs">
          {new Date(created_at).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}
        </Text>
      </Stack>
    </Flex>
  );
}
