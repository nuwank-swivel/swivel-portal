import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router';
import { Button, Group, Text, Title, Paper, Loader } from '@mantine/core';
import { Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { FloorLayout } from '@/components/booking/floorLayout/FloorLayout';
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
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';
import { BookingPanel } from '@/components/booking/BookingPanel';

const SeatBooking = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  // const navigate = useNavigate();
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [allBookingsOpen, setAllBookingsOpen] = useState(false);
  const { user } = useAuthContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availability, setAvailability] =
    useState<SeatAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentModule } = useUIContext();

  useEffect(() => {
    setCurrentModule('Seat Booking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setSelectedDate(null);
  };

  const availableSeatsCount = availability?.availableSeats ?? 0;

  return (
    <CoreLayout>
      <Group align="center" justify="space-between" mb="md">
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

      {/* Use Mantine Grid for two-column layout */}
      <Grid gutter="xl">
        <Grid.Col span={4}>
          <BookingPanel
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <FloorLayout />
        </Grid.Col>
      </Grid>
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
