import React from 'react';
import { useAuthContext } from '@/lib/AuthContext';

export type AvailabilityStatus = 'signedout' | 'signedin' | 'afk' | 'back';

export function useAvailabilityPanel() {
  const [status, setStatus] = React.useState<AvailabilityStatus>('signedout');
  const [afkEta, setAfkEta] = React.useState(60); // minutes
  const [eventTimes, setEventTimes] = React.useState<{
    signin?: string;
    signoff?: string;
    afk?: string;
    back?: string;
  }>({});
  const { user } = useAuthContext();

  // Handlers (stubbed, will call backend later)
  const handleSignin = () => {
    setStatus('signedin');
    setEventTimes((t) => ({ ...t, signin: new Date().toLocaleTimeString() }));
  };
  const handleSignoff = () => {
    setStatus('signedout');
    setEventTimes((t) => ({ ...t, signoff: new Date().toLocaleTimeString() }));
  };
  const handleAfk = () => {
    setStatus('afk');
    setEventTimes((t) => ({ ...t, afk: new Date().toLocaleTimeString() }));
  };
  const handleBack = () => {
    setStatus('back');
    setEventTimes((t) => ({ ...t, back: new Date().toLocaleTimeString() }));
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