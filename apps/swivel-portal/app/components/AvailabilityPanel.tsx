import {
  Card,
  Button,
  Group,
  NumberInput,
  Chip,
  Modal,
  TextInput,
  List,
} from '@mantine/core';
import { useAvailabilityPanel } from '@/hooks/useAvailabilityPanel';
import React from 'react';
import { PresenceEventType } from '@swivel-portal/types';
import { Badge } from './ui/badge';

// Helper to get display name for status
function getStatusDisplayName(status: PresenceEventType): string {
  switch (status) {
    case PresenceEventType.Signin:
      return 'Signed in';
    case PresenceEventType.Signoff:
      return 'Signed off';
    case PresenceEventType.Afk:
      return 'AFK';
    case PresenceEventType.Back:
      return 'Back';
    default:
      return status;
  }
}

export default function AvailabilityPanel() {
  const {
    status,
    afkEta,
    eventTimes,
    handleSignin,
    handleSignoff,
    handleAfk,
    handleBack,
    setAfkEta,
    getGreeting,
    userName,
  } = useAvailabilityPanel();

  // Modal state for AFK
  const [afkModalOpen, setAfkModalOpen] = React.useState(false);
  const [customEta, setCustomEta] = React.useState(afkEta);
  const [afkMessage, setAfkMessage] = React.useState('');

  const submitAfk = async () => {
    // TODO: Update hook/API to accept message
    await handleAfk(customEta, afkMessage);
    setAfkModalOpen(false);
    setAfkMessage('');
  };

  return (
    <Card
      p="lg"
      radius="lg"
      withBorder
      style={{ marginBottom: 32, width: '100%' }}
    >
      <Group
        justify="space-between"
        style={{ marginBottom: 12, alignItems: 'center' }}
      >
        {/* Greeting as panel title */}
        <h2
          style={{ fontSize: 22, fontWeight: 700, color: '#2563EB', margin: 0 }}
        >
          {getGreeting()} {userName}!
        </h2>
        {/* Right: Buttons */}
        <Group gap={12} style={{ alignItems: 'center' }}>
          {/* Signin button: only show if not signed in AND not signed off */}
          {status !== PresenceEventType.Signin && !eventTimes.signoff && (
            <Button
              color="green"
              onClick={handleSignin}
              disabled={!!eventTimes.signoff}
            >
              Sign In
            </Button>
          )}
          {(status === PresenceEventType.Signin ||
            status === PresenceEventType.Back) && (
            <>
              <Button color="yellow" onClick={() => setAfkModalOpen(true)}>
                AFK
              </Button>
              {status === PresenceEventType.Signin && (
                <Button color="red" onClick={handleSignoff}>
                  Signoff
                </Button>
              )}
              {status === PresenceEventType.Back && (
                <Button color="red" onClick={handleSignoff}>
                  Signoff
                </Button>
              )}
            </>
          )}
          {status === PresenceEventType.Afk && (
            <Button color="green" onClick={handleBack}>
              Back
            </Button>
          )}
        </Group>
      </Group>
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
      {/* Status & event times: only show after signed in */}
      {status !== PresenceEventType.Signoff && (
        <Group gap={8} style={{ marginTop: 8 }}>
          <Badge color="indigo" variant="light">
            Status: <b>{getStatusDisplayName(status)}</b>
          </Badge>
          {/* AFK List */}
          {eventTimes.afk.length > 0 && (
            <List spacing="xs" size="sm" center>
              <List.Item>
                <b>AFK Times:</b>
              </List.Item>
              {eventTimes.afk.map((t, i) => (
                <List.Item key={i}>{t}</List.Item>
              ))}
            </List>
          )}
          {/* Back List */}
          {eventTimes.back.length > 0 && (
            <List spacing="xs" size="sm" center>
              <List.Item>
                <b>Back Times:</b>
              </List.Item>
              {eventTimes.back.map((t, i) => (
                <List.Item key={i}>{t}</List.Item>
              ))}
            </List>
          )}
        </Group>
      )}
      {/* AFK Modal */}
      <Modal
        opened={afkModalOpen}
        onClose={() => setAfkModalOpen(false)}
        title="Set AFK"
      >
        <NumberInput
          label="AFK ETA (min)"
          min={1}
          max={240}
          value={customEta}
          onChange={(val) => setCustomEta(Number(val))}
          style={{ marginBottom: 12 }}
        />
        <TextInput
          label="Status Message"
          value={afkMessage}
          onChange={(e) => setAfkMessage(e.currentTarget.value)}
          style={{ marginBottom: 12 }}
        />
        <Button color="yellow" fullWidth onClick={submitAfk}>
          Go AFK
        </Button>
      </Modal>
    </Card>
  );
}
