import {
  AppShell,
  Group,
  Burger,
  NavLink,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import LogoutButton from './LogoutButton';

interface CoreLayoutProps {
  children: ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const theme = useMantineTheme();
  const navigate = useNavigate();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <span style={{ fontWeight: 700, fontSize: 22 }}>Swivel Portal</span>
          </Group>
          <LogoutButton />
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <NavLink label="Dashboard" onClick={() => navigate('/')} />
        <NavLink
          label="Seat Booking"
          onClick={() => navigate('/seat-booking')}
        />
        {/* Add more navigation links as needed */}
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
