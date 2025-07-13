import { Box, Flex, Text } from '@mantine/core';

interface MessageBoxProps {
  isUser: boolean;
  message: string;
  created_at: string;
}

export default function MessageBox({
  isUser,
  message,
  created_at,
}: MessageBoxProps) {
  const justify = isUser ? 'end' : 'start';

  return (
    <Flex justify={justify} align="end">
      <Flex p="xs" maw={360} bg="white">
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
      <Box m="4" style={{ order: isUser ? -1 : 1 }}>
        <Text size="xs">行動裝置</Text>
        <Text size="xs">{created_at}</Text>
      </Box>
    </Flex>
  );
}
