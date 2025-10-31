import React from 'react';
import { useAuthContext } from '@/lib/AuthContext';
import { setPresence, getPresence } from '@/lib/api/presence';
import { PresenceEventRecord, PresenceEventType } from '@swivel-portal/types';
import { getEtaTime } from '../components/AvailabilityPanel';
import moment from 'moment';
import { usePresenceState } from '@/lib/state/presenceState';
import { Logger } from '@/lib/logger';

export function useAvailabilityPanel() {
  const [afkEta, setAfkEta] = React.useState(60); // minutes

  const fetched = usePresenceState((state) => state.fetched);
  const signin = usePresenceState((state) => state.signin);
  const signoff = usePresenceState((state) => state.signoff);
  const afk = usePresenceState((state) => state.afk);
  const back = usePresenceState((state) => state.back);
  const status = usePresenceState((state) => state.status);
  const eventTimes = React.useMemo(
    () => ({ fetched, signin, signoff, afk, back }),
    [afk, back, fetched, signin, signoff]
  );

  const setPresenceState = usePresenceState((state) => state.setPresenceState);
  const setStatus = usePresenceState((state) => state.setStatus);

  const { user, refreshAuth } = useAuthContext();
  const [today] = React.useState<string>(new Date().toISOString().slice(0, 10));
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
      Logger.debug('[presence] Fetching timeline', {
        date: today,
        userId: user?.azureAdId,
      });
      try {
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
        Logger.info('[presence] Timeline loaded', {
          date: today,
          userId: user?.azureAdId,
          events: events.length,
          status: lastStatus,
        });
      } catch (error) {
        Logger.error('[presence] Failed to fetch timeline', {
          date: today,
          userId: user?.azureAdId,
          error,
        });
      } finally {
        setLoading((l) => ({ ...l, presence: false }));
      }
    }
    if (eventTimes.fetched === false) {
      fetchPresence();
    }
  }, [eventTimes, setPresenceState, setStatus, today, user?.azureAdId]);

  const handleSignin = async () => {
    setLoading((l) => ({ ...l, signin: true }));
    Logger.info('[presence] Sign-in requested', {
      userId: user?.azureAdId,
    });
    try {
      await setPresence(PresenceEventType.Signin);
      setStatus(PresenceEventType.Signin);
      setPresenceState({
        ...eventTimes,
        signin: moment(new Date()).format('h:mm A'),
      });
      Logger.info('[presence] Sign-in recorded', {
        userId: user?.azureAdId,
      });
    } catch (error) {
      Logger.error('[presence] Failed to record sign-in', {
        userId: user?.azureAdId,
        error,
      });
    } finally {
      setLoading((l) => ({ ...l, signin: false }));
    }
  };

  const handleSignoff = async () => {
    setLoading((l) => ({ ...l, signoff: true }));
    Logger.info('[presence] Sign-off requested', {
      userId: user?.azureAdId,
    });
    try {
      await setPresence(PresenceEventType.Signoff);
      setStatus(PresenceEventType.Signoff);
      setPresenceState({
        ...eventTimes,
        signoff: moment(new Date()).format('h:mm A'),
      });
      Logger.info('[presence] Sign-off recorded', {
        userId: user?.azureAdId,
      });
    } catch (error) {
      Logger.error('[presence] Failed to record sign-off', {
        userId: user?.azureAdId,
        error,
      });
    } finally {
      setLoading((l) => ({ ...l, signoff: false }));
    }
  };

  const handleAfk = async (eta?: number, customMessage?: string) => {
    setLoading((l) => ({ ...l, afk: true }));
    const etaMinutes = eta ?? afkEta;
    Logger.info('[presence] AFK requested', {
      userId: user?.azureAdId,
      eta: etaMinutes,
    });

    try {
      await refreshAuth();

      const etaTime = getEtaTime(etaMinutes);
      let message = customMessage;
      if (!message) {
        message = `AFK - ETA ${etaTime}`;
      }
      await setPresence(PresenceEventType.Afk, etaMinutes, message);
      setStatus(PresenceEventType.Afk);
      setPresenceState({
        ...eventTimes,
        afk: [...(eventTimes.afk || []), moment(new Date()).format('h:mm A')],
      });
      Logger.info('[presence] AFK recorded', {
        userId: user?.azureAdId,
        eta: etaMinutes,
      });
    } catch (error) {
      Logger.error('[presence] Failed to set AFK status', {
        userId: user?.azureAdId,
        error,
      });
    } finally {
      setLoading((l) => ({ ...l, afk: false }));
    }
  };

  const handleBack = async () => {
    setLoading((l) => ({ ...l, back: true }));
    Logger.info('[presence] Back status requested', {
      userId: user?.azureAdId,
    });

    try {
      await refreshAuth();

      await setPresence(PresenceEventType.Back);
      setStatus(PresenceEventType.Back);
      setPresenceState({
        ...eventTimes,
        back: [...(eventTimes.back || []), moment(new Date()).format('h:mm A')],
      });
      Logger.info('[presence] Back status recorded', {
        userId: user?.azureAdId,
      });
    } catch (error) {
      Logger.error('[presence] Failed to set back status', {
        userId: user?.azureAdId,
        error,
      });
    } finally {
      setLoading((l) => ({ ...l, back: false }));
    }
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
