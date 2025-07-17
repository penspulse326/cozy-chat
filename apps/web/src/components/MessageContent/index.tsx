import { Flex, Stack, Text, alpha } from '@mantine/core';

interface MessageContentProps {
  isUser: boolean;
  message: string;
  created_at: string;
}

export default function MessageContent({
  isUser,
  message,
  created_at,
}: MessageContentProps) {
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
        <Text size="xs">行動裝置</Text>
        <Text size="xs">{created_at}</Text>
      </Stack>
    </Flex>
  );
}
