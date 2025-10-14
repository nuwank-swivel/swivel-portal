import { useEffect, useState } from 'react';
import {
  Modal,
  Group,
  Button,
  Paper,
  Loader,
  Text,
  Title,
  Badge,
} from '@mantine/core';
import { getMyBookings, cancelBooking } from '@/lib/api/seatBooking';
import { Booking } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';
import { Card } from '../ui/card';
import moment from 'moment';

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
        <div className="flex justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : bookings.length === 0 ? (
        <Text>No upcoming bookings.</Text>
      ) : (
        <div>
          {bookings.map((booking: Booking) =>
            booking._id ? (
              <Card
                key={booking._id}
                mb="sm"
                radius="md"
                className="flex flex-row justify-between items-center"
                withBorder
              >
                <Group className="flex flex-col items-start gap-0">
                  <Group className="flex flex-row gap-1">
                    <Text size="md">
                      {moment(booking.bookingDate).format('dddd')}
                    </Text>
                    <Text size="sm" c="dimmed">
                      ({booking.bookingDate})
                    </Text>
                    <Badge color="indigo" size="sm" variant="light">
                      {booking.duration}
                    </Badge>
                  </Group>
                </Group>
                <Button
                  color="red"
                  loading={cancelingId === booking._id}
                  onClick={() => handleCancel(booking._id!)}
                  size="xs"
                >
                  Cancel
                </Button>
              </Card>
            ) : null
          )}
        </div>
      )}
    </Modal>
  );
}
