import { Flex, Stack, Text, alpha } from '@mantine/core';
import { DeviceMap } from '@packages/lib';
import styles from './styles.module.css';

export type MessageContentData = {
  id: string;
  user_id: string;
  device: keyof typeof DeviceMap;
  message: string;
  created_at: string;
};

interface MessageContentProps {
  data: MessageContentData;
  isUser: boolean;
}

export default function MessageContent({ data, isUser }: MessageContentProps) {
  const { device, message, created_at } = data;
  const justify = isUser ? styles.wrapperEnd : styles.wrapperStart;

  return (
    <Flex className={`${styles.wrapper} ${justify}`}>
      <Flex
        className={styles.messageBox}
        bg={alpha('var(--mantine-color-soft-lime-0)', 0.5)}
      >
        <Text className={styles.messageText}>{message}</Text>
      </Flex>
      <Stack
        className={`${styles.infoStack} ${isUser ? styles.infoStackRight : styles.infoStackLeft}`}
      >
        <Text size="xs">{DeviceMap[device]}</Text>
        <Text size="xs">{created_at}</Text>
      </Stack>
    </Flex>
  );
}
