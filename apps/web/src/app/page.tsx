'use client';

import Blobs from '@/components/Blobs';
import ChatBox from '@/components/ChatBox';
import { MessageContentData } from '@/components/MessageContent';
import { MatchingStatus } from '@/types';
import {
  AppShell,
  Burger,
  Button,
  Flex,
  Stack,
  Title,
  ScrollArea,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import { useState } from 'react';
import MessageInput from '@/components/MessageInput';

export default function Home() {
  const [opened, { toggle }] = useDisclosure();
  const [messages, setMessages] = useState<MessageContentData[]>([
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
  ]);
  const [matchingStatus, setMatchingStatus] =
    useState<MatchingStatus>('standby');

  function handleStartChat() {
    setMatchingStatus('matched');
  }

  function handleLeaveChat() {
    setMatchingStatus('standby');
  }

  function handleSendMessage(message: string) {
    setMessages([
      ...messages,
      {
        id: (messages.length + 1).toString(),
        user_id: '123',
        device: 'PC',
        message,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 0,
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
      layout="alt"
    >
      <AppShell.Header bg="transparent" bd="none">
        <Burger
          opened={opened}
          onClick={toggle}
          color="navy-steel.9"
          size={36}
          m={16}
        />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Flex justify="space-between" align="center">
          <div>Cozy Chat</div>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main
        p={0}
        bg="soft-lime.2"
        style={{
          backdropFilter: 'blur(1px)',
          overflow: 'hidden',
        }}
      >
        {/* <Blobs /> */}
        <Stack mx="auto" maw={480}>
          <Stack justify="center" align="center" gap={0} flex={1} mih="100dvh">
            <Image
              src="/logo-full.png"
              alt="Cozy Chat"
              width={256}
              height={256}
            />
            <Title order={2} c="navy-steel.9" fz={28}>
              放輕鬆，隨便聊
            </Title>
            {matchingStatus === 'standby' && (
              <Button
                pos="absolute"
                bottom="10%"
                mt={64}
                px={12}
                h={64}
                radius="lg"
                color="navy-steel.9"
                fz={36}
                onClick={handleStartChat}
              >
                開始聊天
              </Button>
            )}
          </Stack>

          {matchingStatus !== 'standby' && (
            <ChatBox
              userId="123"
              messages={messages}
              matchingStatus={matchingStatus}
              onLeaveChat={handleLeaveChat}
            />
          )}
        </Stack>
      </AppShell.Main>

      <MessageInput
        matchingStatus={matchingStatus}
        onLeaveChat={handleLeaveChat}
        onSendMessage={handleSendMessage}
      />
    </AppShell>
  );
}
