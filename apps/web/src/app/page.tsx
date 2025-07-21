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
import { useState, useRef, useEffect } from 'react';
import MessageInput from '@/components/MessageInput';
import styles from './styles.module.css';

export default function Home() {
  const [opened, { toggle }] = useDisclosure();
  const viewport = useRef<HTMLDivElement>(null);

  const [matchingStatus, setMatchingStatus] =
    useState<MatchingStatus>('standby');

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

  function handleScrollToBottom() {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: 'smooth',
    });
  }

  async function handleStartChat() {
    setMatchingStatus('waiting');

    await new Promise((resolve) =>
      setTimeout(() => {
        setMatchingStatus('matched');
        resolve(true);
      }, 1000)
    );
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
    handleScrollToBottom();
  }

  useEffect(() => {
    handleScrollToBottom();
  }, [matchingStatus, messages]);

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
      <AppShell.Header className={styles.appShellHeader}>
        <Burger
          opened={opened}
          onClick={toggle}
          classNames={{
            root: styles.burger,
            burger: styles['mantine-Burger-burger'],
          }}
        />
      </AppShell.Header>

      <AppShell.Navbar className={styles.appShellNavbar}>
        <Flex className={styles.flexContainer}>
          <div>Cozy Chat</div>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main className={styles.appShellMain}>
        <ScrollArea
          type="auto"
          scrollbarSize={8}
          className={styles.scrollArea}
          viewportRef={viewport}
        >
          <Blobs />
          <Stack mx="auto" maw={480} className={styles.outerStack}>
            <Stack className={styles.innerStack}>
              <Image
                src="/logo-full.png"
                alt="Cozy Chat"
                width={256}
                height={256}
              />
              <Title order={2} c="navy-steel.9" className={styles.title}>
                放輕鬆，隨便聊
              </Title>
              {matchingStatus === 'standby' && (
                <Button onClick={handleStartChat} className={styles.button}>
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
        </ScrollArea>
      </AppShell.Main>

      <MessageInput
        matchingStatus={matchingStatus}
        onLeaveChat={handleLeaveChat}
        onSendMessage={handleSendMessage}
      />
    </AppShell>
  );
}
