import { useEffect, useState } from 'react';
import { useExportBookingsExcel } from '@/hooks/useExportBookingsExcel';
import {
  Modal,
  Group,
  Loader,
  Text,
  Badge,
  Table,
  Button as MantineButton,
  MultiSelect,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { getAllBookingsForDate } from '@/lib/api/seatBooking';
import { Button } from '../ui/button';
import { searchUsers } from '@/lib/api/user';
import {
  putMealNotifications,
  getEnabledMealNotificationUsers,
  EnabledMealNotificationUser,
} from '@/lib/api/meal';
import { notifications } from '@mantine/notifications';
import { Sheet } from 'lucide-react';
import { useAuthContext } from '@/lib/AuthContext';
import { Booking } from '@swivel-portal/types';

interface AllBookingsModalProps {
  opened: boolean;
  onClose: () => void;
}

interface AdminBooking {
  userId: string;
  userName: string;
  durationType: string;
  lunchOption?: string;
}

export function AllBookingsModal({ opened, onClose }: AllBookingsModalProps) {
  const { user } = useAuthContext();
  const exportBookingsExcel = useExportBookingsExcel();
  // Use a calendar dropdown for date selection
  const [date, setDate] = useState<Date | null>(new Date());
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectUsersOpened, setSelectUsersOpened] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userOptions, setUserOptions] = useState<string[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [enabledUsers, setEnabledUsers] = useState<
    EnabledMealNotificationUser[]
  >([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const fetchBookings = async (dateObj: Date) => {
    if (!dateObj) return;
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setLoading(true);
    setError(null);
    try {
      const data = (await getAllBookingsForDate(dateStr)) as Booking[];
      setBookings(
        data.map((b) => ({
          userId: b.userId,
          userName: b.user?.name ?? '',
          durationType: b.durationType,
          lunchOption: b.lunchOption,
        }))
      );
    } catch {
      setError('Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = () => exportBookingsExcel(bookings, date);

  // Fetch all users with receiveDailyEmail enabled (admin only)
  const openSelectUsers = async () => {
    setSelectedUsers([]);
    setUserSearch('');
    setUserOptions([]);
    setSelectUsersOpened(true);
    setUserLoading(true);
    try {
      if (user?.isAdmin) {
        const enabled = await getEnabledMealNotificationUsers();
        setEnabledUsers(enabled);
      }
    } catch {
      // ignore
    } finally {
      setUserLoading(false);
    }
  };

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
      const enabledIds = new Set(enabledUsers.map((u) => u.userId));
      setUserOptions(results.filter((id: string) => !enabledIds.has(id)));
    } finally {
      setUserLoading(false);
    }
  };

  const saveMealEmailUsers = async () => {
    if (!selectedUsers.length) {
      setSelectUsersOpened(false);
      return;
    }
    setSaveLoading(true);
    try {
      await Promise.all(
        selectedUsers.map((email) =>
          putMealNotifications({
            userId: email,
            receiveDailyEmail: true,
            addedBy: user?.email || user?.azureAdId,
            updatedBy: user?.email || user?.azureAdId,
          })
        )
      );
      notifications.show({
        title: 'Saved',
        message: 'Users enabled for daily meal emails',
        color: 'green',
      });
      // Refresh enabled users list
      const enabled = await getEnabledMealNotificationUsers();
      setEnabledUsers(enabled);
      setSelectedUsers([]);
      setUserSearch('');
      setUserOptions([]);
      setSelectUsersOpened(false);
    } catch {
      notifications.show({
        title: 'Save failed',
        message: 'Could not update users',
        color: 'red',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  // Remove/disable a user
  const handleRemoveEnabledUser = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await putMealNotifications({
        userId,
        receiveDailyEmail: false,
        updatedBy: user?.email || user?.azureAdId,
      });
      notifications.show({
        title: 'Removed',
        message: 'User removed from daily meal emails',
        color: 'green',
      });
      // Refresh enabled users list
      const enabled = await getEnabledMealNotificationUsers();
      setEnabledUsers(enabled);
    } catch {
      notifications.show({
        title: 'Remove failed',
        message: 'Could not remove user',
        color: 'red',
      });
    } finally {
      setRemovingUserId(null);
    }
  };

  useEffect(() => {
    if (opened && date) {
      setBookings([]);
      fetchBookings(date);
    }
  }, [opened, date]);

  useEffect(() => {
    if (!opened) {
      setDate(new Date());
      setBookings([]);
      setLoading(false);
      setError(null);
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="All Bookings (Admin)"
      size="lg"
    >
      <Group mb="md" className="flex flex-row justify-between items-end">
        <DatePickerInput
          label="Select a date"
          value={date}
          onChange={(val: string | null) => setDate(val ? new Date(val) : null)}
          minDate={new Date()}
          maxDate={new Date(2100, 0, 1)}
          popoverProps={{ withinPortal: true }}
          clearable={false}
        />
        <Group>
          {user?.isAdmin && bookings.length > 0 && (
            <Button
              onClick={handleDownloadExcel}
              type="button"
              variant="outline"
              data-testid="download-excel-btn"
              size="xs"
              color="green"
            >
              <Sheet size="20" className="mr-2" />
              Download as Excel
            </Button>
          )}
          {user?.isAdmin && (
            <MantineButton variant="light" size="xs" onClick={openSelectUsers}>
              Select users for meal email
            </MantineButton>
          )}
        </Group>
      </Group>
      {/* Select Users for Meal Email Modal */}
      <Modal
        opened={selectUsersOpened}
        onClose={() => setSelectUsersOpened(false)}
        title="Select users for meal email"
        centered
        size="50vw"
        styles={{
          content: { minWidth: 'min(500px, 100vw)', maxWidth: '50vw' },
        }}
      >
        <Text mb="sm">Enabled users:</Text>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          mb="md"
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  User ID
                </span>
              </Table.Th>
              <Table.Th>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Added By
                </span>
              </Table.Th>
              <Table.Th>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Updated By
                </span>
              </Table.Th>
              <Table.Th>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Updated At
                </span>
              </Table.Th>
              <Table.Th>
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                  Action
                </span>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {enabledUsers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5} style={{ textAlign: 'center' }}>
                  No users enabled
                </Table.Td>
              </Table.Tr>
            ) : (
              enabledUsers.map((u) => (
                <Table.Tr key={u.userId}>
                  <Table.Td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#333',
                        display: 'inline-block',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.userId}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'inline-block',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: '#888',
                          marginRight: 4,
                        }}
                      >
                        Added:
                      </span>
                      {u.addedBy || '-'}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'inline-block',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: '#888',
                          marginRight: 4,
                        }}
                      >
                        Upd:
                      </span>
                      {u.updatedBy || '-'}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'inline-block',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.updatedAt
                        ? new Date(u.updatedAt).toLocaleString()
                        : '-'}
                    </span>
                  </Table.Td>
                  <Table.Td>
                    <MantineButton
                      color="red"
                      size="compact-xs"
                      loading={removingUserId === u.userId}
                      onClick={() => handleRemoveEnabledUser(u.userId)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        height: 22,
                      }}
                      disabled={
                        removingUserId !== null && removingUserId !== u.userId
                      }
                    >
                      Remove
                    </MantineButton>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
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
        />
        <Group mt="md" justify="flex-end">
          <MantineButton
            variant="outline"
            onClick={() => setSelectUsersOpened(false)}
            disabled={saveLoading}
          >
            Cancel
          </MantineButton>
          <MantineButton
            onClick={saveMealEmailUsers}
            loading={saveLoading}
            disabled={saveLoading}
          >
            Save
          </MantineButton>
        </Group>
      </Modal>
      {loading ? (
        <div className="flex justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : bookings.length === 0 ? (
        <Text>No bookings for this date.</Text>
      ) : (
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Meal</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((booking, idx) => (
              <Table.Tr key={idx}>
                <Table.Td>{booking.userName || booking.userId}</Table.Td>
                <Table.Td>
                  <Badge color="indigo" size="sm" variant="light">
                    {booking.durationType}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {booking.lunchOption ? (
                    <Badge color="teal" size="sm" variant="light">
                      {booking.lunchOption}
                    </Badge>
                  ) : (
                    <span style={{ color: '#aaa' }}>-</span>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Modal>
  );
}
