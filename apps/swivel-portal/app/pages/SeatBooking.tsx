import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
import { Button, Group, Text, Title, Paper, Loader } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import CoreLayout from '../components/CoreLayout';
import {
  BookingModal,
  type BookingDetails,
} from '@/components/booking/BookingModal';
import { getSeatAvailability } from '@/lib/api/seatBooking';
import type { SeatAvailabilityResponse } from '@swivel-portal/types';
import { notifications } from '@mantine/notifications';
import { MyBookingsModal } from '../components/booking/MyBookingsModal';
import { AllBookingsModal } from '../components/booking/AllBookingsModal';
import { useUser } from '@/lib/UserContext';

const SeatBooking = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // const navigate = useNavigate();
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [allBookingsOpen, setAllBookingsOpen] = useState(false);
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availability, setAvailability] =
    useState<SeatAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch availability when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setAvailability(null);
      setError(null);
      return;
    }
    const fetchAvailability = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;
        const data = await getSeatAvailability(dateStr);
        setAvailability(data);
      } catch (err) {
        setError('Failed to load seat availability. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [selectedDate]);

  const handleReserve = () => {
    if (selectedDate) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmBooking = async (details: BookingDetails) => {
    notifications.show({
      title: 'Booking Confirmed',
      message: `Seat reserved for ${details.startTime} - ${details.endTime}`,
    });
    setIsModalOpen(false);

    // Refetch availability to update the counts
    if (selectedDate) {
      try {
        const date = new Date(selectedDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const data = await getSeatAvailability(dateStr);
        setAvailability(data);
      } catch (err) {
        console.error('Error refreshing availability:', err);
        // Don't show error toast here since booking was successful
      }
    }
  };

  const availableSeatsCount = availability?.availableSeats ?? 0;

  return (
    <CoreLayout>
      <Group align="center" justify="space-between" mb="md">
        <Title order={2}>Seat Booking</Title>
        <Group>
          {user?.isAdmin && (
            <Button
              variant="outline"
              color="indigo"
              onClick={() => setAllBookingsOpen(true)}
            >
              View all bookings
            </Button>
          )}
          <Button variant="outline" onClick={() => setMyBookingsOpen(true)}>
            My bookings
          </Button>
        </Group>
      </Group>
      <MyBookingsModal
        opened={myBookingsOpen}
        onClose={() => setMyBookingsOpen(false)}
      />
      {user?.isAdmin && (
        <AllBookingsModal
          opened={allBookingsOpen}
          onClose={() => setAllBookingsOpen(false)}
        />
      )}
      {!selectedDate ? (
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}
          className="flex flex-col align-center justify-center"
        >
          <Title order={4} mb="md">
            Choose a date to book a seat
          </Title>
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={new Date()}
            style={{ margin: '0 auto' }}
          />
        </Paper>
      ) : (
        <Paper
          p="xl"
          radius="md"
          withBorder
          style={{ maxWidth: 400, margin: '0 auto', textAlign: 'center' }}
        >
          <Text fw={600} mb={4}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          {isLoading ? (
            <Loader size="lg" />
          ) : error ? (
            <Text color="red" size="sm">
              {error}
            </Text>
          ) : (
            <>
              <Title order={1} mb={2}>
                {availableSeatsCount}
              </Title>
              <Text size="sm" c="dimmed">
                {availableSeatsCount === 1
                  ? 'seat available'
                  : 'seats available'}
              </Text>
              {availability && (
                <Text size="xs" c="dimmed" mt={2}>
                  {availability.bookingsCount} of{' '}
                  {availability.overrideSeatCount ??
                    availability.defaultSeatCount}{' '}
                  seats booked
                </Text>
              )}
            </>
          )}
          <Group mt="md" grow>
            <Button
              onClick={() => {
                handleReserve();
              }}
              disabled={isLoading || availableSeatsCount === 0}
            >
              {isLoading
                ? 'Loading...'
                : availableSeatsCount === 0
                ? 'Fully Booked'
                : 'Book a Seat'}
            </Button>
            <Button variant="outline" onClick={() => setSelectedDate(null)}>
              Change Date
            </Button>
          </Group>
        </Paper>
      )}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
        onConfirm={handleConfirmBooking}
      />
    </CoreLayout>
  );
};

export default SeatBooking;
