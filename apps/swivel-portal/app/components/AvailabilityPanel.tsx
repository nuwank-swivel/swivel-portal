import {
  Card,
  Button,
  Group,
  Modal,
  TextInput,
  Menu,
  ButtonGroup,
  Box,
  LoadingOverlay,
  Accordion,
  Table,
} from '@mantine/core';
import { TimePicker } from '@mantine/dates';
import React from 'react';
import { PresenceEventType } from '@swivel-portal/types';
import { Badge } from './ui/badge';
import { ChevronDownIcon } from 'lucide-react';
import moment from 'moment';
import { useAvailabilityPanel } from '@/hooks/useAvailabilityPanel';
import { getStatusDisplayName } from '@/lib/utils';

// Utility to get ETA time string
export function getEtaTime(minutes: number): string {
  return moment().add(minutes, 'minutes').format('h:mm A');
}

export default function AvailabilityPanel() {
  const {
    status,
    eventTimes,
    handleSignin,
    handleSignoff,
    handleAfk,
    handleBack,
    getGreeting,
    userName,
    loading,
  } = useAvailabilityPanel();

  // Modal state for AFK
  const [afkModalOpen, setAfkModalOpen] = React.useState(false);
  const [afkRecordsModalOpen, setAfkRecordsModalOpen] = React.useState(false);
  const [customEta, setCustomEta] = React.useState(0);
  const [afkMessage, setAfkMessage] = React.useState('');

  const submitAfk = async () => {
    await handleAfk(customEta, afkMessage);
    setAfkModalOpen(false);
    setAfkMessage('');
  };
  // Only show Signin if not signed in and not signed off
  const getPresenceActionButtons = () => {
    // Only show Signin if not signed in and not signed off
    if (
      status === PresenceEventType.Signoff &&
      !eventTimes.signin &&
      !eventTimes.signoff
    ) {
      return (
        <Button
          color="green"
          onClick={handleSignin}
          disabled={!!eventTimes.signoff || loading.signoff}
          loading={loading.signoff}
        >
          Sign In
        </Button>
      );
    }
    // Show AFK and Signoff if signed in or back
    if (
      status === PresenceEventType.Signin ||
      status === PresenceEventType.Back
    ) {
      return (
        <>
          <ButtonGroup>
            <Button
              color="yellow"
              onClick={async () => {
                await handleAfk(60);
              }}
              disabled={loading.afk}
              loading={loading.afk}
              pr={0}
            >
              AFK (1Hr)
            </Button>
            <Menu shadow="md" width={180}>
              <Menu.Target>
                <Button color="yellow" disabled={loading.afk} px="xs">
                  <ChevronDownIcon size={18} />
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  onClick={() => setAfkModalOpen(true)}
                  disabled={loading.afk}
                >
                  Customize...
                </Menu.Item>
                <Menu.Item
                  onClick={() => setAfkRecordsModalOpen(true)}
                  disabled={loading.afk}
                >
                  View AFK records
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </ButtonGroup>
          <Button
            color="red"
            onClick={handleSignoff}
            disabled={loading.signoff}
            loading={loading.signoff}
          >
            Signoff
          </Button>
        </>
      );
    }
    // Show Back button if AFK
    if (status === PresenceEventType.Afk) {
      return (
        <Button
          color="green"
          onClick={handleBack}
          disabled={loading.back}
          loading={loading.back}
        >
          Back
        </Button>
      );
    }
    // Default: no buttons
    return null;
  };

  return (
    <Card
      p="lg"
      radius="lg"
      withBorder
      style={{ marginBottom: 32, width: '100%' }}
    >
      <Box pos="relative">
        <LoadingOverlay
          visible={loading.presence}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
        />
        {/* ...other content */}

        <Group
          justify="space-between"
          style={{ marginBottom: 12, alignItems: 'center' }}
        >
          {/* Greeting as panel title */}
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#2563EB',
              margin: 0,
            }}
          >
            {getGreeting()} {userName}!
          </h2>
          {/* Right: Buttons */}
          <Group gap={12} style={{ alignItems: 'center' }}>
            {getPresenceActionButtons()}
          </Group>
        </Group>

        <Group className="flex flex-row">
          {/* Status & event times: only show after signed in */}
          {status !== PresenceEventType.Signoff && (
            <Badge color="indigo" variant="light">
              Status: <b>{getStatusDisplayName(status)}</b>
            </Badge>
          )}
          {/* Always show sign-in time if present */}
          {eventTimes.signin && (
            <Badge size="md" color="green" variant="filled">
              Signed in at: {eventTimes.signin}
            </Badge>
          )}
          {/* Always show signoff time if present */}
          {eventTimes.signoff && (
            <Badge color="red" variant="filled">
              Signed off at: {eventTimes.signoff}
            </Badge>
          )}
        </Group>

        {/* AFK/Back Times Accordion (paired) */}
        {/* AFK/Back Times Modal */}
        <Modal
          opened={afkRecordsModalOpen}
          onClose={() => setAfkRecordsModalOpen(false)}
          title="AFK / Back Records"
          size="lg"
        >
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>AFK Time</Table.Th>
                <Table.Th>Back Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {eventTimes.afk.map((afkTime, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{afkTime}</Table.Td>
                  <Table.Td>{eventTimes.back[i] || '-'}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Modal>
        {/* AFK Modal */}
        <Modal
          opened={afkModalOpen}
          onClose={() => {
            setAfkModalOpen(false);
            setAfkMessage('');
            setCustomEta(0);
          }}
          title="Set AFK"
        >
          <TimePicker
            label="AFK ETA"
            withDropdown
            // value={0}
            onChange={(val) => {
              const now = moment();
              const selected = moment();
              selected.hour(Number(val.split(':')[0]));
              selected.minute(Number(val.split(':')[1]));
              const diff = selected.diff(now, 'minutes');

              if (diff <= 0 || diff > 720) {
                return;
              }

              setCustomEta(diff > 0 ? diff : 1);
              setAfkMessage(`AFK - ETA ${getEtaTime(diff > 0 ? diff : 1)}`);
            }}
            style={{ marginBottom: 12 }}
            format="12h"
            popoverProps={{
              width: 'target',
            }}
          />
          <TextInput
            label="Status Message"
            value={afkMessage}
            onChange={(e) => setAfkMessage(e.currentTarget.value)}
            style={{ marginBottom: 12 }}
          />
          <Button
            color="yellow"
            fullWidth
            onClick={submitAfk}
            loading={loading.afk}
            disabled={customEta <= 0 || customEta > 720 || loading.afk}
          >
            Go AFK
          </Button>
        </Modal>
      </Box>
    </Card>
  );
}
