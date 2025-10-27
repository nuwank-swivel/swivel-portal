import { useState } from 'react';

import { cancelBooking } from '@/lib/api/seatBooking';
import { Modal, Button, Text, Group, Radio } from '@mantine/core';
import { Booking } from '@swivel-portal/types';

export function useCancelBooking() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [cancelMode, setCancelMode] = useState<'single' | 'all' | null>(null);
  const [booking, setBooking] = useState<any | null>(null);

  const showDialog = () => setOpen(true);
  const hideDialog = () => {
    setOpen(false);
    setCancelMode(null);
    setBooking(null);
    setBookingId(null);
    setError(null);
  };

  const cancelBookingAction = async (
    bookingId: string,
    mode: 'single' | 'all',
    bookingObj?: Booking,
    onSuccess?: () => void
  ) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'single' && bookingObj) {
        await cancelBooking(bookingId, { date: bookingObj.bookingDate });
      } else {
        await cancelBooking(bookingId);
      }
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
        {booking && booking.recurring ? (
          <>
            <Text mb="md">
              This is a recurring booking. Do you want to cancel only this
              occurrence ({booking.bookingDate}) or the entire booking?
            </Text>
            <Group className="flex flex-row">
              <Radio.Group
                value={cancelMode}
                onChange={(value) => setCancelMode(value as 'single' | 'all')}
                name="cancelMode"
                label="Cancel options (select one)"
                size="sm"
              >
                <Radio my={8} value="single" label="Only this occurrence" />
                <Radio value="all" label="Entire recurring booking" />
              </Radio.Group>
            </Group>
            <Group style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="default" onClick={hideDialog} size="xs">
                No, keep booking
              </Button>
              <Button
                color="red"
                disabled={!cancelMode}
                loading={loading}
                onClick={() =>
                  bookingId &&
                  cancelMode &&
                  cancelBookingAction(bookingId, cancelMode, booking, onSuccess)
                }
                size="xs"
              >
                Yes, cancel booking
              </Button>
            </Group>
          </>
        ) : (
          <>
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
                bookingId
                  ? cancelBookingAction(bookingId, 'all', undefined, onSuccess)
                  : undefined
              }
              fullWidth
              mt="md"
            >
              Confirm Cancel
            </Button>
          </>
        )}
      </Modal>
    );
  }

  function initiateCancel(bookingId: string, bookingObj?: any) {
    showDialog();
    setBookingId(bookingId);
    setBooking(bookingObj || null);
    setCancelMode(null);
  }

  return {
    showDialog,
    hideDialog,
    CancelDialog,
    cancelBooking: initiateCancel,
    loading,
    error,
    cancelMode,
    setCancelMode,
  };
}
