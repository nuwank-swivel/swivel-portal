import { Avatar, Group, Menu, UnstyledButton } from '@mantine/core';
import { useAuthContext } from '@/lib/AuthContext';
import { Badge } from './ui/badge';

export default function UserAvatarMenu() {
  const { user } = useAuthContext();
  return (
    <Group className="flex flex-row items-center gap-2">
      {user?.isAdmin ? (
        <Badge size="sm" color="indigo">
          Admin
        </Badge>
      ) : null}
      {/* <Menu shadow="md" width={180} position="bottom-end">
        <Menu.Target>
          <UnstyledButton>
            <Avatar color="indigo" radius="xl" size={36}>
              {user?.name?.[0] || user?.email?.[0] || 'U'}
            </Avatar>
          </UnstyledButton>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{user?.name || user?.email || 'User'}</Menu.Label>
          <Menu.Divider />
        </Menu.Dropdown>
      </Menu> */}
    </Group>
  );
}
