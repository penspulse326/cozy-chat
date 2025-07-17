'use client';

import Blobs from '@/components/Blobs';
import ChatBox from '@/components/ChatBox';
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

export default function Home() {
  const [opened, { toggle }] = useDisclosure();

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
        <Blobs />
        <ScrollArea h="100dvh" scrollbarSize={8}>
          <Stack
            justify="center"
            align="center"
            mx="auto"
            maw={480}
            mih="100dvh"
          >
            <Stack align="center" gap={0}>
              <Image
                src="/logo-full.png"
                alt="Cozy Chat"
                width={256}
                height={256}
              />
              <Title c="navy-steel.9" fz={28}>
                放輕鬆，隨便聊
              </Title>
              <Button
                px={12}
                mt={64}
                h={64}
                radius="lg"
                color="navy-steel.9"
                fz={36}
                fw={400}
              >
                開始聊天
              </Button>
            </Stack>
            <ChatBox />
          </Stack>
        </ScrollArea>
      </AppShell.Main>
    </AppShell>
  );
}
