import { useCallback, useEffect, useState } from 'react';
import { Group, Button, Loader, Text, Badge, Select } from '@mantine/core';
import { getMyBookings, updateBooking } from '@/lib/api/seatBooking';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { Booking } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';
import { Card } from '../ui/card';
import moment from 'moment';

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
        <div>
          {bookings.map((booking: Booking, index: number) => {
            if (!booking._id) return null;
            const mealKey = `${booking._id}-${booking.bookingDate}`;
            return (
              <Card
                key={`booking_${booking._id}_${index}`}
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
                    <Badge color="green" size="sm" variant="light">
                      {booking.lunchOption}
                    </Badge>
                  </Group>
                </Group>
                <Group gap="xs">
                  {editingMealKey === mealKey ? (
                    <>
                      <Select
                        value={mealEditValue ?? booking.lunchOption ?? ''}
                        onChange={setMealEditValue}
                        disabled={mealEditLoading}
                        data={[
                          { value: '', label: 'No meal' },
                          { value: 'veg', label: 'Veg' },
                          { value: 'fish', label: 'Fish' },
                          { value: 'chicken', label: 'Chicken' },
                          { value: 'egg', label: 'Egg' },
                          { value: 'seafood', label: 'Seafood' },
                        ]}
                        size="xs"
                        style={{ marginRight: 8, minWidth: 120 }}
                        allowDeselect
                        clearable
                      />
                      <Button
                        size="xs"
                        color="green"
                        loading={mealEditLoading}
                        onClick={() => handleMealEditSubmit(booking)}
                        style={{ marginRight: 4 }}
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
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="xs"
                        variant="default"
                        onClick={() => {
                          setEditingMealKey(mealKey);
                          setMealEditValue(booking.lunchOption ?? '');
                        }}
                        style={{ marginRight: 4 }}
                      >
                        Edit Meal
                      </Button>
                      <Button
                        color="red"
                        loading={
                          cancelLoading &&
                          selectedBooking?._id === booking._id &&
                          selectedBooking.bookingDate === booking.bookingDate
                        }
                        onClick={() => booking._id && openCancelDialog(booking)}
                        size="xs"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </Group>
              </Card>
            );
          })}
          <CancelDialog
            onSuccess={() => {
              fetchBookings();
              setSelectedBooking(null);
              onBookingsChanged?.();
            }}
          />
        </div>
      )}
    </div>
  );
}
