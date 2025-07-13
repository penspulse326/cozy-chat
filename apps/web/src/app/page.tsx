'use client';

import MessageBox from '@/components/MessageBox';
import { TestComp } from '@/components/TestComp';
import { AppShell, Burger, Flex, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Home() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: !opened },
      }}
      padding="md"
    >
      <AppShell.Header bg="transparent" bd="none">
        <Burger opened={opened} onClick={toggle} size="sm" m="16" />
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Flex justify="space-between" align="center">
          <div>Cozy Chat</div>
          <Burger
            opened={opened}
            onClick={toggle}
            size="sm"
            style={{ margin: '16px' }}
          />
        </Flex>

        {/* Navbar content */}
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          background:
            'linear-gradient(to bottom, #A0C878 0%, #DDEB9D 50%, #A0C878 100%)',
          minHeight: '100dvh',
        }}
      >
        <Stack maw={480} mx="auto" bg="gray" gap="md">
          <MessageBox isUser={false} message="Hello" created_at="2021-01-01" />
          <MessageBox
            isUser={true}
            message="HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello"
            created_at="2021-01-01"
          />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
