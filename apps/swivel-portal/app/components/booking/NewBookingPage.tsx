import { useState, useEffect, useCallback } from 'react';
import { Grid, Text } from '@mantine/core';
import moment from 'moment';

import {
  CreateBookingRequest,
  getSeatAvailability,
} from '@/lib/api/seatBooking';
import type { SeatAvailabilityResponse } from '@swivel-portal/types';

import { BookingPanel } from './BookingPanel';
import { FloorLayout } from './floorLayout/FloorLayout';
import { useBookingConfirmation } from '@/hooks/useBookingConfirmation';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { Logger } from '@/lib/logger';

interface NewBookingPageProps {
  refreshSignal: number;
  onBookingChanged?: () => void;
}

const tomorrow = () => moment().add(1, 'day').format('YYYY-MM-DD');

export function NewBookingPage({
  refreshSignal,
  onBookingChanged,
}: NewBookingPageProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(tomorrow());
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [bookForSomeone, setBookForSomeone] = useState(false);
  const [selectedBookFor, setSelectedBookFor] = useState<string | null>(null);
  const [availability, setAvailability] =
    useState<SeatAvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { CancelDialog, cancelBooking } = useCancelBooking();
  const {
    confirming,
    success,
    error: bookingError,
    confirmBooking,
    clearMessages,
  } = useBookingConfirmation();

  const fetchAvailability = useCallback(
    async (dateOverride?: string | null) => {
      const dateToUse = dateOverride ?? selectedDate;

      if (!dateToUse) {
        setAvailability(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      Logger.debug('[availability] Fetching seat availability', {
        date: dateToUse,
      });

      try {
        const data = await getSeatAvailability(dateToUse);
        setAvailability(data);
        setSelectedSeatId(null);
        Logger.info('[availability] Seat availability received');
      } catch (err) {
        setError('Failed to load seat availability. Please try again.');
        Logger.error('[availability] Failed to fetch seat availability', {
          date: dateToUse,
          error: err,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [selectedDate]
  );

  useEffect(() => {
    clearMessages();
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    if (refreshSignal === 0) return;
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  const handleConfirmBooking = async (
    details: CreateBookingRequest,
    resetPanelState: () => void
  ) => {
    await confirmBooking(details, () => {
      resetPanelState();
      resetBookingState();
      onBookingChanged?.();
    });
  };

  const handleCancelBooking = async () => {
    if (!availability?.myBooking) return;
    Logger.info('[booking] Self-service cancellation requested', {
      bookingId: availability.myBooking.bookingId,
      seatId: availability.myBooking.seatId,
    });
    cancelBooking(availability.myBooking.bookingId);
  };

  const resetBookingState = () => {
    const defaultDate = tomorrow();
    setSelectedSeatId(null);
    Logger.debug('[booking] Resetting booking panel state', {
      defaultDate,
    });
    if (selectedDate === defaultDate) {
      fetchAvailability(defaultDate);
    } else {
      setSelectedDate(defaultDate);
    }
  };

  return (
    <>
      {error && (
        <Text color="red" mb="md">
          {error}
        </Text>
      )}
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
            bookForSomeone={bookForSomeone}
            setBookForSomeone={setBookForSomeone}
            selectedBookFor={selectedBookFor}
            setSelectedBookFor={setSelectedBookFor}
          />
        </Grid.Col>
        <Grid.Col span={8}>
          <FloorLayout
            selectedSeatId={selectedSeatId}
            setSelectedSeatId={setSelectedSeatId}
            bookedSeats={availability?.bookedSeats ?? []}
            myBookedSeatId={availability?.myBooking?.seatId}
            allowSelectWhenMyBooking={bookForSomeone}
            seatAvailabilityLoading={isLoading}
          />
        </Grid.Col>
      </Grid>
      <CancelDialog
        onSuccess={() => {
          resetBookingState();
          onBookingChanged?.();
        }}
      />
    </>
  );
}
