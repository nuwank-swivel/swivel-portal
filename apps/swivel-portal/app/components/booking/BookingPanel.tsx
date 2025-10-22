import { useState } from 'react';
import { Paper, Title, Button, Group, Text, Select, Chip } from '@mantine/core';
import { Grid } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Calendar, Clock, Utensils, AlertCircle } from 'lucide-react';
import { createBooking } from '@/lib/api/seatBooking';

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
}: {
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
}) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [lunch, setLunch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePreset = (label: string, hours: number) => {
    const start = parseInt(startTime.split(':')[0]);
    const end = start + hours;
    setEndTime(`${end.toString().padStart(2, '0')}:00`);
    setSelectedPreset(label);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      if (!selectedDate) throw new Error('Date required');
      const dateObj = new Date(selectedDate);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const payload = {
        date: dateStr,
        duration: getDuration(),
        lunchOption: lunch || undefined,
      };
      await createBooking(payload);
      setMessage('Booking confirmed!');
      setLunch('');
    } catch (err: any) {
      setError(err?.message || 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
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
            value={lunch || null}
            onChange={(val) => setLunch(val ?? '')}
            placeholder="Select meal option"
            clearable
            size="sm"
          />
          {/* Success/Error Messages */}
          {message && (
            <Text color="green" size="sm">
              {message}
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
        disabled={isSubmitting || startTime >= endTime || !selectedDate}
      >
        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
      </Button>
    </Paper>
  );
}
