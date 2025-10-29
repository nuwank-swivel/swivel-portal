import React from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { setPresence, getPresence } from '@/lib/api/presence';
import { PresenceEventRecord, PresenceEventType } from '@swivel-portal/types';
import { getEtaTime } from '../components/AvailabilityPanel';
import moment from 'moment';

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
  const [loading, setLoading] = React.useState({
    signin: false,
    signoff: false,
    afk: false,
    back: false,
    presence: true,
  });

  React.useEffect(() => {
    async function fetchPresence() {
      setLoading((l) => ({ ...l, presence: true }));
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
        times.signin = moment(signinEvent.timestamp).format('h:mm A');
      }
      events.forEach((e) => {
        if (e.event === PresenceEventType.Signoff)
          times.signoff = moment(e.timestamp).format('h:mm A');
        if (e.event === PresenceEventType.Afk)
          times.afk.push(moment(e.timestamp).format('h:mm A'));
        if (e.event === PresenceEventType.Back)
          times.back.push(moment(e.timestamp).format('h:mm A'));
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
      setLoading((l) => ({ ...l, presence: false }));
    }
    fetchPresence();
  }, [today]);

  const handleSignin = async () => {
    setLoading((l) => ({ ...l, signin: true }));
    await setPresence(PresenceEventType.Signin);
    setStatus(PresenceEventType.Signin);
    setEventTimes((t) => ({
      ...t,
      signin: t.signin || new Date().toLocaleTimeString(),
    }));
    setLoading((l) => ({ ...l, signin: false }));
  };
  const handleSignoff = async () => {
    setLoading((l) => ({ ...l, signoff: true }));
    await setPresence(PresenceEventType.Signoff);
    setStatus(PresenceEventType.Signoff);
    setEventTimes((t) => ({
      ...t,
      signoff: new Date().toLocaleTimeString(),
      signin: t.signin,
    }));
    setLoading((l) => ({ ...l, signoff: false }));
  };
  const handleAfk = async (eta?: number, customMessage?: string) => {
    setLoading((l) => ({ ...l, afk: true }));
    const etaMinutes = eta ?? afkEta;
    const etaTime = getEtaTime(etaMinutes);
    let message = customMessage;
    if (!message) {
      message = `AFK - ETA ${etaTime}`;
    }
    await setPresence(PresenceEventType.Afk, etaMinutes, message);
    setStatus(PresenceEventType.Afk);
    setEventTimes((t) => ({
      ...t,
      afk: [...(t.afk || []), new Date().toLocaleTimeString()],
      signin: t.signin,
    }));
    setLoading((l) => ({ ...l, afk: false }));
  };
  const handleBack = async () => {
    setLoading((l) => ({ ...l, back: true }));
    await setPresence(PresenceEventType.Back);
    setStatus(PresenceEventType.Back);
    setEventTimes((t) => ({
      ...t,
      back: [...(t.back || []), new Date().toLocaleTimeString()],
      signin: t.signin,
    }));
    setLoading((l) => ({ ...l, back: false }));
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
    loading,
  };
}
