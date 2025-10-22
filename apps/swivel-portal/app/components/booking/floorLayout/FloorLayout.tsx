import { Loader, Paper, Title, Group, Text, Tooltip } from '@mantine/core';
import { getSeatLayout } from '@/lib/api/seatBooking';

import { Table } from '@swivel-portal/types';
import { useState, useEffect } from 'react';

import { Skeleton } from '@mantine/core';

const BOOKED_CLASS = 'bg-red-300 border-red-400';
const AVAILABLE_CLASS = ' border-gray-200';
const SELECTED_CLASS = '!bg-blue-200 !border-blue-600';
const MY_BOOKING_CLASS = '!bg-green-200 !border-green-600';

function TableLayout({
  table,
  selectedSeatId,
  setSelectedSeatId,
  bookedSeatIds,
  seatAvailabilityLoading,
  myBookedSeatId,
}: {
  table: Table;
  selectedSeatId: string | null;
  setSelectedSeatId: (id: string) => void;
  bookedSeatIds: string[];
  seatAvailabilityLoading: boolean;
  myBookedSeatId?: string;
}) {
  const renderSeats = (side: string) =>
    table.seats
      .filter((seat) => seat.side === side)
      .map((seat) => {
        const isSelected = seat.id === selectedSeatId;
        const isBooked = bookedSeatIds.includes(seat.id);
        const isMyBooking = seat.id === myBookedSeatId;

        return (
          <Skeleton
            key={seat.id}
            visible={seatAvailabilityLoading}
            width={35}
            height={36}
            style={{
              borderRadius: side === 'A' ? '8px 0px 0px 8px' : '0 8px 8px 0px',
            }}
          >
            <Tooltip label={isBooked ? 'Seat is booked' : 'Available'}>
              <Paper
                px={12}
                py={8}
                w={35}
                radius="xs"
                className={`border-2 cursor-pointer ${
                  isMyBooking
                    ? MY_BOOKING_CLASS
                    : isBooked
                    ? BOOKED_CLASS
                    : AVAILABLE_CLASS
                } ${isSelected ? SELECTED_CLASS : ''}`}
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  borderRadius:
                    side === 'A' ? '8px 0px 0px 8px' : '0 8px 8px 0px',
                  opacity: isBooked ? 0.6 : 1,
                }}
                onClick={() =>
                  !isBooked && !myBookedSeatId && setSelectedSeatId(seat.id)
                }
              >
                <Text size="xs">{seat.index}</Text>
              </Paper>
            </Tooltip>
          </Skeleton>
        );
      });

  return (
    <Paper key={table.name} p="md" radius="sm" style={{ minWidth: 120 }}>
      <Group gap={0} className="flex flex-row">
        <Group className="flex-col">{renderSeats('A')}</Group>
        <Paper withBorder className="h-64 flex items-center p-3 bg-orange-100">
          <Title className="" order={6}>
            {table.name}
          </Title>
        </Paper>
        <Group className="flex flex-col">{renderSeats('B')}</Group>
      </Group>
    </Paper>
  );
}

export function FloorLayout({
  selectedSeatId,
  setSelectedSeatId,
  bookedSeatIds,
  seatAvailabilityLoading,
  myBookedSeatId,
}: {
  selectedSeatId: string | null;
  setSelectedSeatId: (id: string) => void;
  bookedSeatIds: string[];
  seatAvailabilityLoading: boolean;
  myBookedSeatId?: string;
}) {
  const [tables, setTables] = useState<Array<Table> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLayout = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSeatLayout();
        setTables(data.tables);
      } catch {
        setError('Failed to load seat layout.');
      } finally {
        setLoading(false);
      }
    };
    fetchLayout();
  }, []);

  return (
    <Group justify="space-between" align="flex-start">
      <Paper p="lg" radius="md" withBorder style={{ flex: 1 }}>
        <Group justify="space-between" align="center" mb="md">
          <Title order={4}>Seats</Title>
          <Group gap="xs" className="legend-section">
            <Group gap={4} align="center">
              <Paper
                w={24}
                h={24}
                radius="xs"
                className={`border-2 ${BOOKED_CLASS}`}
              />
              <Text size="xs">Booked</Text>
            </Group>
            <Group gap={4} align="center">
              <Paper
                w={24}
                h={24}
                radius="xs"
                className={`border-2 ${AVAILABLE_CLASS}`}
              />
              <Text size="xs">Available</Text>
            </Group>
            <Group gap={4} align="center">
              <Paper
                w={24}
                h={24}
                radius="xs"
                className={`border-2 ${MY_BOOKING_CLASS}`}
              />
              <Text size="xs">My Booking</Text>
            </Group>
          </Group>
        </Group>
        {loading ? (
          <Loader size="lg" />
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : !tables ? null : (
          <Group gap="sm" align="flex-start">
            <div className="border-2 w-6 h-16 block">
              <Text className="-rotate-90 translate-y-[100%]">Door</Text>
            </div>
            {tables.map((table) => (
              <TableLayout
                key={table.name}
                table={table}
                selectedSeatId={selectedSeatId}
                setSelectedSeatId={setSelectedSeatId}
                bookedSeatIds={bookedSeatIds}
                seatAvailabilityLoading={seatAvailabilityLoading}
                myBookedSeatId={myBookedSeatId}
              />
            ))}
          </Group>
        )}
      </Paper>
    </Group>
  );
}
