import { useEffect, useState } from 'react';
import {
  Modal,
  Group,
  Loader,
  Text,
  Table,
  Button as MantineButton,
  MultiSelect,
  Notification,
} from '@mantine/core';
import { searchUsers } from '@/lib/api/user';
import {
  getMealNotifications,
  addMealNotification,
  deleteMealNotification,
  MealNotificationSettings,
} from '@/lib/api/meal';

interface SelectUsersMealEmailProps {
  opened: boolean;
  onClose: () => void;
}

export function SelectUsersMealEmail({
  opened,
  onClose,
}: SelectUsersMealEmailProps) {
  const [users, setUsers] = useState<MealNotificationSettings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  // Fetch all meal notification users (admin view)
  useEffect(() => {
    if (!opened) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    // Try to get all users (API may need to be adjusted to support this)
    getMealNotifications()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.userEmail) {
          setUsers([data]);
        } else {
          setUsers([]);
        }
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [opened]);

  // User search for adding
  const handleUserSearch = async (q: string) => {
    setUserSearch(q);
    if (!q) {
      setUserOptions([]);
      return;
    }
    setUserLoading(true);
    try {
      const results = await searchUsers(q);
      // Remove already enabled users from search results
      const enabledEmails = new Set(users.map((u) => u.userEmail));
      setUserOptions(
        results.filter((email: string) => !enabledEmails.has(email))
      );
    } finally {
      setUserLoading(false);
    }
  };

  // Add selected users
  const handleAddUsers = async () => {
    if (!selectedUsers.length) return;
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      await Promise.all(
        selectedUsers.map((email) => addMealNotification({ userEmail: email }))
      );
      setSuccess('Users added successfully.');
      setSelectedUsers([]);
      setUserSearch('');
      setUserOptions([]);
      // Refresh list
      getMealNotifications().then((data: any) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && data.userEmail) {
          setUsers([data]);
        } else {
          setUsers([]);
        }
      });
    } catch {
      setError('Failed to add users.');
    } finally {
      setAdding(false);
    }
  };

  // Remove user
  const handleRemoveUser = async (userEmail: string) => {
    setRemoving(userEmail);
    setError(null);
    setSuccess(null);
    try {
      await deleteMealNotification(userEmail);
      setSuccess('User removed.');
      setUsers((prev) => prev.filter((u) => u.userEmail !== userEmail));
    } catch {
      setError('Failed to remove user.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select Users for Meal Email"
      size="lg"
    >
      {error && <Notification color="red">{error}</Notification>}
      {success && <Notification color="green">{success}</Notification>}
      <Text mb="sm">Current users set to receive meal notifications:</Text>
      {loading ? (
        <Loader />
      ) : (
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          mb="md"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Email</Table.Th>
              <Table.Th>Preferred Time</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={3} style={{ textAlign: 'center' }}>
                  No users set.
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((u) => (
                <Table.Tr key={u.userEmail}>
                  <Table.Td>{u.userEmail}</Table.Td>
                  <Table.Td>{u.preferredTimeUTC || '-'}</Table.Td>
                  <Table.Td>
                    <MantineButton
                      color="red"
                      size="xs"
                      variant="outline"
                      loading={removing === u.userEmail}
                      onClick={() => handleRemoveUser(u.userEmail)}
                      disabled={removing !== null && removing !== u.userEmail}
                    >
                      Remove
                    </MantineButton>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      )}
      <Text mb="xs">Add new users:</Text>
      <MultiSelect
        data={userOptions}
        searchable
        value={selectedUsers}
        onChange={setSelectedUsers}
        onSearchChange={handleUserSearch}
        searchValue={userSearch}
        placeholder="Search and select users"
        rightSection={userLoading ? <Loader size={16} /> : null}
        nothingFoundMessage={userSearch ? 'No users' : 'Type to search'}
        disabled={adding}
        mb="sm"
      />
      <Group mt="md" justify="flex-end">
        <MantineButton variant="outline" onClick={onClose} disabled={adding}>
          Close
        </MantineButton>
        <MantineButton
          onClick={handleAddUsers}
          loading={adding}
          disabled={adding || selectedUsers.length === 0}
          color="blue"
        >
          Add Selected Users
        </MantineButton>
      </Group>
    </Modal>
  );
}
