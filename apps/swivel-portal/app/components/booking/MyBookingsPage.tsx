import { useCallback, useEffect, useState } from 'react';
import {
  Group,
  Button,
  Loader,
  Text,
  Badge,
  Select,
  Table,
  Tooltip,
  Card,
} from '@mantine/core';
import { getMyBookings, updateBooking } from '@/lib/api/seatBooking';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { Booking } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';
import moment from 'moment';
import { Repeat } from 'lucide-react';

export interface MyBookingsPageProps {
  onBookingsChanged?: () => void;
  refreshSignal?: number;
}

export function MyBookingsPage({
  onBookingsChanged,
  refreshSignal,
}: MyBookingsPageProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    CancelDialog,
    cancelBooking,
    loading: cancelLoading,
  } = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingMealKey, setEditingMealKey] = useState<string | null>(null);
  const [mealEditValue, setMealEditValue] = useState<string | null>(null);
  const [mealEditLoading, setMealEditLoading] = useState(false);
  const mealOptions = [
    { value: '', label: 'No meal' },
    { value: 'veg', label: 'Veg' },
    { value: 'fish', label: 'Fish' },
    { value: 'chicken', label: 'Chicken' },
    { value: 'egg', label: 'Egg' },
    { value: 'seafood', label: 'Seafood' },
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyBookings();
      setBookings(data);
    } catch {
      setError('Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  useEffect(() => {
    if (refreshSignal === undefined || refreshSignal === 0) return;
    fetchBookings();
  }, [refreshSignal, fetchBookings]);

  const handleMealEditSubmit = async (booking: Booking) => {
    setMealEditLoading(true);
    try {
      if (!booking._id) throw new Error('Booking ID missing');
      await updateBooking(
        booking._id,
        { lunchOption: mealEditValue },
        booking.recurring ? { date: booking.bookingDate } : undefined
      );
      setEditingMealKey(null);
      setMealEditValue(null);
      fetchBookings();
    } catch (err) {
      notifications.show({
        color: 'red',
        message: err instanceof Error ? err.message : 'Failed to update meal.',
      });
    } finally {
      setMealEditLoading(false);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking ?? null);
    if (typeof booking._id === 'string') {
      cancelBooking(booking._id, booking);
    }
  };

  return (
    <div>
      {loading ? (
        <div className="flex justify-center">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <Text color="red">{error}</Text>
      ) : bookings.length === 0 ? (
        <Text>No upcoming bookings.</Text>
      ) : (
        <Card
          p="lg"
          radius="lg"
          withBorder
          shadow="sm"
          style={{ width: '100%' }}
        >
          <Table.ScrollContainer minWidth={600}>
            <Table
              highlightOnHover
              withRowBorders
              striped
              withTableBorder
              withColumnBorders
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Duration</Table.Th>
                  <Table.Th>Meal</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {bookings.map((booking: Booking, index: number) => {
                  if (!booking._id) return null;
                  const mealKey = `${booking._id}-${booking.bookingDate}`;

                  return (
                    <Table.Tr key={`booking_${booking._id}_${index}`}>
                      <Table.Td>
                        <Group gap="xs" wrap="nowrap">
                          <div>
                            <Text size="sm" fw={500}>
                              {moment(booking.bookingDate).format(
                                'dddd, MMM D YYYY'
                              )}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {booking.bookingDate}
                            </Text>
                          </div>
                          {booking.recurring ? (
                            <Tooltip label="Recurring booking" withinPortal>
                              <Repeat size={16} strokeWidth={2} />
                            </Tooltip>
                          ) : null}
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="indigo" size="sm" variant="light">
                          {booking.duration}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        {editingMealKey === mealKey ? (
                          <Select
                            value={mealEditValue ?? booking.lunchOption ?? ''}
                            onChange={setMealEditValue}
                            disabled={mealEditLoading}
                            data={mealOptions}
                            size="xs"
                            allowDeselect
                            clearable
                          />
                        ) : (
                          <Badge color="green" size="sm" variant="light">
                            {booking.lunchOption || 'No meal'}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td>
                        {editingMealKey === mealKey ? (
                          <Group gap="xs" justify="flex-start">
                            <Button
                              size="xs"
                              color="green"
                              loading={mealEditLoading}
                              onClick={() => handleMealEditSubmit(booking)}
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="default"
                              onClick={() => {
                                setEditingMealKey(null);
                                setMealEditValue(null);
                              }}
                            >
                              Discard
                            </Button>
                          </Group>
                        ) : (
                          <Group gap="xs" justify="flex-start">
                            <Button
                              size="xs"
                              variant="default"
                              onClick={() => {
                                setEditingMealKey(mealKey);
                                setMealEditValue(booking.lunchOption ?? '');
                              }}
                            >
                              Edit Meal
                            </Button>
                            <Button
                              color="red"
                              loading={
                                cancelLoading &&
                                selectedBooking?._id === booking._id &&
                                selectedBooking.bookingDate ===
                                  booking.bookingDate
                              }
                              onClick={() =>
                                booking._id && openCancelDialog(booking)
                              }
                              size="xs"
                            >
                              Cancel
                            </Button>
                          </Group>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          <CancelDialog
            onSuccess={() => {
              fetchBookings();
              setSelectedBooking(null);
              onBookingsChanged?.();
            }}
          />
        </Card>
      )}
    </div>
  );
}
