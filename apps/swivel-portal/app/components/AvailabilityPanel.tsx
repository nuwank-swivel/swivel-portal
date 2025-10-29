import { Card, Button, Group, NumberInput, Chip } from '@mantine/core';
import { useAvailabilityPanel } from '@/hooks/useAvailabilityPanel';

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
          {status === 'signedout' && (
            <Button color="blue" onClick={handleSignin}>
              Signin
            </Button>
          )}
          {status === 'signedin' && (
            <>
              <Button color="yellow" onClick={handleAfk}>
                AFK
              </Button>
              <Button color="red" onClick={handleSignoff}>
                Signoff
              </Button>
            </>
          )}
          {status === 'afk' && (
            <>
              <NumberInput
                label="AFK ETA (min)"
                min={1}
                max={240}
                value={afkEta}
                onChange={(val) => setAfkEta(Number(val))}
                style={{ width: 100 }}
                size="sm"
              />
              <Button color="green" onClick={handleBack}>
                Back
              </Button>
            </>
          )}
          {status === 'back' && (
            <Button color="red" onClick={handleSignoff}>
              Signoff
            </Button>
          )}
        </Group>
      </Group>
      {/* Status & event times: only show after signed in */}
      {status !== 'signedout' && (
        <Group gap={8} style={{ marginTop: 8 }}>
          <Chip color="indigo" checked={true} variant="filled">
            Status: <b>{status}</b>
          </Chip>
          {eventTimes.signin && (
            <Chip color="green" checked={true} variant="filled">
              Signin: {eventTimes.signin}
            </Chip>
          )}
          {eventTimes.afk && (
            <Chip color="yellow" checked={true} variant="filled">
              AFK: {eventTimes.afk} ({afkEta} min)
            </Chip>
          )}
          {eventTimes.back && (
            <Chip color="cyan" checked={true} variant="filled">
              Back: {eventTimes.back}
            </Chip>
          )}
          {eventTimes.signoff && (
            <Chip color="red" checked={true} variant="filled">
              Signoff: {eventTimes.signoff}
            </Chip>
          )}
        </Group>
      )}
    </Card>
  );
}
