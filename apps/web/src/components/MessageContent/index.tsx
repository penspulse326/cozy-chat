import { Flex, Stack, Text, alpha } from '@mantine/core';
import { Device } from '@packages/lib';

const fake_user_id = '123';

export type MessageContentData = {
  id: string;
  user_id: string;
  device: keyof typeof Device;
  message: string;
  created_at: string;
};

interface MessageContentProps {
  data: MessageContentData;
}

export default function MessageContent({ data }: MessageContentProps) {
  const { user_id, device, message, created_at } = data;
  const isUser = user_id === fake_user_id;
  const justify = isUser ? 'end' : 'start';

  return (
    <Flex justify={justify} align="end">
      <Flex
        p="xs"
        maw={360}
        bdrs="md"
        bg={alpha('var(--mantine-color-soft-lime-0)', 0.5)}
      >
        <Text
          style={{
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </Text>
      </Flex>
      <Stack
        gap={0}
        mx="8"
        mb="4"
        ta={isUser ? 'right' : 'left'}
        style={{ order: isUser ? -1 : 1 }}
      >
        <Text size="xs">{Device[device]}</Text>
        <Text size="xs">{created_at}</Text>
      </Stack>
    </Flex>
  );
}
