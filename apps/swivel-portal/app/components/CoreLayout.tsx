import { AppShell, Group, Badge } from '@mantine/core';

import { ReactNode } from 'react';
import { useLocation, useNavigation } from 'react-router';
import UserAvatarMenu from './UserAvatarMenu';
import BackButton from './ui/BackButton';
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';

declare const __APP_VERSION__: string;

interface CoreLayoutProps {
  children: ReactNode;
}

export default function CoreLayout({ children }: CoreLayoutProps) {
  // Removed Burger, so disclosure state is not needed
  // Removed theme as it is no longer used
  // Removed navigate as sidebar is gone
  const location = useLocation();
  const { state } = useNavigation();
  const { user } = useAuthContext();
  const { currentModule } = useUIContext();

  return (
    <AppShell
      header={{ height: 60 }}
      // Removed navbar prop
      padding="md"
    >
      <AppShell.Header className="bg-gray-50 border-0">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {location.pathname !== '/' &&
              location.pathname !== '/dashboard' && <BackButton />}
            {currentModule ? (
              <span style={{ fontWeight: 700, fontSize: 22 }}>
                {currentModule}
              </span>
            ) : (
              <h3 style={{ color: '#6B7280', marginTop: 4 }}>
                {/* Welcome back, {user?.name}! Select a tool to get started. */}
              </h3>
            )}
          </Group>

          <Group>
            <Badge color="gray" variant="light" size="xs">
              v
              {typeof __APP_VERSION__ !== 'undefined'
                ? __APP_VERSION__
                : '0.0.0'}
            </Badge>
            {user && <UserAvatarMenu />}
          </Group>
        </Group>
      </AppShell.Header>
      {/* Sidebar removed as per requirements */}
      <AppShell.Main className="bg-gray-50">
        <>
          {state === 'loading' && (
            <div
              className="absolute top-0 left-0 w-full h-2 bg-blue-500 animate-pulse"
              style={{ zIndex: 1000 }}
            />
          )}
          {children}
        </>
      </AppShell.Main>
    </AppShell>
  );
}
