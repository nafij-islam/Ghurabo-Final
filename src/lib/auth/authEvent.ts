/**
 * Utility for dispatching and listening to authentication state change events across the application.
 */

export const AUTH_CHANGE_EVENT = 'ghurabo-auth-state-change';

export function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
}
