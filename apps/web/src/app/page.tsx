'use client';

import Blobs from '@/components/Blobs';
import ChatBox from '@/components/ChatBox';
import { MessageContentData } from '@/components/MessageContent';
import MessageInput from '@/components/MessageInput';
import useMatch from '@/hooks/useMatch';
import {
  AppShell,
  Burger,
  Button,
  Flex,
  ScrollArea,
  Stack,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from './styles.module.css';

export default function Home() {
  const [opened, { toggle }] = useDisclosure();
  const viewport = useRef<HTMLDivElement>(null);

  const { matchStatus, setMatchStatus } = useMatch();

  const [messages, setMessages] = useState<MessageContentData[]>([]);

  function handleScrollToBottom() {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: 'smooth',
    });
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
  }, [matchStatus, messages]);

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
              {matchStatus === 'standby' && (
                <Button
                  onClick={() => setMatchStatus('waiting')}
                  className={styles.button}
                >
                  開始聊天
                </Button>
              )}
            </Stack>

            {matchStatus !== 'standby' && (
              <ChatBox
                userId="123"
                messages={messages}
                matchingStatus={matchStatus}
              />
            )}
          </Stack>
        </ScrollArea>
      </AppShell.Main>

      <MessageInput
        matchingStatus={matchStatus}
        onLeave={() => setMatchStatus('quit')}
        onSendMessage={handleSendMessage}
      />
    </AppShell>
  );
}
