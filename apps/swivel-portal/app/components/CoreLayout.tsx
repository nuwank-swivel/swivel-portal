import { AppShell, Group, Badge } from '@mantine/core';

import { ReactNode } from 'react';
import { useLocation } from 'react-router';
import UserAvatarMenu from './UserAvatarMenu';
import BackButton from './ui/BackButton';
import { useAuthContext } from '@/lib/UseAuthContext';

interface CoreLayoutProps {
  children: ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  // Removed Burger, so disclosure state is not needed
  // Removed theme as it is no longer used
  // Removed navigate as sidebar is gone
  const location = useLocation();
  const { user } = useAuthContext();

  return (
    <AppShell
      header={{ height: 60 }}
      // Removed navbar prop
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {/* Burger button removed as per requirements */}
            {location.pathname !== '/' &&
              location.pathname !== '/dashboard' && <BackButton />}
            <span style={{ fontWeight: 700, fontSize: 22 }}>Swivel Portal</span>
            {user?.isAdmin ? (
              <Badge size="sm" color="indigo">
                Admin
              </Badge>
            ) : null}
          </Group>

          {user && <UserAvatarMenu />}
        </Group>
      </AppShell.Header>
      {/* Sidebar removed as per requirements */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
