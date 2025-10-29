import React from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { setPresence, getPresence } from '@/lib/api/presence';
import { PresenceEventRecord, PresenceEventType } from '@swivel-portal/types';

export function useAvailabilityPanel() {
  const [status, setStatus] = React.useState<PresenceEventType>(
    PresenceEventType.Signoff
  );
  const [afkEta, setAfkEta] = React.useState(60); // minutes
  const [eventTimes, setEventTimes] = React.useState<{
    signin?: string;
    signoff?: string;
    afk: string[];
    back: string[];
  }>({ afk: [], back: [] });
  const { user } = useAuthContext();
  const [today, setToday] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  React.useEffect(() => {
    async function fetchPresence() {
      const events: PresenceEventRecord[] = await getPresence(today);
      const times: {
        signin?: string;
        signoff?: string;
        afk: string[];
        back: string[];
      } = { afk: [], back: [] };
      let lastStatus: PresenceEventType = PresenceEventType.Signoff;
      const signinEvent = events.find(
        (e) => e.event === PresenceEventType.Signin
      );
      if (signinEvent) {
        times.signin = new Date(signinEvent.timestamp).toLocaleTimeString();
      }
      events.forEach((e) => {
        if (e.event === PresenceEventType.Signoff)
          times.signoff = new Date(e.timestamp).toLocaleTimeString();
        if (e.event === PresenceEventType.Afk)
          times.afk.push(new Date(e.timestamp).toLocaleTimeString());
        if (e.event === PresenceEventType.Back)
          times.back.push(new Date(e.timestamp).toLocaleTimeString());
      });
      if (events.length > 0) {
        lastStatus = events[0].event as PresenceEventType;
      }
      setEventTimes(times);
      if (lastStatus === PresenceEventType.Afk) {
        setStatus(PresenceEventType.Afk);
      } else if (times.signin) {
        setStatus(lastStatus);
      } else {
        setStatus(PresenceEventType.Signoff);
      }
    }
    fetchPresence();
  }, [today]);

  const handleSignin = async () => {
    await setPresence(PresenceEventType.Signin);
    setStatus(PresenceEventType.Signin);
    setEventTimes((t) => ({
      ...t,
      signin: t.signin || new Date().toLocaleTimeString(),
    }));
  };
  const handleSignoff = async () => {
    await setPresence(PresenceEventType.Signoff);
    setStatus(PresenceEventType.Signoff);
    setEventTimes((t) => ({
      ...t,
      signoff: new Date().toLocaleTimeString(),
      signin: t.signin,
    }));
  };
  const handleAfk = async (eta?: number, message?: string) => {
    await setPresence(PresenceEventType.Afk, eta ?? afkEta, message);
    setStatus(PresenceEventType.Afk);
    setEventTimes((t) => ({
      ...t,
      afk: [...(t.afk || []), new Date().toLocaleTimeString()],
      signin: t.signin,
    }));
  };
  const handleBack = async () => {
    await setPresence(PresenceEventType.Back);
    setStatus(PresenceEventType.Back);
    setEventTimes((t) => ({
      ...t,
      back: [...(t.back || []), new Date().toLocaleTimeString()],
      signin: t.signin,
    }));
  };

  // Greeting logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return {
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
  };
}
