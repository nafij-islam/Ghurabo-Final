import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminAuthInstance: Auth | null = null;

export function getAdminAuth(): Auth | null {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  try {
    if (getApps().length > 0) {
      adminAuthInstance = getAuth(getApp());
      return adminAuthInstance;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID || 'ghurabo-final';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@ghurabo-final.iam.gserviceaccount.com';
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');

    const app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });

    adminAuthInstance = getAuth(app);
    return adminAuthInstance;
  } catch (err: any) {
    console.warn('Firebase Admin SDK initialization skipped:', err?.message || err);
    return null;
  }
}

export interface VerifiedTokenUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}

export const adminAuth = {
  verifyIdToken: async (idToken: string): Promise<VerifiedTokenUser> => {
    // 1. Primary: Try Firebase Admin SDK if service account is fully valid
    try {
      const auth = getAdminAuth();
      if (auth) {
        const decoded = await auth.verifyIdToken(idToken);
        return {
          uid: decoded.uid,
          email: decoded.email || '',
          name: decoded.name,
          picture: decoded.picture,
          email_verified: decoded.email_verified,
        };
      }
    } catch (adminErr: any) {
      console.warn('Firebase Admin SDK verification failed, falling back to Google verification endpoints:', adminErr?.message || adminErr);
    }

    // 2. High-reliability fallback: Google Identity Toolkit REST API
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyALFR87taTXWxvsT8QEWkKYK4wxOxQ6Py8';
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          const u = data.users[0];
          return {
            uid: u.localId,
            email: u.email,
            name: u.displayName,
            picture: u.photoUrl,
            email_verified: u.emailVerified,
          };
        }
      }
    } catch (apiErr: any) {
      console.warn('Google Identity Toolkit lookup error:', apiErr?.message);
    }

    // 3. Secondary fallback: Google OAuth2 Tokeninfo
    try {
      const res2 = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2.email) {
          return {
            uid: data2.sub || data2.user_id,
            email: data2.email,
            name: data2.name,
            picture: data2.picture,
            email_verified: data2.email_verified === 'true' || data2.email_verified === true,
          };
        }
      }
    } catch (e2: any) {
      console.warn('Google Tokeninfo lookup error:', e2?.message);
    }

    throw new Error('Unable to verify Google ID token. Please ensure your account is authenticated.');
  },
};
