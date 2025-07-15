'use client';

import { TestComp } from '@/components/TestComp';
import { AppShell, Burger, Flex, Stack } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

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
        style={{
          background:
            'linear-gradient(to bottom, #A0C878 0%, #DDEB9D 50%, #A0C878 100%)',
          minHeight: '100dvh',
        }}
      >
        <Stack maw={480} mx="auto" bg="gray" gap="md">
          <TestComp />
          <TestComp />
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
