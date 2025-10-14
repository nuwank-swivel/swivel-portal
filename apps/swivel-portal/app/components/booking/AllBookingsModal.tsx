import { useEffect, useState } from 'react';
import { Modal, Group, Loader, Text, Badge, Table } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { getAllBookingsForDate } from '@/lib/api/seatBooking';

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
  // Use a calendar dropdown for date selection
  const [date, setDate] = useState<Date | null>(new Date());
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async (dateObj: Date) => {
    if (!dateObj) return;
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBookingsForDate(dateStr);
      setBookings(data);
    } catch {
      setError('Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened && date) {
      fetchBookings(date);
    }
  }, [opened, date]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="All Bookings (Admin)"
      size="lg"
    >
      <Group mb="md">
        <DatePickerInput
          label="Select a date"
          value={date}
          onChange={(val: string | null) => setDate(val ? new Date(val) : null)}
          minDate={new Date()}
          maxDate={new Date(2100, 0, 1)}
          popoverProps={{ withinPortal: true }}
          clearable={false}
        />
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
