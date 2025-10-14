import { Avatar, Menu, UnstyledButton } from '@mantine/core';
import { useUser } from '@/lib/UserContext';
import LogoutButton from './LogoutButton';

export default function UserAvatarMenu() {
  const { user } = useUser();
  return (
    <Menu shadow="md" width={180} position="bottom-end">
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
        <Menu.Item>
          <LogoutButton />
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
