import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { createBooking, CreateBookingRequest } from '../lib/api/seatBooking';
import { AxiosError } from 'axios';
import { Logger } from '@/lib/logger';
import { useAuthContext } from '@/lib/AuthContext';

export function useBookingConfirmation() {
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const confirmBooking = async (
    details: CreateBookingRequest,
    resetState: () => void
  ) => {
    setConfirming(true);
    setSuccess(null);
    setError(null);
    let outcome: 'pending' | 'success' | 'error' = 'pending';
    const bookingContext = {
      userId: user?.azureAdId,
      seatId: details.seatId,
      date: details.date ?? details.recurring?.startDate,
      recurring: Boolean(details.recurring),
      delegated: Boolean(details.bookForUserId),
    };
    Logger.info('[booking] Booking confirmation started', bookingContext);
    try {
      const response = await createBooking(details);
      outcome = 'success';
      setSuccess(response.message);
      Logger.info('[booking] Booking confirmation succeeded', {
        ...bookingContext,
        bookingId:
          (response.booking as { bookingId?: string })?.bookingId ??
          response.booking?._id,
        duration: response.booking?.duration ?? response.booking?.durationType,
      });
      notifications.show({
        title: 'Booking Confirmed',
        message: response.message,
        color: 'green',
      });
      resetState();
    } catch (e) {
      const message =
        e instanceof AxiosError
          ? e.response?.data.message
          : 'Failed to confirm booking';
      setError(message);
      outcome = 'error';
      Logger.error('[booking] Booking confirmation failed', {
        ...bookingContext,
        error: e,
        responseStatus:
          e instanceof AxiosError ? e.response?.status : undefined,
      });
      notifications.show({
        title: 'Booking Error',
        message,
        color: 'red',
      });
    } finally {
      setConfirming(false);
      Logger.debug('[booking] Booking confirmation flow completed', {
        ...bookingContext,
        outcome,
      });
    }
  };

  const clearMessages = () => {
    setSuccess(null);
    setError(null);
  };

  return {
    confirming,
    success,
    error,
    confirmBooking,
    clearMessages,
  };
}
