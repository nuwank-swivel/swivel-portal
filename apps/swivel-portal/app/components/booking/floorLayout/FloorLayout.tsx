import {
  Loader,
  Paper,
  Title,
  Group,
  Text,
  Tooltip,
  Stack,
} from '@mantine/core';
import { getSeatLayout } from '@/lib/api/seatBooking';

import { Booking, Table } from '@swivel-portal/types';
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
  bookedSeats,
  seatAvailabilityLoading,
  myBookedSeatId,
}: {
  table: Table;
  selectedSeatId: string | null;
  setSelectedSeatId: (id: string) => void;
  bookedSeats: Booking[];
  seatAvailabilityLoading: boolean;
  myBookedSeatId?: string;
}) {
  const renderSeats = (side: string) =>
    table.seats
      .filter((seat) => seat.side === side)
      .map((seat) => {
        const isSelected = seat.id === selectedSeatId;
        const booking = bookedSeats.find((b) => b.seatId === seat.id);
        const isBooked = !!booking;
        const isMyBooking = seat.id === myBookedSeatId;
        const teamColor = booking?.team?.color;
        const teamName = booking?.team?.name;
        const userName = booking?.user?.name;

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
            <Tooltip
              label={
                isBooked
                  ? `Seat is booked ${teamName ? `for ${teamName}` : ''} ${
                      userName ? `by ${userName}` : ''
                    }`
                  : 'Available'
              }
            >
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
                  position: 'relative',
                }}
                onClick={() =>
                  !isBooked && !myBookedSeatId && setSelectedSeatId(seat.id)
                }
              >
                {isBooked && teamColor && (
                  <div
                    style={{
                      position: 'absolute',
                      right: side === 'A' ? undefined : 0,
                      left: side === 'A' ? 0 : undefined,
                      top: 0,
                      width: '6px',
                      height: '100%',
                      background: teamColor,
                      borderRadius:
                        side === 'A' ? '8px 0 0 8px' : '0 8px 8px 0',
                    }}
                  />
                )}
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
  bookedSeats,
  seatAvailabilityLoading,
  myBookedSeatId,
}: {
  selectedSeatId: string | null;
  setSelectedSeatId: (id: string) => void;
  bookedSeats: import('@swivel-portal/types').Booking[];
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

  // Extract unique teams from bookedSeats
  const teamLegend = Array.from(
    bookedSeats
      .filter((b) => b.team && b.team.name && b.team.color)
      .reduce((map, b) => {
        if (!map.has(b.team?.name)) {
          map.set(b.team?.name, b.team?.color);
        }
        return map;
      }, new Map())
      .entries()
  );

  return (
    <Group justify="space-between" align="flex-start">
      <Paper p="lg" radius="md" withBorder style={{ flex: 1 }}>
        <Group justify="space-between" align="start" mb="md">
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
          {teamLegend.length > 0 && (
            <Stack gap={4}>
              <Title order={6} mb={2} mt={0}>
                Teams
              </Title>
              <Group gap={8} align="center">
                {teamLegend.map(([name, color]) => (
                  <Group gap={4} align="center" key={name}>
                    <Paper
                      w={24}
                      h={24}
                      radius="xs"
                      style={{ background: color }}
                    />
                    <Text size="xs">{name}</Text>
                  </Group>
                ))}
              </Group>
            </Stack>
          )}
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
                bookedSeats={bookedSeats}
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
