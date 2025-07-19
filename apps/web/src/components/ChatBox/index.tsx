import { Button, Flex, Input, Stack, alpha } from '@mantine/core';
import { Text } from '@mantine/core';
import MessageContent from '../MessageContent/index';

import type { MessageContentData } from '../MessageContent/index';

const messages: MessageContentData[] = [
  {
    id: '1',
    user_id: '123',
    device: 'PC',
    message: '你好，我是小明，很開心認識你！',
    created_at: '2025-01-01 12:00:00',
  },
  {
    id: '2',
    user_id: '456',
    device: 'APP',
    message: '你好，我是小美！',
    created_at: '2025-01-01 12:01:00',
  },
  {
    id: '3',
    user_id: '123',
    device: 'PC',
    message: '怎麼還沒睡！',
    created_at: '2025-01-01 12:01:30',
  },
  {
    id: '4',
    user_id: '123',
    device: 'PC',
    message: '在幹嘛？',
    created_at: '2025-01-01 12:02:00',
  },
  {
    id: '5',
    user_id: '456',
    device: 'APP',
    message: '我在看花枝遊戲！',
    created_at: '2025-01-01 12:02:30',
  },
  {
    id: '6',
    user_id: '123',
    device: 'PC',
    message: '我也在看！',
    created_at: '2025-01-01 12:03:00',
  },
];

export default function ChatBox({ onLeaveChat }: { onLeaveChat: () => void }) {
  return (
    <>
      <Stack
        align="center"
        mt={60}
        p={32}
        bg={alpha('var(--mantine-color-moss-green-4)', 0.8)}
        w="100%"
        h="100%"
        style={{
          boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.1)',
          borderRadius: '16px 16px 0 0',
        }}
      >
        <Text>配對成功！</Text>
        <Text mb={32}>開始聊天吧！</Text>

        <Stack w="100%" h="100%" gap={32}>
          {messages.map((message: MessageContentData) => (
            <MessageContent key={message.id} data={message} />
          ))}
        </Stack>
      </Stack>
      <Flex
        pos="sticky"
        bottom={0}
        align="center"
        gap={4}
        bg="soft-lime.0"
        p={8}
        w="100%"
      >
        <Button variant="subtle" px={4} c="moss-green.9" onClick={onLeaveChat}>
          離開
        </Button>
        <Input
          flex={1}
          rightSection={<Input.ClearButton />}
          rightSectionPointerEvents="auto"
          rightSectionWidth="auto"
        />
        <Button px={12}>送出</Button>
      </Flex>
    </>
  );
}
