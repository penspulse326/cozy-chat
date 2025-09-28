'use client';

import Blobs from '@/components/Blobs';
import ChatActionBar from '@/components/ChatActionBar';
import ChatBox from '@/components/ChatBox';
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
import { useDisclosure, useLocalStorage } from '@mantine/hooks';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './styles.module.css';

export default function Home() {
  const [userId] = useLocalStorage<string | null>({
    key: 'userId',
    defaultValue: null,
  });

  const [opened, { toggle }] = useDisclosure();
  const viewport = useRef<HTMLDivElement>(null);

  const {
    matchStatus,
    setMatchStatus,
    messages,
    sendMessage,
    readMessage,
    isBlocked,
  } = useMatch();

  function handleScrollToBottom() {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    handleScrollToBottom();
    console.log('isBlocked', isBlocked);
  }, [matchStatus, messages, isBlocked]);

  return (
    <AppShell
      navbar={{
        width: 280,
        breakpoint: 0,
        collapsed: {
          mobile: !opened,
          desktop: !opened,
        },
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
              <Title order={2} className={styles.title}>
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
                userId={userId}
                messages={messages}
                matchStatus={matchStatus}
                isBlocked={isBlocked}
                onRead={readMessage}
              />
            )}
          </Stack>
        </ScrollArea>
      </AppShell.Main>

      <ChatActionBar
        matchStatus={matchStatus}
        isBlocked={isBlocked}
        onLeave={() => setMatchStatus('quit')}
        onSend={sendMessage}
      />
    </AppShell>
  );
}
