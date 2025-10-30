import React from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { setPresence, getPresence } from '@/lib/api/presence';
import { PresenceEventRecord, PresenceEventType } from '@swivel-portal/types';
import { getEtaTime } from '../components/AvailabilityPanel';
import moment from 'moment';
import { usePresenceState } from '@/lib/state/presenceState';

export function useAvailabilityPanel() {
  const [afkEta, setAfkEta] = React.useState(60); // minutes

  const fetched = usePresenceState((state) => state.fetched);
  const signin = usePresenceState((state) => state.signin);
  const signoff = usePresenceState((state) => state.signoff);
  const afk = usePresenceState((state) => state.afk);
  const back = usePresenceState((state) => state.back);
  const status = usePresenceState((state) => state.status);
  const eventTimes = { fetched, signin, signoff, afk, back };

  const setPresenceState = usePresenceState((state) => state.setPresenceState);
  const setStatus = usePresenceState((state) => state.setStatus);

  const { user, refreshAuth } = useAuthContext();
  const [today, setToday] = React.useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = React.useState({
    signin: false,
    signoff: false,
    afk: false,
    back: false,
    presence: false,
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
      setPresenceState({ fetched: true, ...times });
      if (events.length > 0) {
        lastStatus = events[0].event as PresenceEventType;
      }
      if (lastStatus === PresenceEventType.Afk) {
        setStatus(PresenceEventType.Afk);
      } else if (times.signin) {
        setStatus(lastStatus);
      } else {
        setStatus(PresenceEventType.Signoff);
      }
      setLoading((l) => ({ ...l, presence: false }));
    }
    console.log('Fetching presence...', eventTimes);
    if (eventTimes.fetched === false) {
      fetchPresence();
    }
  }, [today]);

  const handleSignin = async () => {
    setLoading((l) => ({ ...l, signin: true }));
    await setPresence(PresenceEventType.Signin);
    setStatus(PresenceEventType.Signin);
    setPresenceState({
      ...eventTimes,
      signin: new Date().toLocaleTimeString(),
    });
    setLoading((l) => ({ ...l, signin: false }));
  };

  const handleSignoff = async () => {
    setLoading((l) => ({ ...l, signoff: true }));
    await setPresence(PresenceEventType.Signoff);
    setStatus(PresenceEventType.Signoff);
    setPresenceState({
      ...eventTimes,
      signoff: new Date().toLocaleTimeString(),
    });
    setLoading((l) => ({ ...l, signoff: false }));
  };

  const handleAfk = async (eta?: number, customMessage?: string) => {
    setLoading((l) => ({ ...l, afk: true }));

    await refreshAuth();

    const etaMinutes = eta ?? afkEta;
    const etaTime = getEtaTime(etaMinutes);
    let message = customMessage;
    if (!message) {
      message = `AFK - ETA ${etaTime}`;
    }
    await setPresence(PresenceEventType.Afk, etaMinutes, message);
    setStatus(PresenceEventType.Afk);
    setPresenceState({
      ...eventTimes,
      afk: [...(eventTimes.afk || []), new Date().toLocaleTimeString()],
    });
    setLoading((l) => ({ ...l, afk: false }));
  };

  const handleBack = async () => {
    setLoading((l) => ({ ...l, back: true }));

    await refreshAuth();

    await setPresence(PresenceEventType.Back);
    setStatus(PresenceEventType.Back);
    setPresenceState({
      ...eventTimes,
      back: [...(eventTimes.back || []), new Date().toLocaleTimeString()],
    });
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
