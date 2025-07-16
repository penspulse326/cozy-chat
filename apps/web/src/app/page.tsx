'use client';

import { TestComp } from '@/components/TestComp';
import {
  AppShell,
  Burger,
  Button,
  Center,
  Flex,
  Stack,
  Text,
  Title,
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
        <Burger opened={opened} onClick={toggle} size="lg" m="16" />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Flex justify="space-between" align="center">
          <div>Cozy Chat</div>
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main
        p={0}
        bg="radial-gradient(circle, #DDEB9D 0%, #A0C878 75%, #27667B 150%)"
      >
        <Center mx="auto" maw={480} mih="100dvh">
          <Stack align="center" gap="lg">
            <Image
              src="/logo-full.svg"
              alt="Cozy Chat"
              width={256}
              height={256}
            />
            <Title c="deep-teal.9" fz={32}>
              放鬆心情，隨便聊聊
            </Title>
            <Button
              my="lg"
              h={{ base: 56, md: 72 }}
              radius="lg"
              color="deep-teal.9"
              fz={{ base: 36, md: 48 }}
            >
              開始聊天
            </Button>
          </Stack>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
