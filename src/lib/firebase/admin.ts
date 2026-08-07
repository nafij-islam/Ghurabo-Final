import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

let adminAuthInstance: Auth | null = null;

export function getAdminAuth(): Auth {
  if (adminAuthInstance) {
    return adminAuthInstance;
  }

  if (getApps().length > 0) {
    adminAuthInstance = getAuth(getApp());
    return adminAuthInstance;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || 'ghurabo-a4960';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@ghurabo-a4960.iam.gserviceaccount.com';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || '';

  if (privateKey) {
    privateKey = privateKey.trim();
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
      privateKey = privateKey.slice(1, -1);
    }
    privateKey = privateKey.replace(/\\n/g, '\n');
  }

  const app = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  adminAuthInstance = getAuth(app);
  return adminAuthInstance;
}

// Backward compatibility export
export const adminAuth = {
  verifyIdToken: async (idToken: string) => {
    const auth = getAdminAuth();
    return await auth.verifyIdToken(idToken);
  },
};
