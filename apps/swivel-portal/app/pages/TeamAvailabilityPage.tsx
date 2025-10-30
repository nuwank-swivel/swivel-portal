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
  Chip,
  Tooltip,
} from '@mantine/core';
import CoreLayout from '../components/CoreLayout';
import { useAuthContext } from '@/lib/AuthContext';
import { getTeamPresence } from '@/lib/api/presence';
import { getTeams } from '@/lib/api/team';
import { useTeamState } from '@/lib/state/teamState';
import { PresenceEventRecord, Team } from '@swivel-portal/types';
import moment from 'moment';
import { getStatusDisplayName } from '@/lib/utils';
import { useUIContext } from '@/lib/UIContext';
import { TimerIcon } from 'lucide-react';
import { v4 as uuid } from 'uuid';

// Helper to get latest presence event for a user
function getLatestPresence(
  records: AvailabilityRecord[],
  userName: string
): AvailabilityRecord | undefined {
  return records
    .filter((r) => r.userName === userName)
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
  const { teams, setTeams } = useTeamState();
  const [records, setRecords] = useState<AvailabilityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamFilter, setTeamFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    setCurrentModule('Team Availability');
    // Fetch all teams on mount
    (async () => {
      const allTeams = await getTeams();
      setTeams(allTeams);
    })();
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

  const isToday = moment(selectedDate).isSame(moment(), 'day');

  // Get all team members for the selected team (from teams state)
  const { teamMembers, showTeamCard } = React.useMemo(() => {
    let teamMembers: { id: string; name: string; email: string }[] = [];
    let showTeamCard = false;
    if (isToday) {
      let team: Team | undefined = undefined;
      if (!isAdmin) {
        // Non-admin: show user's team only on today
        const userTeamName = records[0]?.teamName;
        team = teams.find((t) => t.name === userTeamName);
      } else if (teamFilter) {
        team = teams.find((t) => t.name === teamFilter);
      }
      if (team && Array.isArray(team.membersDetails)) {
        teamMembers = team.membersDetails.map(
          (member: { email: string; name: string }) => ({
            id: uuid(),
            name: member.name,
            email: member.email,
          })
        );
        showTeamCard = true;
      }
    }
    return { teamMembers, showTeamCard };
  }, [isAdmin, isToday, records, teamFilter, teams]);

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
                  ...teams.map((t) => ({ value: t.name, label: t.name })),
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
              {teamMembers.map((member) => {
                const latest = getLatestPresence(records, member.name);
                let color = 'gray';
                let hint: string | undefined = undefined;
                if (!latest) {
                  hint = 'Offline';
                } else if (
                  latest.event === 'signin' ||
                  latest.event === 'back'
                ) {
                  color = 'green';
                  hint = 'Available';
                } else if (latest.event === 'afk') {
                  color = 'yellow';
                  hint = 'AFK';
                } else if (latest.event === 'signoff') {
                  color = 'red';
                  hint = 'Signed Off';
                }
                return (
                  <Tooltip key={member.id} label={hint} refProp="rootRef">
                    <Chip
                      color={color}
                      checked={true}
                      id={member.id}
                      variant={color === 'gray' ? 'outline' : 'filled'}
                      icon={
                        color === 'green' ? undefined : <TimerIcon size={14} />
                      }
                    >
                      {member.name}
                    </Chip>
                  </Tooltip>
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
                    <Table.Td>{moment(r.timestamp).format('hh:mm a')}</Table.Td>
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
