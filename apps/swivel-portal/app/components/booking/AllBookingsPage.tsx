import { useCallback, useEffect, useState } from 'react';
import { useExportBookingsExcel } from '@/hooks/useExportBookingsExcel';
import {
  Group,
  Loader,
  Text,
  Badge,
  Table,
  Card,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { getAllBookingsForDate } from '@/lib/api/seatBooking';
import { Button } from '../ui/button';
import { Repeat, Sheet } from 'lucide-react';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { useAuthContext } from '@/lib/AuthContext';
import { Booking } from '@swivel-portal/types';
import { SelectUsersMealEmail } from './SelectUsersMealEmail';

interface AdminBooking {
  bookingId: string;
  bookingDate: string;
  userId: string;
  userName: string;
  durationType: string;
  lunchOption?: string;
  recurring?: boolean;
  original: Booking;
}

export function AllBookingsPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const { user } = useAuthContext();
  const exportBookingsExcel = useExportBookingsExcel();
  const {
    CancelDialog,
    cancelBooking,
    loading: cancelLoading,
  } = useCancelBooking();
  const [date, setDate] = useState<Date | null>(new Date());
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(
    null
  );

  const fetchBookings = useCallback(async (dateObj: Date) => {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setLoading(true);
    setError(null);
    try {
      const data = (await getAllBookingsForDate(dateStr)) as Booking[];
      setBookings(
        data
          .filter((b) => typeof b._id === 'string')
          .map((b) => ({
            bookingId: b._id as string,
            bookingDate: b.bookingDate,
            userId: b.userId,
            userName: b.user?.name ?? '',
            durationType: b.duration ?? b.durationType,
            lunchOption: b.lunchOption,
            recurring: Boolean(b.recurring),
            original: b,
          }))
      );
    } catch {
      setError('Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user?.isAdmin || !date) {
      return;
    }

    setBookings([]);
    fetchBookings(date);
  }, [date, fetchBookings, user]);

  const handleDownloadExcel = () => exportBookingsExcel(bookings, date);

  if (!user?.isAdmin) {
    return <Text>You do not have permission to view all bookings.</Text>;
  }

  return (
    <Card p="lg" radius="lg" withBorder shadow="sm" style={{ width: '100%' }}>
      <Group mb="md" className="flex flex-row justify-between items-end">
        <DatePickerInput
          label="Select a date"
          value={date}
          onChange={(val) =>
            setDate(
              typeof val === 'string' ? (val ? new Date(val) : null) : val
            )
          }
          minDate={new Date()}
          maxDate={new Date(2100, 0, 1)}
          popoverProps={{ withinPortal: true }}
          clearable={false}
        />
        <Group>
          {bookings.length > 0 && (
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
            <Button
              type="button"
              variant="outline"
              size="xs"
              color="blue"
              onClick={() => setModalOpened(true)}
              style={{ marginLeft: 8 }}
            >
              Select users for meal email
            </Button>
          )}
        </Group>
      </Group>
      {loading ? (
        <div className="flex justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : bookings.length === 0 ? (
        <Text>No bookings for this date.</Text>
      ) : (
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          withRowBorders
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Duration</Table.Th>
              <Table.Th>Meal</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bookings.map((booking, idx) => (
              <Table.Tr
                key={`${booking.bookingId}-${booking.bookingDate}-${idx}`}
              >
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <span>{booking.userName || booking.userId}</span>
                    {booking.recurring ? (
                      <Tooltip label="Recurring booking" withinPortal>
                        <Badge
                          color="blue"
                          size="sm"
                          variant="light"
                          radius="xl"
                          px={6}
                        >
                          <Repeat size={14} strokeWidth={2} />
                        </Badge>
                      </Tooltip>
                    ) : null}
                  </Group>
                </Table.Td>
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
                <Table.Td>
                  <Group gap="xs" justify="flex-start">
                    <Button
                      type="button"
                      color="red"
                      variant="outline"
                      size="xs"
                      loading={
                        cancelLoading &&
                        selectedBooking?.bookingId === booking.bookingId &&
                        selectedBooking?.bookingDate === booking.bookingDate
                      }
                      onClick={() => {
                        setSelectedBooking(booking);
                        cancelBooking(booking.bookingId, booking.original);
                      }}
                    >
                      Cancel
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <CancelDialog
        onSuccess={() => {
          if (date) {
            setBookings([]);
            fetchBookings(date);
          }
          setSelectedBooking(null);
        }}
      />
      {/* Modal for selecting users for meal email */}
      <SelectUsersMealEmail
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </Card>
  );
}
