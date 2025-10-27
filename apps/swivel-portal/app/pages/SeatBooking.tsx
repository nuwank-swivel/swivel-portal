import { useState, useEffect } from 'react';
import { Button, Group } from '@mantine/core';
import { Grid } from '@mantine/core';
import { FloorLayout } from '@/components/booking/floorLayout/FloorLayout';
import CoreLayout from '../components/CoreLayout';
import {
  CreateBookingRequest,
  getSeatAvailability,
} from '@/lib/api/seatBooking';
import type { SeatAvailabilityResponse } from '@swivel-portal/types';
import { useBookingConfirmation } from '../hooks/useBookingConfirmation';
import { MyBookingsModal } from '../components/booking/MyBookingsModal';
import { AllBookingsModal } from '../components/booking/AllBookingsModal';
import { useAuthContext } from '@/lib/AuthContext';
import { useUIContext } from '@/lib/UIContext';
import { BookingPanel } from '@/components/booking/BookingPanel';
import moment from 'moment';
import { useCancelBooking } from '../hooks/useCancelBooking';

const tomorrow = () => moment().add(1, 'day').format('YYYY-MM-DD');

const SeatBooking = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(tomorrow);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [allBookingsOpen, setAllBookingsOpen] = useState(false);
  const { user } = useAuthContext();
  const [availability, setAvailability] =
    useState<SeatAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentModule } = useUIContext();

  const { CancelDialog, cancelBooking } = useCancelBooking();

  // Booking confirmation hook
  const {
    confirming,
    success,
    error: bookingError,
    confirmBooking,
    clearMessages,
  } = useBookingConfirmation();

  useEffect(() => {
    setCurrentModule('Seat Booking');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAvailability = async () => {
    if (!selectedDate) {
      setAvailability(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = selectedDate;
      const data = await getSeatAvailability(dateStr);
      setAvailability(data);
      setSelectedSeatId(null); // Clear seat selection when date changes
    } catch (err) {
      setError('Failed to load seat availability. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch availability when date is selected
  useEffect(() => {
    clearMessages();
    fetchAvailability();
  }, [selectedDate]);

  const handleConfirmBooking = async (
    details: CreateBookingRequest,
    resetPanelState: () => void
  ) => {
    await confirmBooking(details, () => {
      resetBookingState();
      resetPanelState();
    });
  };

  const handleCancelBooking = async () => {
    if (!availability?.myBooking) return;
    cancelBooking(availability.myBooking.bookingId);
  };

  // Helper to reset booking state
  const resetBookingState = () => {
    setSelectedDate(tomorrow());
    setSelectedSeatId(null);
    fetchAvailability();
  };

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
            selectedSeatId={selectedSeatId}
            onConfirm={handleConfirmBooking}
            confirming={confirming}
            success={success}
            error={bookingError}
            myBookedSeatId={availability?.myBooking?.seatId}
            onCancelBooking={handleCancelBooking}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <FloorLayout
            selectedSeatId={selectedSeatId}
            setSelectedSeatId={setSelectedSeatId}
            bookedSeats={availability?.bookedSeats ?? []}
            myBookedSeatId={availability?.myBooking?.seatId}
            seatAvailabilityLoading={isLoading}
          />
        </Grid.Col>
      </Grid>
      {/* <BookingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        selectedDate={selectedDate ? new Date(selectedDate) : new Date()}
        // selectedSeatId={selectedSeatId}
        onConfirm={handleConfirmBooking}
      /> */}
      <CancelDialog onSuccess={resetBookingState} />
    </CoreLayout>
  );
};

export default SeatBooking;
