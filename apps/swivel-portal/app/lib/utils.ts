import { PresenceEventType } from '@swivel-portal/types';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Helper to get display name for status
export function getStatusDisplayName(status: PresenceEventType): string {
  switch (status) {
    case PresenceEventType.Signin:
      return 'Available';
    case PresenceEventType.Signoff:
      return 'Signed off';
    case PresenceEventType.Afk:
      return 'AFK';
    case PresenceEventType.Back:
      return 'Available';
    default:
      return status;
  }
}
