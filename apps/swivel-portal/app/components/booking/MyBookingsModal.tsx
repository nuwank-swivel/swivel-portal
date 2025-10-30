import { useEffect, useState } from 'react';
import { Modal, Group, Button, Loader, Text, Badge } from '@mantine/core';
import { Select } from '@mantine/core';
import { getMyBookings } from '@/lib/api/seatBooking';
import { updateBookingMeal } from '@/lib/api/seatBooking';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { Booking } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';
// Removed unused imports
import { Card } from '../ui/card';
import moment from 'moment';

interface MyBookingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function MyBookingsModal({ opened, onClose }: MyBookingsModalProps) {
  // Submit meal edit using libs/api
  const handleMealEditSubmit = async (booking: Booking) => {
    setMealEditLoading(true);
    try {
      if (!booking._id) throw new Error('Booking ID missing');
      await updateBookingMeal(booking._id, booking.bookingDate, mealEditValue);
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    CancelDialog,
    cancelBooking,
    loading: cancelLoading,
  } = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // Use composite key for editing meal: id-date
  const [editingMealKey, setEditingMealKey] = useState<string | null>(null);
  const [mealEditValue, setMealEditValue] = useState<string | null>(null);
  const [mealEditLoading, setMealEditLoading] = useState(false);

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
    if (!opened) {
      setBookings([]);
      setLoading(true);
      setError(null);
      setSelectedBooking(null);
    }
  }, [opened]);

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking ?? null);
    // Always pass the booking object with the correct bookingDate for this occurrence
    if (typeof booking._id === 'string') {
      cancelBooking(booking._id, booking);
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
          {bookings.map((booking: Booking, index: number) => {
            if (!booking._id) return null;
            const mealKey = `${booking._id}-${booking.bookingDate}`;
            return (
              <Card
                key={`booking._id-${index}`}
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
          {/* Unified Cancel Dialog */}
          <CancelDialog onSuccess={fetchBookings} />
        </div>
      )}
    </Modal>
  );
}
