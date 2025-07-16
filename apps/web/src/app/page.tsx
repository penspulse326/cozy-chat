'use client';

import {
  AppShell,
  Burger,
  Button,
  Center,
  Flex,
  Stack,
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
        bg="linear-gradient(to bottom, #DDEB9D 50%, #27667B 150%)"
      >
        <Center mx="auto" maw={480} mih="100dvh">
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
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
