import { Stack, alpha } from '@mantine/core';
import { Text } from '@mantine/core';
import MessageContent from '../MessageContent';

export default function ChatBox() {
  return (
    <Stack
      align="center"
      p={32}
      bdrs="lg"
      bg={alpha('var(--mantine-color-moss-green-4)', 0.2)}
      w="100%"
      h="100%"
      style={{
        boxShadow: '0 0 16px 2px rgba(0, 0, 0, 0.2)',
      }}
    >
      <Text>配對成功！</Text>
      <Text mb={32}>開始聊天吧！</Text>

      <Stack w="100%" h="100%" gap={32}>
        <MessageContent
          isUser={false}
          message="你好，我是小明，很開心認識你！"
          created_at="2025-01-01 12:00:00"
        />

        <MessageContent
          isUser={true}
          message="你好，我是小明，很開心認識你！"
          created_at="2025-01-01 12:00:00"
        />
        <MessageContent
          isUser={true}
          message="你好，我是小明，很開心認識你！"
          created_at="2025-01-01 12:00:00"
        />
      </Stack>
    </Stack>
  );
}
