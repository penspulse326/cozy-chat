'use client';

import { AppShell, Burger, Button } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

export default function Home() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <div>Logo</div>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar</AppShell.Navbar>

      <AppShell.Main>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <Button>primary</Button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '10px',
          }}
        >
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Button key={index} color={`moss-green.${index}`}>
                moss-green.{index}
              </Button>
            ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '10px',
          }}
        >
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Button key={index} color={`deep-teal.${index}`}>
                deep-teal.{index}
              </Button>
            ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '10px',
          }}
        >
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Button key={index} color={`navy-steel.${index}`}>
                navy-steel.{index}
              </Button>
            ))}
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '10px',
          }}
        >
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <Button key={index} color={`soft-lime.${index}`}>
                soft-lime.{index}
              </Button>
            ))}
        </div>
      </AppShell.Main>
    </AppShell>
  );
}
