import { useState } from 'react';
import { cancelBooking } from '@/lib/api/seatBooking';
import { Modal, Button, Text } from '@mantine/core';

export function useCancelBooking() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const showDialog = () => setOpen(true);
  const hideDialog = () => setOpen(false);

  const cancelBookingAction = async (
    bookingId: string,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      await cancelBooking(bookingId);
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Failed to cancel booking');
    } finally {
      setLoading(false);
    }
  };

  function CancelDialog({ onSuccess }: { onSuccess?: () => void }) {
    return (
      <Modal opened={open} onClose={hideDialog} title="Cancel Booking" centered>
        <Text mb="md">Are you sure you want to cancel your booking?</Text>
        {error && (
          <Text color="red" size="sm">
            {error}
          </Text>
        )}
        <Button
          color="red"
          loading={loading}
          onClick={() =>
            bookingId ? cancelBookingAction(bookingId, onSuccess) : undefined
          }
          fullWidth
          mt="md"
        >
          Confirm Cancel
        </Button>
      </Modal>
    );
  }

  function initiateCancel(bookingId: string) {
    showDialog();
    setBookingId(bookingId);
  }

  return {
    showDialog,
    hideDialog,
    CancelDialog,
    cancelBooking: initiateCancel,
    loading,
    error,
  };
}
