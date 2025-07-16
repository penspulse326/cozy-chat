'use client';

import { TestComp } from '@/components/TestComp';
import { AppShell, Burger, Center, Flex, Stack, Title } from '@mantine/core';
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
        p={0}
        bg="linear-gradient(to bottom, #A0C878 0%, #DDEB9D 50%, #A0C878 100%)"
      >
        <Center mx="auto" maw={480} mih="100dvh">
          <Stack align="center" gap="xl">
            <img
              src="/logo-full.svg"
              alt="Cozy Chat"
              style={{
                maxWidth: '300px',
                height: 'auto',
                filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.1))',
                transition: 'transform 0.3s ease',
              }}
            />
            <Title>Cozy Chat</Title>
          </Stack>
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
