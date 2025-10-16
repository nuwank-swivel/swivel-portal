import { AppShell, Group, Badge } from '@mantine/core';

import { ReactNode } from 'react';
import { useLocation } from 'react-router';
import UserAvatarMenu from './UserAvatarMenu';
import BackButton from './ui/BackButton';
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';

interface CoreLayoutProps {
  children: ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  // Removed Burger, so disclosure state is not needed
  // Removed theme as it is no longer used
  // Removed navigate as sidebar is gone
  const location = useLocation();
  const { user } = useAuthContext();
  const { currentModule } = useUIContext();

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
            {currentModule ? (
              <span style={{ fontWeight: 700, fontSize: 22 }}>
                {currentModule}
              </span>
            ) : (
              <h3 style={{ color: '#6B7280', marginTop: 4 }}>
                Welcome back, {user?.name}! Select a tool to get started.
              </h3>
            )}
          </Group>

          {user && <UserAvatarMenu />}
        </Group>
      </AppShell.Header>
      {/* Sidebar removed as per requirements */}
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
