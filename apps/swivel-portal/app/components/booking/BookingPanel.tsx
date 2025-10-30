import React, { useState, useCallback, useEffect } from 'react';
import { Paper, Title, Button, Group, Text, Select, Alert } from '@mantine/core';
import { Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, Clock, Utensils, AlertCircle } from 'lucide-react';
import { CreateBookingRequest } from '@/lib/api/seatBooking';

const timePresets = [
  { label: 'Half day', duration: 4 },
  { label: 'Full day', duration: 8 },
];
const timeSlots = Array.from(
  { length: 19 },
  (_, i) => `${(i + 7).toString().padStart(2, '0')}:00`
);

export function BookingPanel({
  selectedDate,
  setSelectedDate,
  selectedSeatId,
  onConfirm,
  confirming,
  success,
  error,
  myBookedSeatId,
  onCancelBooking,
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  selectedSeatId: string | null;
  onConfirm: (details: CreateBookingRequest, resetState: () => void) => void;
  confirming: boolean;
  success?: string | null;
  error?: string | null;
  myBookedSeatId?: string;
  onCancelBooking?: () => void;
}) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [lunch, setLunch] = useState<string | null>(null);
  // Recurring booking state
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  // Book for someone else state
  const [bookForSomeone, setBookForSomeone] = useState(false);
  const [bookForSearch, setBookForSearch] = useState('');
  const [bookForOptions, setBookForOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [selectedBookFor, setSelectedBookFor] = useState<string | null>(null);

  const handleBookForSearch = useCallback(() => {
    if (bookForSearch) {
      // lazy-load search to preserve bundle size
      import('../../lib/api/user').then(({ searchUsers }) => {
        searchUsers(bookForSearch)
          .then((results: string[]) => {
            setBookForOptions(results.map((u) => ({ value: u, label: u })));
          })
          .catch(() => setBookForOptions([]));
      });
    } else {
      setBookForOptions([]);
    }
  }, [bookForSearch]);

  // Debounced search effect for people picker
  useEffect(() => {
    const handler = setTimeout(() => handleBookForSearch(), 350);
    return () => clearTimeout(handler);
  }, [bookForSearch, handleBookForSearch]);

  const handlePreset = (label: string, hours: number) => {
    const start = parseInt(startTime.split(':')[0]);
    const end = start + hours;
    setEndTime(`${end.toString().padStart(2, '0')}:00`);
    setSelectedPreset(label);
  };

  const handleConfirm = () => {
    if (!selectedDate || !selectedSeatId) return;
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const payload: CreateBookingRequest = {
      date: dateStr,
      duration: getDuration(),
      seatId: selectedSeatId,
      lunchOption: lunch || undefined,
      // If booking for someone else, recurring MUST be omitted per acceptance criteria
      recurring: bookForSomeone ? undefined : (isRecurring ? {
        daysOfWeek: recurringDays,
        startDate: dateStr
      } : undefined),
      bookForUserId: selectedBookFor ?? undefined,
    };
    console.log('=======Booking payload:', payload);
    onConfirm(payload, () => {
      setLunch(null);
      setSelectedPreset(null);
      setStartTime('09:00');
      setEndTime('17:00');
      setRecurringDays([]);
      setIsRecurring(false);
      setBookForSomeone(false);
      setBookForSearch('');
      setBookForOptions([]);
    });
  };

  const getDuration = () => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const diff = end - start;
    if (diff === 1) return '1 hour';
    if (diff === 4) return 'Half day';
    if (diff === 8) return 'Full day';
    return `${diff} hours`;
  };

  const getSectionTitle = (icon: React.ReactNode, title: string) => (
    <Group gap="xs" mb={4} className="flex flex-row items-center">
      {icon}
      <Text fw={500}>{title}</Text>
    </Group>
  );

  return (
    <Paper
      p="lg"
      radius="md"
      withBorder
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Title order={4} mb="md">
        Create Booking
      </Title>
      {myBookedSeatId && (
        <Alert
          color="red"
          title="You already have a booking for this date."
          mb="md"
        >
          <Group justify="space-between" align="center">
            <Text size="sm">Do you want to cancel your existing booking?</Text>
            {onCancelBooking && (
              <Button
                color="red"
                size="xs"
                variant="outline"
                onClick={onCancelBooking}
              >
                Cancel Booking
              </Button>
            )}
          </Group>
        </Alert>
      )}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <DatePickerInput
          label={getSectionTitle(<Calendar size={16} />, 'Select a date')}
          value={selectedDate ? new Date(selectedDate) : null}
          onChange={(val: string | null) => setSelectedDate(val ? val : null)}
          minDate={new Date()}
          maxDate={new Date(2100, 0, 1)}
          popoverProps={{ withinPortal: true }}
          clearable={false}
        />
        <div className="space-y-6 py-4">
          {/* Recurring Booking UI */}
          <div className="space-y-3">
            <Text className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={bookForSomeone}
                onChange={(e) => {
                  setBookForSomeone(e.target.checked);
                  // when toggling on, clear any recurring selection
                  if (e.target.checked) {
                    setIsRecurring(false);
                    setRecurringDays([]);
                  }
                }}
                className="mr-2"
              />
              Book for someone else
            </Text>
            {bookForSomeone && (
              <div className="pt-2">
                <Text size="xs" c="dimmed" mb={6}>
                  Search by email to select a user from your tenant
                </Text>
                <Select
                  data={bookForOptions}
                  searchable
                  clearable
                  value={selectedBookFor}
                  onSearchChange={(val) => setBookForSearch(val ?? '')}
                  onChange={(val) => setSelectedBookFor(val)}
                  placeholder="Search user by email"
                  size="sm"
                />
              </div>
            )}

            <Text className="text-sm font-medium flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="mr-2"
                disabled={bookForSomeone}
              />
              Recurring Booking
            </Text>
            {isRecurring && (
              <Group gap={2} wrap="wrap">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                  <Button
                    key={day}
                    variant={recurringDays.includes(day) ? 'filled' : 'outline'}
                    size="xs"
                    type="button"
                    onClick={() => {
                      if (bookForSomeone) return; // disabled when booking for someone else
                      setRecurringDays(prev =>
                        prev.includes(day)
                          ? prev.filter(d => d !== day)
                          : [...prev, day]
                      );
                    }}
                    disabled={bookForSomeone}
                  >
                    {day}
                  </Button>
                ))}
              </Group>
            )}
          </div>
          {/* Time Selection */}
          {getSectionTitle(<Clock size={16} />, 'Select a time')}

          <Group gap="xs" m={0}>
            {timePresets.map((preset) => (
              <Button
                type="button"
                key={preset.label}
                variant={selectedPreset === preset.label ? 'filled' : 'outline'}
                size="xs"
                onClick={() => handlePreset(preset.label, preset.duration)}
              >
                {preset.label}
              </Button>
            ))}
          </Group>
          <Grid gutter={0}>
            <Grid.Col span={6}>
              <Text>Check-In</Text>
              <Select
                data={timeSlots.map((time) => ({ value: time, label: time }))}
                value={startTime}
                onChange={(val: string | null) => {
                  setStartTime(val ?? startTime);
                  setSelectedPreset(null);
                }}
                placeholder="Select time"
                size="sm"
                w={150}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Text>Check-Out</Text>
              <Select
                data={timeSlots.map((time) => ({ value: time, label: time }))}
                value={endTime}
                onChange={(val: string | null) => {
                  setEndTime(val ?? endTime);
                  setSelectedPreset(null);
                }}
                placeholder="Select time"
                size="sm"
                w={150}
              />
            </Grid.Col>
          </Grid>
          {startTime >= endTime && (
            <Group
              gap="xs"
              mt="xs"
              style={{
                background: '#fffbe6',
                border: '1px solid #ffe58f',
                borderRadius: 4,
                padding: 8,
              }}
            >
              <AlertCircle size={16} color="#faad14" />
              <Text size="xs" color="#faad14">
                End time must be after start time
              </Text>
            </Group>
          )}
          {/* Lunch Selection */}
          {getSectionTitle(<Utensils size={16} />, 'Lunch (optional)')}
          <Select
            m={0}
            data={['Veg', 'Fish', 'Chicken', 'Egg', 'Seafood'].map(
              (option) => ({ value: option.toLowerCase(), label: option })
            )}
            value={lunch}
            onChange={(val) => setLunch(val ?? '')}
            placeholder="Select meal option"
            clearable
            size="sm"
          />
          {/* Success/Error Messages */}
          {success && (
            <Text color="green" size="sm">
              {success}
            </Text>
          )}
          {error && (
            <Text color="red" size="sm">
              {error}
            </Text>
          )}
        </div>
      </div>
      <Button
        mt="lg"
        fullWidth
        onClick={handleConfirm}
        disabled={
          confirming || startTime >= endTime || !selectedDate || !selectedSeatId
        }
      >
        {confirming ? 'Confirming...' : 'Confirm Booking'}
      </Button>
    </Paper>
  );
}
