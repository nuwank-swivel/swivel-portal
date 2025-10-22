import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { createBooking, CreateBookingRequest } from '../lib/api/seatBooking';
import { AxiosError } from 'axios';

export function useBookingConfirmation() {
  const [confirming, setConfirming] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const confirmBooking = async (
    details: CreateBookingRequest,
    resetState: () => void
  ) => {
    setConfirming(true);
    setSuccess(null);
    setError(null);
    try {
      const response = await createBooking(details);
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
      notifications.show({
        title: 'Booking Error',
        message,
        color: 'red',
      });
    } finally {
      setConfirming(false);
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
