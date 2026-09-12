/**
 * Lightweight Google Identity Services (GSI) Integration
 * Replaces the heavy Firebase Client SDK (~500KB) with Google's official GSI script
 */

export interface GoogleAuthResult {
  idToken: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
  sub?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: 'standard' | 'icon';
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: number;
              locale?: string;
            }
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';
let gsiScriptPromise: Promise<void> | null = null;

export function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (gsiScriptPromise) {
    return gsiScriptPromise;
  }

  gsiScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GSI_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }

    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      gsiScriptPromise = null;
      reject(new Error('Failed to load Google Identity Services script'));
    };
    document.head.appendChild(script);
  });

  return gsiScriptPromise;
}

function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Initiates Google Identity Services authentication and resolves with verified Google ID token
 */
export async function triggerGoogleSignIn(): Promise<GoogleAuthResult> {
  await loadGsiScript();

  if (!window.google?.accounts?.id) {
    throw new Error('Google Identity Services is not available');
  }

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '1047717467645-default.apps.googleusercontent.com';

  return new Promise<GoogleAuthResult>((resolve, reject) => {
    let resolved = false;

    window.google!.accounts.id.initialize({
      client_id: clientId,
      cancel_on_tap_outside: false,
      callback: (response) => {
        if (!response.credential) {
          reject(new Error('No credential returned from Google'));
          return;
        }

        resolved = true;
        const payload = parseJwt(response.credential);
        resolve({
          idToken: response.credential,
          email: payload?.email,
          fullName: payload?.name,
          avatarUrl: payload?.picture,
          sub: payload?.sub,
        });
      },
    });

    window.google!.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        if (!resolved) {
          reject(new Error(`Google Sign-In prompt not displayed (${reason || 'blocked'})`));
        }
      } else if (notification.isSkippedMoment()) {
        if (!resolved) {
          reject(new Error('Google Sign-In was dismissed'));
        }
      }
    });
  });
}

/**
 * Disables Google Auto-Select session
 */
export function googleSignOut(): void {
  try {
    if (typeof window !== 'undefined' && window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  } catch (err) {
    // Non-blocking
  }
}
