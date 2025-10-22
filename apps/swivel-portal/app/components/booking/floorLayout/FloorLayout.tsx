import { Loader, Paper, Title, Group, Text } from '@mantine/core';
import { getSeatLayout } from '@/lib/api/seatBooking';
import { Table } from '@swivel-portal/types';
import { useState, useEffect } from 'react';

function TableLayout({ table }: { table: Table }) {
  const renderSeats = (side: string) =>
    table.seats
      .filter((seat) => seat.side === side)
      .map((seat) => (
        <Paper
          key={seat.id}
          px={12}
          py={8}
          radius="xs"
          // withBorder
          className="border-2"
          style={{
            display: 'inline-block',
            minWidth: 28,
            textAlign: 'center',
            borderRadius: side === 'A' ? '8px 0px 0px 8px' : '0 8px 8px 0px',
          }}
        >
          <Text size="xs">{seat.index}</Text>
        </Paper>
      ));

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

export function FloorLayout() {
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
    <Group>
      <Paper p="lg" radius="md" withBorder>
        <Title order={4} mb="md">
          Seats
        </Title>
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
              <TableLayout key={table.name} table={table} />
            ))}
          </Group>
        )}
      </Paper>
    </Group>
  );
}
