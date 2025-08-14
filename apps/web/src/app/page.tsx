'use client';

import Blobs from '@/components/Blobs';
import ChatBox from '@/components/ChatBox';
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
import { useEffect, useRef } from 'react';
import styles from './styles.module.css';

export default function Home() {
  const userId = localStorage.getItem('userId');
  const [opened, { toggle }] = useDisclosure();
  const viewport = useRef<HTMLDivElement>(null);

  const { matchStatus, setMatchStatus, messages, emitChatSend } = useMatch();

  function handleScrollToBottom() {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
      behavior: 'smooth',
    });
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
                userId={userId}
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
        onChatSend={emitChatSend}
      />
    </AppShell>
  );
}
