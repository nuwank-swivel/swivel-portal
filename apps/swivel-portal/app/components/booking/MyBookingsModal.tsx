import { useEffect, useState } from 'react';
import {
  Modal,
  Group,
  Button,
  Paper,
  Loader,
  Text,
  Title,
} from '@mantine/core';
import { getMyBookings, cancelBooking } from '@/lib/api/seatBooking';
import { Booking } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';

interface MyBookingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function MyBookingsModal({ opened, onClose }: MyBookingsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) fetchBookings();
  }, [opened]);

  const handleCancel = async (id: string) => {
    setCancelingId(id);
    try {
      await cancelBooking(id);
      notifications.show({
        title: 'Booking canceled',
        message: 'Your booking was canceled.',
      });
      fetchBookings();
    } catch {
      notifications.show({
        title: 'Error',
        message: 'Failed to cancel booking',
        color: 'red',
      });
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="My Bookings" size="lg">
      {loading ? (
        <Loader size="lg" />
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : bookings.length === 0 ? (
        <Text>No upcoming bookings.</Text>
      ) : (
        <Paper p="md" radius="md" withBorder>
          {bookings.map((booking: Booking) =>
            booking._id ? (
              <Group key={booking._id} mb="sm">
                <div>
                  <Text fw={600}>{booking.seatId}</Text>
                  <Text size="sm">
                    {booking.bookingDate} ({booking.duration})
                  </Text>
                </div>
                <Button
                  color="red"
                  loading={cancelingId === booking._id}
                  onClick={() => handleCancel(booking._id!)}
                  size="xs"
                >
                  Cancel
                </Button>
              </Group>
            ) : null
          )}
        </Paper>
      )}
    </Modal>
  );
}
