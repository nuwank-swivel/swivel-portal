import { AppShell, Group, Badge } from '@mantine/core';

import { ReactNode } from 'react';
import { useLocation, useNavigation } from 'react-router';
import UserAvatarMenu from './UserAvatarMenu';
import BackButton from './ui/BackButton';
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';
import ThemeToggle from './ui/ThemeToggle';

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
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header className="border-0 bg-background transition-colors">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {location.pathname !== '/' &&
              location.pathname !== '/dashboard' && <BackButton />}
            {currentModule ? (
              <span className="text-[22px] font-bold text-foreground">
                {currentModule}
              </span>
            ) : (
              <h3 className="mt-1 text-sm font-medium text-muted-foreground">
                {/* Welcome back, {user?.name}! Select a tool to get started. */}
              </h3>
            )}
          </Group>

          <Group>
            <ThemeToggle />
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
      <AppShell.Main className="bg-background transition-colors">
        <>
          {state === 'loading' && (
            <div
              className="absolute top-0 left-0 w-full h-1.5 bg-blue-500 animate-pulse"
              style={{ zIndex: 1000 }}
            />
          )}
          {children}
        </>
      </AppShell.Main>
    </AppShell>
  );
}
