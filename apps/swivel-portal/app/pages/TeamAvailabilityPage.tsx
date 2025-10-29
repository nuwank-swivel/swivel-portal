import React, { useEffect, useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import {
  Card,
  Table,
  TextInput,
  Select,
  Group,
  Box,
  LoadingOverlay,
  Avatar,
  Indicator,
  Paper,
  Chip,
} from '@mantine/core';
import CoreLayout from '../components/CoreLayout';
import { useAuthContext } from '@/lib/AuthContext';
import { getTeamPresence } from '@/lib/api/presence';
import { PresenceEventRecord, PresenceEventType } from '@swivel-portal/types';
import moment from 'moment';
import { getStatusDisplayName } from '@/lib/utils';
import { useUIContext } from '@/lib/UIContext';
import { TimerIcon } from 'lucide-react';

// Helper to get latest presence event for a user
function getLatestPresence(
  records: AvailabilityRecord[],
  userId: string
): AvailabilityRecord | undefined {
  return records
    .filter((r) => r.userId === userId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
}

interface AvailabilityRecord extends PresenceEventRecord {
  teamName: string;
  teamId: string;
  userName: string;
}
export default function TeamAvailabilityPage() {
  const { user } = useAuthContext();
  const { setCurrentModule } = useUIContext();
  const isAdmin = !!user?.isAdmin;
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    setCurrentModule('Team Availability');
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const dateStr = moment(selectedDate).format('YYYY-MM-DD');
        const events = await getTeamPresence(dateStr);
        setRecords(events);
      } catch {
        setRecords([]);
      }
      setLoading(false);
    };
    fetchRecords();
  }, [isAdmin, selectedDate]);

  // Get unique teams for filter dropdown
  const teams = Array.from(new Set(records.map((r) => r.teamName)));

  // Get team members for selected team (or user's team if not admin)
  let teamMembers: AvailabilityRecord[] = [];
  let showTeamCard = false;
  if (!isAdmin) {
    // Non-admin: show user's team
    const userTeam = records[0]?.teamName;
    teamMembers = records.filter((r) => r.teamName === userTeam);
    showTeamCard = true;
  } else if (teamFilter) {
    // Admin: show selected team
    teamMembers = records.filter((r) => r.teamName === teamFilter);
    showTeamCard = true;
  }

  // Filter records
  const filtered = records.filter((r) => {
    return (
      (!teamFilter || r.teamName === teamFilter) &&
      (!nameFilter ||
        r.userName.toLowerCase().includes(nameFilter.toLowerCase()))
    );
  });

  return (
    <CoreLayout>
      <Card
        p="lg"
        radius="lg"
        withBorder
        style={{ marginBottom: 32, width: '100%' }}
      >
        <Group mb={16} gap={16}>
          {isAdmin && (
            <>
              <DatePickerInput
                label="Select Date"
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(new Date(date))}
                style={{ minWidth: 180 }}
                maxDate={new Date()}
                clearable={false}
              />
              <Select
                label="Filter by Team"
                data={[
                  { value: '', label: 'All Teams' },
                  ...teams.map((t) => ({ value: t, label: t })),
                ]}
                value={teamFilter}
                onChange={(value) => setTeamFilter(value || '')}
                style={{ minWidth: 180 }}
              />
            </>
          )}
          <TextInput
            label="Filter by Name"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.currentTarget.value)}
            style={{ minWidth: 180 }}
          />
        </Group>

        {showTeamCard && teamMembers.length > 0 && (
          <Card
            p="md"
            radius="lg"
            withBorder
            style={{ marginBottom: 24, width: '100%' }}
          >
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Team Members</h3>
            <Group gap={16} wrap="wrap">
              {Array.from(
                new Map(teamMembers.map((m) => [m.userId, m])).values()
              ).map((member) => {
                const latest = getLatestPresence(records, member.userId);
                let color = 'gray';
                if (latest?.event === 'signin' || latest?.event === 'back')
                  color = 'green';
                else if (latest?.event === 'afk') color = 'yellow';
                else if (latest?.event === 'signoff') color = 'red';
                return (
                  <Chip
                    defaultChecked={color === 'green'}
                    color={color}
                    checked={true}
                    icon={
                      color === 'green' ? undefined : <TimerIcon size={14} />
                    }
                  >
                    {member.userName}
                  </Chip>
                );
              })}
            </Group>
          </Card>
        )}
        <Box pos="relative" style={{ maxHeight: 400, overflow: 'auto' }}>
          <LoadingOverlay
            visible={loading}
            zIndex={1000}
            overlayProps={{ radius: 'sm', blur: 2 }}
          />
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Team</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td
                    colSpan={4}
                    style={{ textAlign: 'center', color: '#888' }}
                  >
                    No records found.
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((r, i) => (
                  <Table.Tr key={i}>
                    <Table.Td>{r.userName}</Table.Td>
                    <Table.Td>{r.teamName}</Table.Td>
                    <Table.Td>{getStatusDisplayName(r.event)}</Table.Td>
                    <Table.Td>{r.message}</Table.Td>
                    <Table.Td>{moment(r.timestamp).format('HH:mm a')}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Box>
      </Card>
    </CoreLayout>
  );
}
